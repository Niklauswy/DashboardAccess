import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function ProcessingDialog({ open, progress = 0 }) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[400px]" hideClose={true}>
        <div className="w-full space-y-6">
          <div className="flex items-center justify-center my-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">Procesando usuarios</h3>
            <p className="text-sm text-muted-foreground">
              Estamos creando los usuarios ({progress}% completado)
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
