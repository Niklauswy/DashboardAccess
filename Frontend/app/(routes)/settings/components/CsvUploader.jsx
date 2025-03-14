'use client'
import {useState} from "react"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {FileSpreadsheet, Info, Users} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Input} from "@/components/ui/input"

export default function CsvUploader({ 
  onUpload, 
  isUploading, 
  groups = [], 
  ous = [] 
}) {
  const [csvFile, setCsvFile] = useState(null)
  const [defaultPassword, setDefaultPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")

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
    if (!csvFile) return
    
    if (!defaultPassword) {
      setPasswordError("Ingrese una contraseña válida.")
      return
    }
    
    setPasswordError("")
    onUpload(csvFile, defaultPassword)
    // No reseteamos el archivo CSV aquí, eso lo hará el componente padre después del procesamiento
  }

  return (
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
                  El archivo CSV debe seguir este formato [Sin encabezados], todos los campos son obligatorios:
                </DialogDescription>
              </DialogHeader>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario*</TableHead>
                    <TableHead>Nombre*</TableHead>
                    <TableHead>Apellidos*</TableHead>
                    <TableHead>OU (Carrera)*</TableHead>
                    <TableHead>Grupo (Rol)*</TableHead>
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
              <div className="mt-4 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-700">
                  <span className="font-bold">Importante:</span> Todos los campos son obligatorios. La carrera (OU) y el grupo deben existir en el sistema.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  La contraseña global debe cumplir los requisitos de complejidad: al menos 8 caracteres, una letra mayúscula, una minúscula y un número.
                </p>
              </div>
              <div className="mt-4 p-4 bg-gray-100 rounded">
                <p className="text-sm text-gray-700">
                  Grupos permitidos: {groups.join(", ") || "Cargando..."}
                </p>
                <p className="text-sm text-gray-700">
                  Unidades Organizacionales: {ous.join(", ") || "Cargando..."}
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
          {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
          <Button 
            className="mt-2" 
            disabled={!defaultPassword || !csvFile || isUploading} 
            onClick={handleUpload}
          >
            {isUploading ? 'Procesando...' : 'Subir y Procesar Usuarios'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
