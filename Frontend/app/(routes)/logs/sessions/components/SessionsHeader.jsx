import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, RefreshCw, MoreHorizontal, Printer } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // Preparar datos combinados para exportación
  const exportData = [
    ...sessions.active_sessions,
    ...sessions.completed_sessions
  ];

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

        {/* Componente de exportación */}
        <DataExport 
          data={exportData}
          columns={exportColumns}
          filename="sesiones_usuarios"
          title="Reporte de Sesiones de Usuario"
          subtitle="Dashboard Access System"
          logo={{
            url: '/logo.png', // Asegúrate de tener un logo en tu proyecto
            width: 30,
            height: 30
          }}
        />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="border-gray-300 hover:bg-gray-100 rounded-full h-9 w-9 p-0"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Más opciones</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Acciones de Sesión</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Imprimir Sesiones
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
