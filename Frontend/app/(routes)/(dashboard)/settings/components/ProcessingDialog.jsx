import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

export default function ProcessingDialog({ open, progress = 0, onCancel }) {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    if (onCancel) onCancel();
  };

  return (
    <>
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
            
            <div className="flex justify-center pt-4">
              <Button 
                variant="outline" 
                onClick={handleCancelClick}
                className="text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Detener proceso
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Detener la creación de usuarios?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción detendrá el proceso actual. Los usuarios ya creados permanecerán en el sistema, pero no se crearán más usuarios.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar proceso</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCancel} className="bg-red-600 hover:bg-red-700">
              Sí, detener proceso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
