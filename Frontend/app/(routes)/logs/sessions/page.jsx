"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  ArrowUpDown,
  ChevronDown,
  CheckCircle,
  Clock,
  Search,
  MoreVertical,
  Eye,
  Ban,
  Trash2,
  ArrowLeft
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSessions } from "@/hooks/useSessions"
import { useScrollTop } from "@/hooks/useScrollTop"
import { usePagination } from "@/hooks/usePagination"
import { SessionsHeader } from "./components/SessionsHeader"
import { SessionsFilters } from "./components/SessionsFilters"
import { SessionsTableSkeleton } from "./components/SessionsTableSkeleton"
import { TablePagination } from "@/components/data-table/TablePagination"
import { DateTimeDisplay } from "@/lib/date-utils"

export default function SessionsPage() {
  const { 
    sessions, 
    loading, 
    error, 
    isRefreshing, 
    lastUpdated, 
    refreshSessions 
  } = useSessions();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { showBackToTop, scrollToTop } = useScrollTop(300);

  // Filtrar sesiones según término de búsqueda y pestaña activa
  const filteredSessions = useMemo(() => {
    // Combine both session types if showing 'all'
    let combinedSessions = [];
    
    if (activeTab === "all" || activeTab === "active") {
      combinedSessions = [...combinedSessions, ...sessions.active_sessions];
    }
    
    if (activeTab === "all" || activeTab === "completed") {
      combinedSessions = [...combinedSessions, ...sessions.completed_sessions];
    }
    
    // Filtro de búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      return combinedSessions.filter(
        (session) =>
          session.username?.toLowerCase().includes(searchLower) || session.ip?.toLowerCase().includes(searchLower),
      );
    }
    
    return combinedSessions;
  }, [sessions, searchTerm, activeTab]);
  
  // Hook pa la paginación
  const pagination = usePagination(filteredSessions, {
    initialPage: 1,
    initialPageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    sortKey: 'start_timestamp',
    sortDirection: 'desc'
  });

  // Formatear fecha y hora para mostrar
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("es-ES");
    } catch (e) {
      return dateString;
    }
  };

  // Iniciales del nombre de usuario
  const getInitials = (name) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  // Get avatar color based on username
  const getAvatarColor = (username) => {
    if (!username) return "bg-gray-400";

    const colors = [
      "bg-red-400", "bg-blue-400", "bg-green-400", "bg-yellow-400", 
      "bg-purple-400", "bg-pink-400", "bg-indigo-400", "bg-teal-400",
    ];

    // Simple hash function to get consistent color for same username
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
  };

  // Render table header with sort indicator
  const renderSortableHeader = (key, label, icon) => (
    <TableHead 
      onClick={() => pagination.requestSort(key)} 
      className="cursor-pointer hover:bg-gray-100 transition-colors group"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span>{label}</span>
        {pagination.sort.key === key ? (
          <span className="text-primary">
            {pagination.sort.direction === "asc" ? (
              <ChevronDown className="h-4 w-4 rotate-180 transition-transform" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform" />
            )}
          </span>
        ) : (
          <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
    </TableHead>
  );

  // Show empty search state
  const renderEmptyState = () => (
    <TableRow>
      <TableCell colSpan={7} className="text-center py-16 text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <div className="bg-muted/30 p-4 rounded-full mb-2">
            <Search className="h-6 w-6 text-muted-foreground/70" />
          </div>
          <p className="text-lg font-medium">No se encontraron sesiones</p>
          <p className="text-sm text-muted-foreground max-w-md">
            {searchTerm
              ? "Intenta ajustar tu búsqueda o criterios de filtro para encontrar lo que buscas."
              : "No hay sesiones que coincidan con tus criterios de filtro actuales."}
          </p>
          {searchTerm && (
            <Button variant="outline" size="sm" onClick={() => setSearchTerm("")} className="mt-2">
              Limpiar búsqueda
            </Button>
          )}
        </div>
      </TableCell>
    </TableRow>
  );

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <SessionsHeader 
          lastUpdated={lastUpdated} 
          isRefreshing={isRefreshing} 
          onRefresh={refreshSessions} 
        />
        
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 flex flex-col items-center">
            <div className="bg-red-100 p-3 rounded-full mb-4">
              <Search className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Error al cargar las sesiones</h3>
            <p className="text-red-600 mb-4 text-center">{error}</p>
            <Button onClick={refreshSessions} variant="outline" className="border-red-300">
              Reintentar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6  container">
      <SessionsHeader 
        lastUpdated={lastUpdated} 
        isRefreshing={isRefreshing} 
        onRefresh={refreshSessions} 
      />

      {/* Sessions card */}
      <Card className="shadow-md border border-border overflow-hidden">
        <CardHeader className="bg-muted/20 p-4 border-b border-border">
          <SessionsFilters 
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            sortConfig={pagination.sort}
            onSortChange={pagination.requestSort}
            activeSessions={sessions.active_sessions}
            completedSessions={sessions.completed_sessions}
          />
        </CardHeader>

        <CardContent className="p-0">
          {/* Sessions table */}
          <div className="overflow-auto">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow className="hover:bg-transparent">
                  {renderSortableHeader("status", "Estado")}
                  {renderSortableHeader("username", "Usuario", <Clock className="h-4 w-4" />)}
                  {renderSortableHeader("ip", "Dirección IP", <Clock className="h-4 w-4" />)}
                  {renderSortableHeader("start_timestamp", "Hora de inicio", <Clock className="h-4 w-4" />)}
                  {renderSortableHeader("end_timestamp", "Hora de fin", <Clock className="h-4 w-4" />)}
                  {renderSortableHeader("duration", "Duración", <Clock className="h-4 w-4" />)}
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <SessionsTableSkeleton />
                ) : pagination.pageItems.length === 0 ? (
                  renderEmptyState()
                ) : (
                  pagination.pageItems.map((session, index) => (
                    <TableRow
                      key={`session-${session.username}-${session.ip}-${session.start_timestamp}-${index}`}
                      className={
                        session.status === "active"
                          ? "hover:bg-green-50 bg-green-50/20 border-l-4 border-l-green-400 transition-colors"
                          : "hover:bg-blue-50 bg-white border-l-4 border-l-transparent transition-colors"
                      }
                    >
                      <TableCell>
                        {session.status === "active" ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200 flex items-center gap-1 font-medium">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Activa
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800 border-blue-200 font-medium">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Completada
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className={`h-8 w-8 ${getAvatarColor(session.username)}`}>
                            <AvatarFallback className="text-white text-xs">
                              {getInitials(session.username)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{session.username}</div>
                            <div className="text-xs text-muted-foreground">Usuario</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-mono text-muted-foreground text-sm bg-muted/30 px-2 py-1 rounded">
                                {session.ip}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Dirección IP</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </TableCell>
                      <TableCell>
                        <DateTimeDisplay dateInput={session.start_time} />
                      </TableCell>
                      <TableCell>
                        {session.status === "active" ? (
                          <span className="text-muted-foreground italic">Activa</span>
                        ) : (
                          <DateTimeDisplay dateInput={session.end_time} />
                        )}
                      </TableCell>
                      <TableCell>
                        {session.status === "active" ? (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-green-600" />
                            <span className="text-green-600 font-mono font-medium">
                              {session.client_duration_formatted || session.duration_formatted}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="font-mono font-medium">{session.duration_formatted}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Acciones</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver detalles
                            </DropdownMenuItem>
                            {session.status === "active" && (
                              <DropdownMenuItem className="text-red-600">
                                <Ban className="h-4 w-4 mr-2" />
                                Finalizar sesión
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Eliminar registro
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination component */}
          <div className="px-4 py-2 border-t border-border bg-muted/10">
            <TablePagination
              currentPage={pagination.currentPage}
              pageSize={pagination.pageSize}
              setCurrentPage={pagination.setCurrentPage}
              setPageSize={pagination.setPageSize}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              pageSizeOptions={pagination.pageSizeOptions}
            />
          </div>

        </CardContent>
      </Card>

      {/* Back to top button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-4 right-4 rounded-full shadow-lg bg-primary text-white h-10 w-10 p-0"
          onClick={scrollToTop}
        >
          <ArrowLeft className="h-5 w-5 rotate-90" />
          <span className="sr-only">Volver arriba</span>
        </Button>
      )}
    </div>
  );
}

