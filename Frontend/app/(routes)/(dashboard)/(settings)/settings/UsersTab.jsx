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

// ...existing imports if needed...

const fetcher = (url) => fetch(url).then(res => res.json())

export default function UsersTab() {
  const [csvFile, setCsvFile] = useState(null)
  const [defaultPassword, setDefaultPassword] = useState("")
  const [newUserPrefix, setNewUserPrefix] = useState("")
  const [newUserQuantity, setNewUserQuantity] = useState(1)
  const [newUserDefaultPassword, setNewUserDefaultPassword] = useState("")
  const { toast } = useToast()

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
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const csvText = e.target.result
        // Parse CSV (without headers)
        const results = Papa.parse(csvText, { header: false, skipEmptyLines: true })
        const records = results.data
        for (const row of records) {
          const userData = {
            samAccountName: row[0],
            givenName: row[1],
            sn: row[2],
            password: defaultPassword,
            ou: row[3],
            groups: [row[4]]
          }
          const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(userData)
          })
          const data = await res.json()
          if (!res.ok) {
            toast({
              title: `Error creando ${userData.samAccountName}`,
              description: data.details || `Ocurrió un error al crear el usuario ${userData.samAccountName}.`,
              variant: "destructive",
            })
          } else {
            toast({
              title: `Usuario ${userData.samAccountName} creado`,
              description: `El usuario ${userData.samAccountName} se creó correctamente.`,
            })
          }
        }
        setCsvFile(null)
        toast({
          title: "Procesamiento CSV",
          description: "Todos los usuarios han sido procesados exitosamente.",
        })
      } catch (error) {
        toast({
          title: "Error en CSV",
          description: error.message || "Error al procesar el archivo CSV.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(csvFile)
  }

  const handleCreateUsers = () => {
    const users = []
    for (let i = 1; i <= newUserQuantity; i++) {
      const number = String(i).padStart(2, "0")
      users.push(`${newUserPrefix}${number}`)
    }
    console.log("Creating users:", users, "with default password:", newUserDefaultPassword)
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
                  </TableBody>
                </Table>
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
              onChange={(e) => setDefaultPassword(e.target.value)}
              placeholder="Ingrese la contraseña por defecto"
            />
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
                onChange={(e) => setNewUserDefaultPassword(e.target.value)}
                placeholder="Ingrese la contraseña"
              />
            </div>
            <Button onClick={handleCreateUsers}>Crear Usuarios</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
