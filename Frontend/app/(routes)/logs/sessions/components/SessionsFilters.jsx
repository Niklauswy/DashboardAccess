import {Input} from "@/components/ui/input";
import {Calendar, ChevronDown, Clock, Filter, MonitorSmartphone, Search, UserCheck} from "lucide-react";
import {Tabs, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SessionsFilters({ 
  searchTerm, 
  onSearchChange, 
  activeTab, 
  onTabChange, 
  sortConfig, 
  onSortChange,
  activeSessions,
  completedSessions
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
      <div className="relative w-full md:w-64">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar usuario, IP..."
          className="pl-9 bg-background border-gray-300 focus-visible:ring-gray-400"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap gap-2 w-full md:w-auto">
        <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange} className="w-full md:w-auto">
          <TabsList className="bg-muted/50 w-full grid grid-cols-3">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <span className="flex items-center gap-2">
                Todas
                <Badge className="ml-1 bg-muted text-muted-foreground">
                  {activeSessions.length + completedSessions.length}
                </Badge>
              </span>
            </TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <span className="flex items-center gap-2">
                Activas
                <Badge className="ml-1 bg-green-100 text-green-700">{activeSessions.length}</Badge>
              </span>
            </TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <span className="flex items-center gap-2">
                Completadas
                <Badge className="ml-1 bg-blue-100 text-blue-700">{completedSessions.length}</Badge>
              </span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="whitespace-nowrap border-gray-300 h-9">
              <Filter className="h-4 w-4 mr-2" />
              Ordenar por
              <ChevronDown className="h-4 w-4 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuRadioGroup value={sortConfig.key} onValueChange={(value) => onSortChange(value)}>
              <DropdownMenuRadioItem value="username">
                <UserCheck className="h-4 w-4 mr-2 text-muted-foreground" />
                Usuario
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="ip">
                <MonitorSmartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                Dirección IP
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="start_timestamp">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                Hora de inicio
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="duration">
                <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                Duración
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
