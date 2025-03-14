import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, RefreshCw, MoreHorizontal, Download, Printer } from "lucide-react";
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

export function SessionsHeader({ lastUpdated, isRefreshing, onRefresh }) {
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
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </DropdownMenuItem>
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
