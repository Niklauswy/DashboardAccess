"use client"

import { useState, useEffect } from "react"
import useSWR from 'swr'; // Importar useSWR para manejo eficiente de datos
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, FileSpreadsheet, HardDrive, AlertCircle, RotateCcw, Clock, Server, Info, Database, Home } from "lucide-react"

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General")
  const [domain, setDomain] = useState("example.com")
  const [hostname, setHostname] = useState("zenti")
  const [logRotation, setLogRotation] = useState(7)
  const [detailedLogging, setDetailedLogging] = useState(false)
  const [csvFile, setCsvFile] = useState(null)
  const [defaultPassword, setDefaultPassword] = useState("")
  const [syslogEntries, setSyslogEntries] = useState([])
  const [syslogError, setSyslogError] = useState(null); // Nuevo estado para errores de syslog
  // New state variables for creating users in series
  const [newUserPrefix, setNewUserPrefix] = useState("")
  const [newUserQuantity, setNewUserQuantity] = useState(1)
  const [newUserDefaultPassword, setNewUserDefaultPassword] = useState("")

  // Fetcher para SWR
  const fetcher = (url) => fetch(url).then(res => res.json());

  // Utilizar useSWR para systemInfo con actualización cada segundo
  const { data: systemInfo, error: systemInfoError } = useSWR('/api/systeminfo', fetcher, {
    refreshInterval: 1000, // Actualizar cada 1 segundo
  });

  // 1. Agregar useSWR para grupos y OUs
  const { data: groups, error: groupsError } = useSWR('/api/groups', fetcher);
  const { data: ous, error: ousError } = useSWR('/api/ous', fetcher);

  useEffect(() => {
    const fetchSyslog = async () => {
      try {
        const response = await fetch('/api/syslog');
        const result = await response.json();
        if (response.ok) {
          setSyslogEntries(result.syslog);
          setSyslogError(null); // Resetear error si la solicitud es exitosa
        } else {
          console.error(result.error);
          setSyslogError(result.error); // Establecer mensaje de error
        }
      } catch (error) {
        console.error('Error fetching syslog:', error);
        setSyslogError('Error fetching syslog'); // Establecer mensaje de error
      }
    };

    // Realizar la solicitud inicial
    fetchSyslog();

    // Configurar polling para syslog cada 5 segundos
    const syslogInterval = setInterval(fetchSyslog, 5000);

    return () => {
      clearInterval(syslogInterval);
    };
  }, [])

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

  const handleUpload = () => {
    if (csvFile) {
      // Here you would typically send the file to your server
      console.log("Uploading file:", csvFile.name)
      // Reset the file input after upload
      setCsvFile(null)
    }
  }

  const handleCreateUsers = () => {
    const users = []
    for (let i = 1; i <= newUserQuantity; i++) {
      const number = String(i).padStart(2, "0")
      users.push(`${newUserPrefix}${number}`)
    }
    console.log("Creating users:", users, "with default password:", newUserDefaultPassword)
    // ...your actual user creation logic here...
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Configuración</h1>

      <div className="tabs">
        <div className="flex space-x-4 border-b">
          <Button 
            variant={activeTab === "General" ? "primary" : "ghost"} 
            onClick={() => setActiveTab("General")}
          >
            General
          </Button>
          <Button 
            variant={activeTab === "Usuarios" ? "primary" : "ghost"} 
            onClick={() => setActiveTab("Usuarios")}
          >
            Usuarios
          </Button>
          <Button 
            variant={activeTab === "Grupos" ? "primary" : "ghost"} 
            onClick={() => setActiveTab("Grupos")}
          >
            Grupos
          </Button>
          <Button 
            variant={activeTab === "Unidades" ? "primary" : "ghost"} 
            onClick={() => setActiveTab("Unidades")}
          >
            Unidades Organizacionales
          </Button>
          <Button 
            variant={activeTab === "Logs" ? "primary" : "ghost"} 
            onClick={() => setActiveTab("Logs")}
          >
            Logs
          </Button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "General" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Server className="w-5 h-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {systemInfoError ? (
                <p className="text-red-500">{systemInfoError}</p>
              ) : (
                <>
                  <p><Clock className="inline w-4 h-4 mr-2" /> Time: {systemInfo?.time}</p>
                  <p><Home className="inline w-4 h-4 mr-2" /> Hostname: {hostname}</p>
                  <p><Server className="inline w-4 h-4 mr-2" /> Domain: {domain}</p>
                  <p><AlertCircle className="inline w-4 h-4 mr-2" /> Core version: {systemInfo?.coreVersion}</p>
                  <p><HardDrive className="inline w-4 h-4 mr-2" /> Software: {systemInfo?.software}</p>
                  <p><AlertCircle className="inline w-4 h-4 mr-2" /> System load: {systemInfo?.systemLoad}</p>
                  <p><Clock className="inline w-4 h-4 mr-2" /> Uptime: {systemInfo?.uptime}</p>
                  <p><Database className="inline w-4 h-4 mr-2" /> Storage: {systemInfo?.storage}</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
        {activeTab === "Usuarios" && (
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
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Formato CSV</DialogTitle>
                        <DialogDescription>
                          El archivo CSV debe seguir este formato:
                        </DialogDescription>
                      </DialogHeader>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Usuario</TableHead>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Apelllidos</TableHead>
                            <TableHead>OU (Carrera)</TableHead>
                            <TableHead>Grupo (Rol) [Estudiante, Invitado, Maestro]</TableHead>
                            
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

                        </TableBody>
                      </Table>
                      {/* New alert with available groups and OUs fetched from the API */}
                      <div className="mt-4 p-4 bg-gray-100 rounded">
                        <p className="text-sm text-gray-700">
                          Grupos permitidos: {groups ? groups.join(", ") : "Cargando..."}
                        </p>
                        <p className="text-sm text-gray-700">
                          Unidades Organizacionales permitidas: {ous ? ous.join(", ") : "Cargando..."}
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleCsvDrop}
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary"
                >
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-gray-400" />
                  <p className="mt-2">Arrastre y suelte un archivo CSV aquí, o haga clic para seleccionar</p>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvSelect}
                    className="hidden"
                    id="csv-upload"
                  />
                  <Label htmlFor="csv-upload" className="mt-2 inline-block">
                    <Button variant="outline" size="sm" as="span">
                      Seleccione un archivo CSV
                    </Button>
                  </Label>
                </div>
                {csvFile && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600">Archivo subido: {csvFile.name}</p>
                    <Button className="mt-2" onClick={handleUpload}>Subir y Procesar Usuarios</Button>
                  </div>
                )}
                <div className="space-y-4 mt-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-password">Contraseña por defecto</Label>
                    <Input
                      id="default-password"
                      type="password"
                      value={defaultPassword}
                      onChange={(e) => setDefaultPassword(e.target.value)}
                      placeholder="Ingrese la contraseña por defecto para nuevos usuarios"
                    />
                  </div>
                  <Button>Guardar Configuración</Button>
                </div>
              </CardContent>
            </Card>

            {/* New section for creating users in series */}
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
                  </div>
                  <div>
                    <Label htmlFor="user-default-password">Contraseña por defecto</Label>
                    <Input
                      id="user-default-password"
                      type="password"
                      value={newUserDefaultPassword}
                      onChange={(e) => setNewUserDefaultPassword(e.target.value)}
                      placeholder="Ingrese la contraseña"
                    />
                  </div>
                  <Button onClick={handleCreateUsers}>Crear Usuarios</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "Grupos" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Manejo de Grupos</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Grupos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupsError ? (
                  <p className="text-red-500">Error al cargar grupos</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {groups && groups.map((group, index) => (
                      <li key={index} className="mt-2">{group}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "Unidades" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Unidades Organizacionales</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Lista de Unidades Organizacionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ousError ? (
                  <p className="text-red-500">Error al cargar Unidades Organizacionales</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {ous && ous.map((ou, index) => (
                      <li key={index} className="mt-2">{ou}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "Logs" && (
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Configuración de Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="log-rotation">Log Rotation (days)</Label>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-gray-500" />
                    <Slider
                      id="log-rotation"
                      min={1}
                      max={120}
                      step={1}
                      value={[logRotation]}
                      onValueChange={(value) => setLogRotation(value[0])}
                    />
                    <span className="w-12 text-right">{logRotation}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="detailed-logging"
                    checked={detailedLogging}
                    onCheckedChange={setDetailedLogging}
                  />
                  <Label htmlFor="detailed-logging">Enable Detailed Logging</Label>
                </div>
                <Button>Save Log Settings</Button>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Live Syslog
                </CardTitle>
              </CardHeader>
              <CardContent>
                {syslogError ? (
                  <p className="text-red-500">{syslogError}</p>
                ) : (
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {syslogEntries.map((entry, index) => (
                      <p key={index} className="text-sm">{entry}</p>
                    ))}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}