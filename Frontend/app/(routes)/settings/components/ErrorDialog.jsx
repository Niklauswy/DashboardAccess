import {Dialog, DialogContent} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"

export default function ErrorDialog({ open, onOpenChange, messages }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-red-600">Errores en formato CSV</h3>
          <div className="space-y-2">
            {messages.map((msg, idx) => (
              <p key={idx} className="text-sm text-gray-800">{msg}</p>
            ))}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
