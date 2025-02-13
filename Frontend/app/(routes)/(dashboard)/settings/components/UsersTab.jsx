'use client'
import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, FileSpreadsheet, Info } from "lucide-react"
import Papa from "papaparse"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

const fetcher = (url) => fetch(url).then(res => res.json())

export default function UsersTab() {
  const [csvFile, setCsvFile] = useState(null)
  const [defaultPassword, setDefaultPassword] = useState("")
  const [newUserPrefix, setNewUserPrefix] = useState("")
  const [newUserQuantity, setNewUserQuantity] = useState(1)
  const [newUserDefaultPassword, setNewUserDefaultPassword] = useState("")
  const [errorDialogOpen, setErrorDialogOpen] = useState(false)
  const [errorMessages, setErrorMessages] = useState([])
  const [isReviewing, setIsReviewing] = useState(false)
  const [serieOU, setSerieOU] = useState("")
  const [serieGroups, setSerieGroups] = useState([])
  const [seriePasswordError, setSeriePasswordError] = useState("")
  const [openSeriesGroups, setOpenSeriesGroups] = useState(false)
  const [csvPasswordError, setCsvPasswordError] = useState("")
  const { toast } = useToast()
  
  const validatePassword = (password) => {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/
    return regex.test(password)
  }

  const { data: groups } = useSWR('/api/groups', fetcher)
  const { data: ous } = useSWR('/api/ous', fetcher)

  const handleCsvDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    }
  }

  const handleCsvSelect = (e) => {
    const file = e.target.files?.[0]
    if (file && file.type === "text/csv") {
      setCsvFile(file)
    }
  }

  const handleUpload = async () => {
    if (!csvFile) return
    setIsReviewing(true)
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvText = e.target.result
        const results = Papa.parse(csvText, { header: false, skipEmptyLines: true })
        const records = results.data

        const aggregatedErrors = []
        records.forEach((row, index) => {
          if (row.length < 3 || row.length > 5) {
            aggregatedErrors.push(`Fila ${index + 1}: Se esperaban entre 3 y 5 campos pero se recibieron ${row.length}.`)
          } else {

            while (row.length < 5) {
              row.push("")
            }

            if (!row[0].trim() || !row[1].trim() || !row[2].trim()) {
              aggregatedErrors.push(`Fila ${index + 1}: Los primeros 3 campos son obligatorios y no deben estar vacíos.`)
            }

            if (row[3].trim() && ous && !ous.includes(row[3].trim())) {
              aggregatedErrors.push(`Fila ${index + 1}: La OU '${row[3].trim()}' no existe.`)
            }
            
            if (row[4].trim() && groups && !groups.includes(row[4].trim())) {
              aggregatedErrors.push(`Fila ${index + 1}: El grupo '${row[4].trim()}' no existe.`)
            }
          }
        })

        if (aggregatedErrors.length > 0) {
          const maxDisplay = 10
          let displayedErrors = aggregatedErrors.slice(0, maxDisplay)
          const extraCount = aggregatedErrors.length - maxDisplay
          if (extraCount > 0) {
            displayedErrors.push(`... y ${extraCount} fila${extraCount > 1 ? 's' : ''} más tienen errores.`)
          }
          setIsReviewing(false)
          setErrorMessages(displayedErrors)
          setErrorDialogOpen(true)
          return
        }

        let encounteredError = false
        for (const row of records) {
          while (row.length < 5) {
            row.push("")
          }
          const userData = {
            samAccountName: row[0].trim(),
            givenName: row[1].trim(),
            sn: row[2].trim(),
            password: defaultPassword,
            ou: row[3].trim(),   
            groups: row[4].trim() ? [row[4].trim()] : []
          }
          try {
            const res = await fetch("/api/users", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(userData)
            })
            const data = await res.json()
            console.log(data)
            if (!res.ok) {
              throw new Error(data.details || data.error || `Ocurrió un error al crear el usuario ${userData.samAccountName}.`)
            }
            toast({
              title: `Usuario ${userData.samAccountName} creado`,
              description: `El usuario ${userData.samAccountName} se creó correctamente.`,
            })
          } catch (error) {
            encounteredError = true
            toast({
              title: `Error creando ${userData.samAccountName}`,
              description: error.message,
              variant: "destructive",
            })
          }
        }
        setIsReviewing(false)
        setCsvFile(null)
        if (!encounteredError) {
          toast({
            title: "Procesamiento CSV",
            description: "Todos los usuarios han sido procesados exitosamente.",
          })
        }
      } catch (error) {
        setIsReviewing(false)
        toast({
          title: "Error en CSV",
          description: error.message || "Error al procesar el archivo CSV.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(csvFile)
  }

  const handleCreateUsers = async () => {
    if (!newUserDefaultPassword || !validatePassword(newUserDefaultPassword)) {
      setSeriePasswordError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y un dígito.")
      return
    }
    setSeriePasswordError("")
    for (let i = 1; i <= newUserQuantity; i++) {
      const number = String(i).padStart(2, "0")
      const username = `${newUserPrefix}${number}`
      const userData = {
        samAccountName: username,
        givenName: username,
        sn: "FC",
        password: newUserDefaultPassword,
        ou: serieOU === "none" ? "" : serieOU, 
        groups: serieGroups 
      }
      try {
        const res = await fetch("/api/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData)
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.details || data.error || `Error creando ${username}.`)
        }
        toast({
          title: `Usuario ${username} creado`,
          description: `El usuario ${username} se creó correctamente.`,
        })
      } catch (error) {
        toast({
          title: `Error creando ${username}`,
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Manejo de Usuarios</h2>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Importar CSV
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="ml-auto">
                  <Info className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[800px]">
                <DialogHeader>
                  <DialogTitle>Formato CSV</DialogTitle>
                  <DialogDescription>
                    El archivo CSV debe seguir este formato [Sin encabezados]:
                  </DialogDescription>
                </DialogHeader>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Apelllidos</TableHead>
                      <TableHead>OU (Carrera)</TableHead>
                      <TableHead>Grupo (Rol)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>AL12345</TableCell>
                      <TableCell>Goku</TableCell>
                      <TableCell>Son</TableCell>
                      <TableCell>CC</TableCell>
                      <TableCell>Estudiante</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>AL12346</TableCell>
                      <TableCell>Vegeta</TableCell>
                      <TableCell>Prince</TableCell>
                      <TableCell>BIO</TableCell>
                      <TableCell>Estudiante</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Invitado</TableCell>
                      <TableCell>Invitado01</TableCell>
                      <TableCell>FC</TableCell>
 
                    </TableRow>
                  </TableBody>
                </Table>
                <div className="mt-4 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
    <p className="text-sm text-gray-700">
      Se puede omitir la OU y el Grupo si no deseas asignarlos.
    </p>

  </div>
  <div className="mt-4 p-4 bg-gray-100 rounded">
    <p className="text-sm text-gray-700">
      Grupos permitidos: {groups ? groups.join(", ") : "Cargando..."}
    </p>
    <p className="text-sm text-gray-700">
      Unidades Organizacionales: {ous ? ous.join(", ") : "Cargando..."}
    </p>
  </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            onDragOver={handleCsvDrop}
            onDrop={handleCsvDrop}
            className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary"
          >
            <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400" />
            {csvFile ? (
              <p className="mt-2 font-medium">{csvFile.name}</p>
            ) : (
              <p className="mt-2">Arrastre y suelte o seleccione un archivo CSV</p>
            )}
            <input
              id="csv-upload"
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleCsvSelect}
            />
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => document.getElementById("csv-upload").click()}
            >
              Seleccione un archivo CSV
            </Button>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="default-password">Contraseña por defecto</Label>
            <Input
              id="default-password"
              type="password"
              value={defaultPassword}
              onChange={(e) => {
                const value = e.target.value
                setDefaultPassword(value)
                if (!validatePassword(value)) {
                  setCsvPasswordError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y un dígito.")
                } else {
                  setCsvPasswordError("")
                }
              }}
              placeholder="Ingrese la contraseña por defecto"
            />
            {csvPasswordError && <p className="text-sm text-destructive">{csvPasswordError}</p>}
            <Button className="mt-2" disabled={!defaultPassword} onClick={handleUpload}>
              Subir y Procesar Usuarios
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Crear Usuarios en Serie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="user-prefix">Prefijo</Label>
              <Input
                id="user-prefix"
                value={newUserPrefix}
                onChange={(e) => setNewUserPrefix(e.target.value)}
                placeholder="Ej: Invitado"
              />
            </div>
            <div>
              <Label htmlFor="user-quantity">Cantidad de Usuarios: {newUserQuantity}</Label>
              <Slider
                id="user-quantity"
                min={1}
                max={50}
                step={1}
                value={[newUserQuantity]}
                onValueChange={(value) => setNewUserQuantity(value[0])}
              />
              <span className="w-12 text-right">{newUserQuantity}</span>
            </div>
            <div>
              <Label htmlFor="user-default-password">Contraseña por defecto</Label>
              <Input
                id="user-default-password"
                type="password"
                value={newUserDefaultPassword}
                onChange={(e) => {
                  const value = e.target.value
                  setNewUserDefaultPassword(value)
                  if (!validatePassword(value)) {
                    setSeriePasswordError("La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y un dígito.")
                  } else {
                    setSeriePasswordError("")
                  }
                }}
                placeholder="Ingrese la contraseña"
              />
              {seriePasswordError && <p className="text-sm text-destructive">{seriePasswordError}</p>}
            </div>
            <div>
              <Label htmlFor="serie-ou">Carrera</Label>
              <Select value={serieOU} onValueChange={setSerieOU} id="serie-ou">
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione una carrera" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem key="empty" value="none">
                    Ninguna
                  </SelectItem>
                  {(ous || []).map((ou) => (
                    <SelectItem key={ou} value={ou}>
                      {ou}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Grupos</Label>
              <Popover open={openSeriesGroups} onOpenChange={setOpenSeriesGroups}>
                <PopoverTrigger asChild>
                  <Button variant="outline" role="combobox" aria-expanded={openSeriesGroups} className="w-full justify-between">
                    {serieGroups.length > 0 ? `${serieGroups.length} grupos seleccionados` : "Seleccione grupos"}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Buscar grupos..." />
                    <CommandList>
                      <CommandEmpty>No se encontraron grupos.</CommandEmpty>
                      <CommandGroup className="max-h-64 overflow-auto">
                        <CommandItem key="empty-groups" onSelect={() => setSerieGroups([])}>
                          Niguno
                        </CommandItem>
                        {(groups || []).map((group) => (
                          <CommandItem
                            key={group}
                            onSelect={() => {
                              setSerieGroups(serieGroups.includes(group)
                                ? serieGroups.filter((g) => g !== group)
                                : [...serieGroups, group])
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", serieGroups.includes(group) ? "opacity-100" : "opacity-0")} />
                            {group}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {serieGroups.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {serieGroups.map((group) => (
                    <Badge key={group} variant="secondary" className="flex items-center gap-1">
                      {group}
                      <X className="h-3 w-3 cursor-pointer" onClick={() => setSerieGroups(serieGroups.filter((g) => g !== group))} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <Button onClick={handleCreateUsers}>Crear Usuarios</Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Dialog to indicate CSV review process */}
      {isReviewing && (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-[600px]">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Revisando CSV...</h3>
              <p className="text-sm">Validando el archivo, por favor espere.</p>
            </div>
          </DialogContent>
        </Dialog>
      )}
      
      <Dialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-red-600">Errores en formato CSV</h3>
            <div className="space-y-2">
              {errorMessages.map((msg, idx) => (
                <p key={idx} className="text-sm text-gray-800">{msg}</p>
              ))}
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setErrorDialogOpen(false)}>Cerrar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
