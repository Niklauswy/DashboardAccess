import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Loader2 } from "lucide-react";

export default function ProcessingDialog({ open, progress = 0 }) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[400px] flex flex-col items-center p-6">
        <div className="w-full space-y-6">
          <div className="flex items-center justify-center">
            <div className="relative">
              <div className="h-24 w-24 rounded-full border-4 border-muted flex items-center justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <div className="absolute bottom-0 right-0 rounded-full bg-primary text-primary-foreground text-xs px-2 py-1 font-semibold">
                {progress}%
              </div>
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h3 className="text-lg font-semibold">Procesando usuarios</h3>
            <p className="text-sm text-muted-foreground">
              Estamos creando los usuarios, esto puede tomar unos momentos...
            </p>
          </div>
          
          <div className="space-y-1">
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
