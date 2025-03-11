'use client'
import { useState } from "react"
import useSWR from "swr"
import Papa from "papaparse"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useUsers } from "@/hooks/useUsers"
import CsvUploader from "./CsvUploader"
import SerialUserCreator from "./SerialUserCreator"
import BatchResultsDialog from "./BatchResultsDialog"
import ErrorDialog from "./ErrorDialog"
import ProcessingDialog from '@/components/ProcessingDialog';

const fetcher = (url) => fetch(url).then(res => res.json())

export default function UsersTab() {
    // Estados y hooks
    const [errorDialogOpen, setErrorDialogOpen] = useState(false)
    const [errorMessages, setErrorMessages] = useState([])
    const [isReviewing, setIsReviewing] = useState(false)
    const [isCsvProcessing, setIsCsvProcessing] = useState(false)
    const [isSerialProcessing, setIsSerialProcessing] = useState(false)
    const [batchResults, setBatchResults] = useState(null)
    const [showResultsDialog, setShowResultsDialog] = useState(false)
    const [progress, setProgress] = useState(0)
    const { toast } = useToast()
    const { createUser, refreshUsers } = useUsers();
    const { data: groups } = useSWR('/api/groups', fetcher)
    const { data: ous } = useSWR('/api/ous', fetcher)

    // Manejar la subida y procesamiento del CSV
    const handleCsvUpload = async (csvFile, defaultPassword) => {
        setIsReviewing(true)
        setIsCsvProcessing(true)
        setProgress(0)
        
        const reader = new FileReader()
        reader.onload = async (e) => {
            try {
                const csvText = e.target.result
                const csvResults = Papa.parse(csvText, { header: false, skipEmptyLines: true })
                const records = csvResults.data

                // Validar la contraseña global que aplica a todos los usuarios
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                if (!passwordRegex.test(defaultPassword)) {
                    displayErrors(["La contraseña debe contener al menos una letra mayúscula, una minúscula y un número, y tener al menos 8 caracteres."]);
                    setIsCsvProcessing(false)
                    setIsReviewing(false)
                    return
                }

                // Validar el CSV
                const aggregatedErrors = validateCsvRecords(records)
                if (aggregatedErrors.length > 0) {
                    displayErrors(aggregatedErrors)
                    setIsCsvProcessing(false)
                    setIsReviewing(false)
                    return
                }

                // Procesar registros
                const results = {
                    success: [],
                    errors: []
                }
                
                // Procesar los registros
                for (let i = 0; i < records.length; i++) {
                    const row = records[i]
                    const padded = [...row]
                    while (padded.length < 5) {
                        padded.push("")
                    }
                    
                    const userData = {
                        samAccountName: padded[0].trim(),
                        givenName: padded[1].trim(),
                        sn: padded[2].trim(),
                        password: defaultPassword,
                        ou: padded[3].trim(),
                        groups: [padded[4].trim()] // Ahora es obligatorio un grupo
                    }
                    
                    try {
                        await createUser(userData)
                        
                        results.success.push({
                            username: userData.samAccountName,
                            fullName: `${userData.givenName} ${userData.sn}`,
                            ou: userData.ou,
                            groups: userData.groups
                        })
                        
                        // Eliminamos el toast por usuario creado
                    } catch (error) {
                        results.errors.push({
                            username: userData.samAccountName,
                            fullName: `${userData.givenName} ${userData.sn}`,
                            errorMessage: error.message || "Error desconocido"
                        })
                    }
                    
                    // Actualizar progreso
                    setProgress(Math.round(((i + 1) / records.length) * 100))
                }
                
                // Finalizar procesamiento
                setIsCsvProcessing(false)
                setIsReviewing(false)
                await refreshUsers()
                
                // Mostrar resultados solo al final
                setBatchResults(results)
                setShowResultsDialog(true)
                
                // Notificar el resultado final una sola vez
                if (results.success.length > 0) {
                    toast({
                        title: "Proceso completado",
                        description: `Se crearon ${results.success.length} usuarios${results.errors.length > 0 ? ` (con ${results.errors.length} errores)` : ''}.`,
                        variant: results.errors.length === 0 ? "success" : "default",
                    });
                }
                
            } catch (error) {
                handleProcessingError(error, "Error en CSV")
            }
        }
        reader.readAsText(csvFile)
    }

    // Validar registros CSV
    const validateCsvRecords = (records) => {
        const errors = []
        
        records.forEach((row, index) => {
            // Ahora requiere exactamente 5 campos (todos los atributos son obligatorios)
            if (row.length !== 5) {
                errors.push(`Fila ${index + 1}: Se esperan exactamente 5 campos pero se recibieron ${row.length}.`);
                return;
            }
            
            // Validar que todos los campos tienen datos
            for (let i = 0; i < 5; i++) {
                if (!row[i].trim()) {
                    const fieldName = ["Usuario", "Nombre", "Apellido", "Carrera (OU)", "Grupo"][i];
                    errors.push(`Fila ${index + 1}: El campo '${fieldName}' es obligatorio.`);
                }
            }

            // Validar que la OU existe
            if (!ous || !ous.includes(row[3].trim())) {
                errors.push(`Fila ${index + 1}: La carrera (OU) '${row[3].trim()}' no existe.`);
            }

            // Validar que el grupo existe
            if (!groups || !groups.includes(row[4].trim())) {
                errors.push(`Fila ${index + 1}: El grupo '${row[4].trim()}' no existe.`);
            }
        });
        
        return errors;
    }

    // Mostrar errores en el diálogo
    const displayErrors = (errors) => {
        const maxDisplay = 10
        let displayedErrors = errors.slice(0, maxDisplay)
        const extraCount = errors.length - maxDisplay
        if (extraCount > 0) {
            displayedErrors.push(`... y ${extraCount} fila${extraCount > 1 ? 's' : ''} más tienen errores.`)
        }
        setErrorMessages(displayedErrors)
        setErrorDialogOpen(true)
    }

    // Manejar errores de procesamiento
    const handleProcessingError = (error, title) => {
        setIsCsvProcessing(false)
        setIsSerialProcessing(false)
        setIsReviewing(false)
        toast({
            title,
            description: error.message || "Error durante el procesamiento.",
            variant: "destructive",
        })
    }

    // Crear usuarios en serie
    const handleCreateSerialUsers = async (options) => {
        setIsSerialProcessing(true)
        setProgress(0)
        
        // Validar que la opción de OU no sea "none" (que no tenemos en AddUser.pl)
        if (options.ou === "none") {
            toast({
                title: "Error de validación",
                description: "Debe seleccionar una carrera válida",
                variant: "destructive",
            });
            setIsSerialProcessing(false);
            return;
        }
        
        // Validar que haya al menos un grupo seleccionado
        if (!options.groups || options.groups.length === 0) {
            toast({
                title: "Error de validación",
                description: "Debe seleccionar al menos un grupo",
                variant: "destructive",
            });
            setIsSerialProcessing(false);
            return;
        }
        
        const results = {
            success: [],
            errors: []
        }
        
        for (let i = 1; i <= options.quantity; i++) {
            const number = String(i).padStart(2, "0")
            const username = `${options.prefix}${number}`
            const userData = {
                samAccountName: username,
                givenName: username,
                sn: "FC",
                password: options.password,
                ou: options.ou,
                groups: options.groups
            }
            
            try {
                await createUser(userData)
                
                results.success.push({
                    username,
                    ou: userData.ou,
                    groups: userData.groups
                })
                
                // Eliminamos el toast por usuario creado
            } catch (error) {
                results.errors.push({
                    username,
                    errorMessage: error.message || "Error desconocido"
                })
            }
            
            // Actualizar progreso
            setProgress(Math.round((i / options.quantity) * 100))
        }
        
        setIsSerialProcessing(false)
        await refreshUsers()
        
        // Mostrar resumen completo al final
        setBatchResults(results)
        setShowResultsDialog(true)
        
        // Notificar el resultado final una sola vez
        if (results.success.length > 0) {
            toast({
                title: "Proceso completado",
                description: `Se crearon ${results.success.length} usuarios${results.errors.length > 0 ? ` (con ${results.errors.length} errores)` : ''}.`,
                variant: results.errors.length === 0 ? "success" : "default",
            });
        }
    }

    return (
        <div className="space-y-6">
            {/* Componente para subir CSVs */}
            <CsvUploader 
                onUpload={handleCsvUpload}
                isUploading={isCsvProcessing}
                groups={groups || []}
                ous={ous || []}
            />
            
            {/* Componente para crear usuarios en serie */}
            <SerialUserCreator 
                onCreateUsers={handleCreateSerialUsers}
                isCreating={isSerialProcessing}
                groups={groups || []}
                ous={ous || []}
            />

            {/* Diálogo de revisión CSV */}
            {isReviewing && !isCsvProcessing && (
                <Dialog open={true} onOpenChange={() => {}}>
                    <DialogContent className="sm:max-w-[600px]">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Revisando CSV...</h3>
                            <p className="text-sm">Validando el archivo, por favor espere.</p>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
            
            {/* Diálogo de procesamiento */}
            <ProcessingDialog 
                open={isCsvProcessing || isSerialProcessing}
                progress={progress}
            />
            
            {/* Diálogos para resultados y errores */}
            <BatchResultsDialog 
                open={showResultsDialog}
                onOpenChange={setShowResultsDialog}
                results={batchResults}
            />

            <ErrorDialog 
                open={errorDialogOpen}
                onOpenChange={setErrorDialogOpen}
                messages={errorMessages}
            />
        </div>
    )
}