import {Dialog, DialogContent} from "@/components/ui/dialog";
import {Progress} from "@/components/ui/progress";
import {AlertTriangle} from "lucide-react";

export default function ProcessingDialog({ open, progress = 0, actionText = "Procesando usuarios" }) {
  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]" hideClose={true}>
        <div className="w-full space-y-6">
          <div className="flex items-center justify-center my-8">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
          </div>

          <div className="space-y-4 text-center">
            <h3 className="text-lg font-semibold">{actionText}</h3>
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {progress}% completado
            </p>
            
            <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-500 text-amber-700 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <p className="font-semibold">¡No cierre ni recargue esta página!</p>
              </div>
              <p>Por favor, espere a que el proceso termine completamente.</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
