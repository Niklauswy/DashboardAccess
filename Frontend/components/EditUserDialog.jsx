// ...existing imports...
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function EditUserDialog({ open, onOpenChange, currentUser, onUpdate }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Editar Usuario</DialogTitle>
        </DialogHeader>
        <form
          className="space-y-6 mt-4"
          onSubmit={(e) => {
            e.preventDefault();
            onUpdate();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editSamAccountName">Usuario</Label>
              <Input id="editSamAccountName" value={currentUser?.username || ''} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editName">Nombre</Label>
              <Input id="editName" defaultValue={currentUser?.name || ''} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editOu">Unidad Organizativa</Label>
              <Input id="editOu" defaultValue={currentUser?.ou || ''} />
            </div>
            {/* ...añadir más campos si se requiere... */}
          </div>
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Actualizar</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
