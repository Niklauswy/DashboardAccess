import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {Button} from "@/components/ui/button"

export default function BatchResultsDialog({ 
  open, 
  onOpenChange, 
  results 
}) {
  if (!results) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Resultados de la operación</DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
            <div className="text-sm">
              <span className="text-green-600 font-medium">{results.success.length}</span> usuarios creados exitosamente
            </div>
            <div className="text-sm">
              <span className="text-red-600 font-medium">{results.errors.length}</span> errores
            </div>
          </div>
          
          {results.errors.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-red-600">Errores</h4>
              <div className="max-h-56 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.errors.map((error, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{error.username}</TableCell>
                        <TableCell className="text-red-600">{error.errorMessage}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          {results.success.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-md font-medium text-green-600">Usuarios creados</h4>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>OU</TableHead>
                      <TableHead>Grupos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.success.map((user, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.fullName || user.username}</TableCell>
                        <TableCell>{user.ou || "-"}</TableCell>
                        <TableCell>{user.groups?.join(", ") || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
