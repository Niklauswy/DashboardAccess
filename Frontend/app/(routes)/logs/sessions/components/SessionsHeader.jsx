import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { DataExport } from "@/components/data-export/DataExport";

export function SessionsHeader({ lastUpdated, isRefreshing, onRefresh, sessions = { active_sessions: [], completed_sessions: [] } }) {
  // Configuración de columnas para exportación
  const exportColumns = [
    { key: "username", header: "Usuario" },
    { key: "ip", header: "Dirección IP" },
    { key: "start_time", header: "Hora de inicio" },
    { key: "end_time", header: "Hora de fin" },
    { key: "duration_formatted", header: "Duración" },
    { key: "status", header: "Estado" }
  ];

  // Asegurarse de que sessions tiene la estructura correcta antes de combinar datos
  const activeSessions = Array.isArray(sessions?.active_sessions) ? sessions.active_sessions : [];
  const completedSessions = Array.isArray(sessions?.completed_sessions) ? sessions.completed_sessions : [];

  // Preparar datos combinados para exportación
  const exportData = [...activeSessions, ...completedSessions];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div className="flex items-center gap-4">
        <Link href="/logs">
          <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Sesiones de Usuario</h1>
          <p className="text-sm text-muted-foreground">
            Monitorea y administra sesiones de usuario activas y completadas
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300 hover:bg-gray-100 rounded-full h-9 w-9 p-0"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                <span className="sr-only">Actualizar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Actualizar datos de sesiones</p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground">
                  Última actualización: {lastUpdated.toLocaleTimeString("es-ES")}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

       
          <DataExport 
            data={exportData}
            columns={exportColumns}
            filename="sesiones_usuarios"
            title="Reporte de Sesiones de Usuario"
            subtitle="Facultad de Ciencias"
          />
   
      </div>
    </div>
  );
}
