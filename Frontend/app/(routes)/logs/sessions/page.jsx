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
import { SessionsHeader } from "./components/SessionsHeader"
import { SessionsFilters } from "./components/SessionsFilters"
import { SessionsTableSkeleton } from "./components/SessionsTableSkeleton"

export default function SessionsPage() {
  // Use the custom sessions hook
  const { 
    sessions, 
    loading, 
    error, 
    isRefreshing, 
    lastUpdated, 
    refreshSessions 
  } = useSessions();
  
  // Local UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "start_timestamp", direction: "desc" });
  const [activeTab, setActiveTab] = useState("all");
  const [showBackToTop, setShowBackToTop] = useState(false);
  
  // Handle sorting
  const requestSort = (key) => {
    setSortConfig((current) => ({
      key,
      direction: current.key === key && current.direction === "desc" ? "asc" : "desc",
    }));
  };

  // Add scroll listener for back to top button
  const handleScroll = () => {
    setShowBackToTop(window.scrollY > 300);
  };

  // Attach and clean up scroll event
  useState(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // Format date for display
  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleString("es-ES");
    } catch (e) {
      return dateString;
    }
  };

  // Get initials from username
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

  // Filtered and sorted sessions
  const filteredSessions = useMemo(() => {
    // Combine both session types if showing 'all'
    let combinedSessions = [];
    
    if (activeTab === "all" || activeTab === "active") {
      combinedSessions = [...combinedSessions, ...sessions.active_sessions];
    }
    
    if (activeTab === "all" || activeTab === "completed") {
      combinedSessions = [...combinedSessions, ...sessions.completed_sessions];
    }
    
    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      combinedSessions = combinedSessions.filter(
        (session) =>
          session.username?.toLowerCase().includes(searchLower) || session.ip?.toLowerCase().includes(searchLower),
      );
    }

    // Sort the sessions
    return [...combinedSessions].sort((a, b) => {
      // Handle duration special case
      if (sortConfig.key.includes("duration")) {
        // For active sessions, use client_duration if available
        const aValue =
          a.status === "active" ? (a.client_duration || Number(a.duration)) : Number(a.duration);
        const bValue =
          b.status === "active" ? (b.client_duration || Number(b.duration)) : Number(b.duration);

        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // For timestamp fields
      if (sortConfig.key === "start_timestamp" || sortConfig.key === "end_timestamp") {
        return sortConfig.direction === "asc"
          ? Number(a[sortConfig.key]) - Number(b[sortConfig.key])
          : Number(b[sortConfig.key]) - Number(a[sortConfig.key]);
      }

      // Text-based sorting for other fields
      const aValue = String(a[sortConfig.key] || "").toLowerCase();
      const bValue = String(b[sortConfig.key] || "").toLowerCase();

      return sortConfig.direction === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    });
  }, [sessions, searchTerm, sortConfig, activeTab]);

  // Render table header with sort indicator
  const renderSortableHeader = (key, label, icon) => (
    <TableHead 
      onClick={() => requestSort(key)} 
      className="cursor-pointer hover:bg-gray-100 transition-colors group"
    >
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span>{label}</span>
        {sortConfig.key === key ? (
          <span className="text-primary">
            {sortConfig.direction === "asc" ? (
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
    <div className="container mx-auto p-4 space-y-6">
      {/* Header with navigation and controls */}
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
            sortConfig={sortConfig}
            onSortChange={requestSort}
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
                ) : filteredSessions.length === 0 ? (
                  renderEmptyState()
                ) : (
                  filteredSessions.map((session, index) => (
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
                        <div className="flex flex-col">
                          <span>{formatDate(session.start_time).split(",")[1]}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(session.start_time).split(",")[0]}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {session.status === "active" ? (
                          <span className="text-muted-foreground italic">Activa</span>
                        ) : (
                          <div className="flex flex-col">
                            <span>{formatDate(session.end_time).split(",")[1]}</span>
                            <span className="text-xs text-muted-foreground">
                              {formatDate(session.end_time).split(",")[0]}
                            </span>
                          </div>
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

          {/* Stats footer */}
          <div className="p-4 border-t border-border bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-sm text-muted-foreground">
            <div>
              Mostrando <span className="font-semibold">{filteredSessions.length}</span> de{" "}
              <span className="font-semibold">
                {sessions.active_sessions.length + sessions.completed_sessions.length}
              </span>{" "}
              sesiones
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <span className="relative flex h-2 w-2 mr-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Activas: <span className="font-semibold ml-1">{sessions.active_sessions.length}</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="h-3 w-3 text-blue-500 mr-1" />
                Completadas: <span className="font-semibold ml-1">{sessions.completed_sessions.length}</span>
              </div>
            </div>
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

