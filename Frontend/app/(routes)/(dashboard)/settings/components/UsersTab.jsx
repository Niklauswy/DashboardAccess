'use client'
import { useState } from "react"
import useSWR from "swr"
import Papa from "papaparse"
import { useToast } from "@/components/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useUsers } from "@/hooks/useUsers"
import CsvUploader from "./CsvUploader"
import SerialUserCreator from "./SerialUserCreator"
import BatchResultsDialog from "./BatchResultsDialog"
import ErrorDialog from "./ErrorDialog"
import ProcessingDialog from "./ProcessingDialog"

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

                // Validar el CSV
                const aggregatedErrors = validateCsvRecords(records)d).{8,}$/;
                if (aggregatedErrors.length > 0) {
                    displayErrors(aggregatedErrors) aplica a todos los usuarios
                    setIsCsvProcessing(false)ltPassword)) {
                    setIsReviewing(false)ntraseña debe contener al menos una letra mayúscula, una minúscula y un número, y tener al menos 8 caracteres."]);
                    returnsvProcessing(false)
                }   setIsReviewing(false)
                    return
                // Procesar registros
                const results = {
                    success: [],sto de los campos
                    errors: []edErrors = validateCsvRecords(records)
                }f (aggregatedErrors.length > 0) {
                    displayErrors(aggregatedErrors)
                // Procesar los registroslse)
                for (let i = 0; i < records.length; i++) {
                    const row = records[i]
                    const padded = [...row]
                    while (padded.length < 5) {
                        padded.push("")
                    } results = {
                    success: [],
                    const userData = {
                        samAccountName: padded[0].trim(),
                        givenName: padded[1].trim(),
                        sn: padded[2].trim(),
                        password: defaultPassword,; i++) {
                        ou: padded[3].trim(),
                        groups: padded[4].trim() ? [padded[4].trim()] : []
                    }hile (padded.length < 5) {
                        padded.push("")
                    try {
                        await createUser(userData)
                        t userData = {
                        results.success.push({[0].trim(),
                            username: userData.samAccountName,
                            fullName: `${userData.givenName} ${userData.sn}`,
                            ou: userData.ou,sword,
                            groups: userData.groups
                        })oups: padded[4].trim() ? [padded[4].trim()] : []
                        
                        // Eliminamos el toast por usuario creado
                    } catch (error) {
                        results.errors.push({Data)
                            username: userData.samAccountName,
                            fullName: `${userData.givenName} ${userData.sn}`,
                            errorMessage: error.message || "Error desconocido"
                        })  fullName: `${userData.givenName} ${userData.sn}`,
                    }       ou: userData.ou,
                            groups: userData.groups
                    // Actualizar progreso
                    setProgress(Math.round(((i + 1) / records.length) * 100))
                }       // Eliminamos el toast por usuario creado
                    } catch (error) {
                // Finalizar procesamientoh({
                setIsCsvProcessing(false)rData.samAccountName,
                setIsReviewing(false) `${userData.givenName} ${userData.sn}`,
                await refreshUsers()sage: error.message || "Error desconocido"
                        })
                // Mostrar resultados solo al final
                setBatchResults(results)
                setShowResultsDialog(true)
                    setProgress(Math.round(((i + 1) / records.length) * 100))
                // Notificar el resultado final una sola vez
                if (results.success.length > 0) {
                    toast({r procesamiento
                        title: "Proceso completado",
                        description: `Se crearon ${results.success.length} usuarios${results.errors.length > 0 ? ` (con ${results.errors.length} errores)` : ''}.`,
                        variant: results.errors.length === 0 ? "success" : "default",
                    });
                }/ Mostrar resultados solo al final
                setBatchResults(results)
            } catch (error) {sDialog(true)
                handleProcessingError(error, "Error en CSV")
            }   // Notificar el resultado final una sola vez
        }       if (results.success.length > 0) {
        reader.readAsText(csvFile)
    }                   title: "Proceso completado",
                        description: `Se crearon ${results.success.length} usuarios${results.errors.length > 0 ? ` (con ${results.errors.length} errores)` : ''}.`,
    // Validar registros CSVant: results.errors.length === 0 ? "success" : "default",
    const validateCsvRecords = (records) => {
        const errors = []
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
            } catch (error) {
        records.forEach((row, index) => {or, "Error en CSV")
            // Ahora requiere exactamente 5 campos (todos los atributos son obligatorios)
            if (row.length !== 5) {
                errors.push(`Fila ${index + 1}: Se esperan exactamente 5 campos pero se recibieron ${row.length}.`);
                return;
            }
            ar registros CSV
            // Validar que todos los campos tienen datos
            for (let i = 0; i < 5; i++) {
                if (!row[i].trim()) {[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
                    const fieldName = ["Usuario", "Nombre", "Apellido", "Carrera (OU)", "Grupo"][i];
                    errors.push(`Fila ${index + 1}: El campo '${fieldName}' es obligatorio.`);
                }ora requiere exactamente 5 campos (todos los atributos son obligatorios)
            }f (row.length !== 5) {
                errors.push(`Fila ${index + 1}: Se esperan exactamente 5 campos pero se recibieron ${row.length}.`);
            // Validar que la OU existe
            if (!ous || !ous.includes(row[3].trim())) {
                errors.push(`Fila ${index + 1}: La carrera (OU) '${row[3].trim()}' no existe.`);
            }/ Validar que todos los campos tienen datos
            for (let i = 0; i < 5; i++) {
            // Validar que el grupo existe
            if (!groups || !groups.includes(row[4].trim())) {Apellido", "Carrera (OU)", "Grupo"][i];
                errors.push(`Fila ${index + 1}: El grupo '${row[4].trim()}' no existe.`);o.`);
            }   }
            }
            // No podemos validar la contraseña aquí ya que es proporcionada por el usuario en la interfaz
        }); // Validar que la OU existe
            if (!ous || !ous.includes(row[3].trim())) {
        // Validar la contraseña global para todos los usuarios '${row[3].trim()}' no existe.`);
        if (defaultPassword && !passwordRegex.test(defaultPassword)) {
            errors.push("La contraseña debe contener al menos una letra mayúscula, una minúscula y un número, y tener al menos 8 caracteres.");
        }   // Validar que el grupo existe
            if (!groups || !groups.includes(row[4].trim())) {
        return errors;.push(`Fila ${index + 1}: El grupo '${row[4].trim()}' no existe.`);
    }       }

    // Mostrar errores en el diálogo contraseña aquí ya que es proporcionada por el usuario en la interfaz
    const displayErrors = (errors) => {
        const maxDisplay = 10
        let displayedErrors = errors.slice(0, maxDisplay)uarios
        const extraCount = errors.length - maxDisplayfaultPassword)) {
        if (extraCount > 0) {ontraseña debe contener al menos una letra mayúscula, una minúscula y un número, y tener al menos 8 caracteres.");
            displayedErrors.push(`... y ${extraCount} fila${extraCount > 1 ? 's' : ''} más tienen errores.`)
        }
        setErrorMessages(displayedErrors)
        setErrorDialogOpen(true)
    }
    // Mostrar errores en el diálogo
    // Procesar registros del CSV) => {
    const processCsvRecords = async (records, defaultPassword) => {
        const results = {rs = errors.slice(0, maxDisplay)
            success: [], = errors.length - maxDisplay
            errors: [] > 0) {
        }   displayedErrors.push(`... y ${extraCount} fila${extraCount > 1 ? 's' : ''} más tienen errores.`)
        }
        for (const row of records) {rors)
            const userData = {e)
                samAccountName: row[0].trim(),
                givenName: row[1].trim(),
                sn: row[2].trim(),
                password: defaultPassword,ds, defaultPassword) => {
                ou: row[3].trim(),
                groups: [row[4].trim()] // Ahora es obligatorio un grupo
            }rrors: []
            
            try {
                await createUser(userData)
                t userData = {
                results.success.push({.trim(),
                    username: userData.samAccountName,
                    fullName: `${userData.givenName} ${userData.sn}`,
                    ou: userData.ou,sword,
                    groups: userData.groups
                })oups: [row[4].trim()] // Ahora es obligatorio un grupo
                
                // Eliminamos el toast por usuario creado
            } catch (error) {
                results.errors.push({Data)
                    username: userData.samAccountName,
                    fullName: `${userData.givenName} ${userData.sn}`,
                    errorMessage: error.message || "Error desconocido"
                })  fullName: `${userData.givenName} ${userData.sn}`,
            }       ou: userData.ou,
        }           groups: userData.groups
                })
        return results
    }           // Eliminamos el toast por usuario creado
            } catch (error) {
    // Manejar errores de procesamiento
    const handleProcessingError = (error, title) => {,
        setIsCsvProcessing(false)userData.givenName} ${userData.sn}`,
        setIsSerialProcessing(false)ror.message || "Error desconocido"
        setIsReviewing(false)
        toast({
            title,
            description: error.message || "Error durante el procesamiento.",
            variant: "destructive",
        })
    }
    // Manejar errores de procesamiento
    // Crear usuarios en serier = (error, title) => {
    const handleCreateSerialUsers = async (options) => {
        setIsSerialProcessing(true))
        setProgress(0)(false)
        toast({
        // Validar que la opción de OU no sea "none" (que no tenemos en AddUser.pl)
        if (options.ou === "none") { error.message || "Error durante el procesamiento.",
            toast({destructive",
                title: "Error de validación",)
                description: "Debe seleccionar una carrera válida",
                variant: "destructive",
            });
            setIsSerialProcessing(false);
            return;true)
        }
        
        // Validar que haya al menos un grupo seleccionado
        if (!options.groups || options.groups.length === 0) {
            toast({
                title: "Error de validación",
                description: "Debe seleccionar al menos un grupo",
                variant: "destructive",(let i = 1; i <= options.quantity; i++) {
            }); number = String(i).padStart(2, "0")
            setIsSerialProcessing(false);efix}${number}`
            return;t userData = {
        }me,
        ername,
        // Resto del código para crear los usuarios...
        const results = {
            success: [],: options.ou,
            errors: []groups: options.groups
        }
        
        for (let i = 1; i <= options.quantity; i++) {
            const number = String(i).padStart(2, "0")ser(userData)
            const username = `${options.prefix}${number}`
            const userData = {sults.success.push({
                samAccountName: username,       username,
                givenName: username,        ou: userData.ou,
                sn: "FC",ta.groups
                password: options.password,
                ou: options.ou,       
                groups: options.groups        // Eliminamos el toast por usuario creado
            }
            rs.push({
            try {            username,
                await createUser(userData)age || "Error desconocido"
                
                results.success.push({
                    username,            
                    ou: userData.ou,       // Actualizar progreso
                    groups: userData.groups            setProgress(Math.round((i / options.quantity) * 100))
                })
                
                // Eliminamos el toast por usuario creado
            } catch (error) {s()
                results.errors.push({
                    username,
                    errorMessage: error.message || "Error desconocido"
                })ue)
            }
            
            // Actualizar progreso
            setProgress(Math.round((i / options.quantity) * 100))
        }
        
        setIsSerialProcessing(false)
        await refreshUsers()eCsvUpload}
          isUploading={isCsvProcessing}
        // Mostrar resumen completo al final                groups={groups || []}
        setBatchResults(results)
        setShowResultsDialog(true)

    }

    return (
        <div className="space-y-6">
            {/* Componente para subir CSVs */} || []}
            <CsvUploader 
                onUpload={handleCsvUpload}
                isUploading={isCsvProcessing}
                groups={groups || []}{/* Diálogo de revisión CSV */}
                ous={ous || []} && (
            />true} onOpenChange={() => {}}>
            x]">
            {/* Componente para crear usuarios en serie */}ame="space-y-4">
            <SerialUserCreator               <h3 className="text-lg font-semibold">Revisando CSV...</h3>
                onCreateUsers={handleCreateSerialUsers}                <p className="text-sm">Validando el archivo, por favor espere.</p>
                isCreating={isSerialProcessing}
                groups={groups || []}ent>
                ous={ous || []}
            />

            {/* Diálogo de revisión CSV */}* Diálogo de procesamiento */}
            {isReviewing && !isCsvProcessing && (            <ProcessingDialog 
                <Dialog open={true} onOpenChange={() => {}}>svProcessing || isSerialProcessing}
                    <DialogContent className="sm:max-w-[600px]">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Revisando CSV...</h3>
                            <p className="text-sm">Validando el archivo, por favor espere.</p>* Diálogos para resultados y errores */}
                        </div>atchResultsDialog 
                    </DialogContent>           open={showResultsDialog}
                </Dialog>               onOpenChange={setShowResultsDialog}























}    )        </div>            />                messages={errorMessages}                onOpenChange={setErrorDialogOpen}                open={errorDialogOpen}            <ErrorDialog             />                results={batchResults}                onOpenChange={setShowResultsDialog}                open={showResultsDialog}            <BatchResultsDialog             {/* Diálogos para resultados y errores */}                        />                progress={progress}                open={isCsvProcessing || isSerialProcessing}            <ProcessingDialog             {/* Diálogo de procesamiento */}                        )}                results={batchResults}
            />

            <ErrorDialog 
                open={errorDialogOpen}
                onOpenChange={setErrorDialogOpen}
                messages={errorMessages}
            />
        </div>
    )
}