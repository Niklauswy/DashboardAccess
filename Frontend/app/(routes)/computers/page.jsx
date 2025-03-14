'use client'
import React, { useState,  } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle,  } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Monitor,  School, Search, CheckCircle,  Clock, Calendar,  Command, RefreshCcw } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Terminal, Apple, HelpCircle, Wifi } from "lucide-react"
import ErrorServer from '@/components/ErrorServer'
import NoData from '@/components/NoData'
import ComputerTableSkeleton from '@/components/skeletons/ComputerTableSkeleton'

const osIcons = {
  windows: <Monitor className="h-5 w-5 text-blue-500" />,
  unix: <Terminal className="h-5 w-5 text-green-500" />,
  mac: <Apple className="h-5 w-5 text-gray-800" />,
  linux: <Command className="h-5 w-5 text-orange-500" />,
  unknown: <HelpCircle className="h-5 w-5 text-gray-500" />,
}

const statusConfig = {
  activa: {
    color: 'bg-emerald-500',
    hoverColor: 'hover:bg-emerald-600',
    gradient: 'from-emerald-400 to-emerald-500',
    icon: <CheckCircle className="h-4 w-4 text-emerald-500" />,
    name: 'Activa',
    textColor: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200'
  },
  mantenimiento: {
    color: 'bg-amber-500',
    hoverColor: 'hover:bg-amber-600',
    gradient: 'from-amber-400 to-amber-500',
    icon: <Clock className="h-4 w-4 text-amber-500" />,
    name: 'Mantenimiento',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200'
  },
  desconocido: {
    color: 'bg-slate-300',
    hoverColor: 'hover:bg-slate-400',
    gradient: 'from-slate-200 to-slate-300',
    icon: <HelpCircle className="h-4 w-4 text-slate-500" />,
    name: 'Desconocido',
    textColor: 'text-slate-700',
    bgColor: 'bg-slate-50',
    borderColor: 'border-slate-200'
  }
}

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ComputerManagement() {
  const { data: classroomsData, error, mutate } = useSWR('/api/computers', fetcher)
  const [selectedComputer, setSelectedComputer] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')


  if (classroomsData && classroomsData.error) {
    return (
      <ErrorServer message={classroomsData.error} onRetry={handleRetry} />
    );
  }

  if (error) {
    return (
      <ErrorServer message="No se pudieron obtener los datos de las computadoras." onRetry={handleRetry} />
    );
  }

  if (!classroomsData) {
    return <ComputerTableSkeleton />;
  }

  let classrooms = []

  if (classroomsData) {
    classrooms = Object.entries(classroomsData).map(([classroomName, computersData]) => {
      const computersArray = Array.isArray(computersData)
        ? computersData
        : Object.values(computersData)

      return {
        id: classroomName,
        name: classroomName,
        computers: computersArray.map((computer, index) => ({
          id: computer.id || `computer-${index}`,
          name: computer.id || `Computer-${index}`,
          status: computer.status?.toLowerCase() || 'desconocido',
          os:
            computer.operatingSystem?.toLowerCase().includes('windows') ? 'windows' :
            computer.operatingSystem?.toLowerCase().includes('linux') ? 'linux' :
            computer.operatingSystem?.toLowerCase().includes('mac') ? 'mac' :
            computer.operatingSystem?.toLowerCase().includes('unix') ? 'unix' :
            'unknown',
          ip: computer.IP,
          lastLogin: computer.lastLogon,
          loginCount: computer.logonCount,
        })),
      }
    })
  }

  if (classrooms && classrooms.length === 0) {
    return <NoData onReload={handleRetry} />;
  }

  // Filter classrooms and computers based on search term and status filter
  const filteredClassrooms = classrooms.map(classroom => {
    const filteredComputers = classroom.computers.filter(computer => {
      const matchesSearch = searchTerm === '' || 
        computer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        computer.ip?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = activeFilter === 'all' || computer.status === activeFilter;
      
      return matchesSearch && matchesFilter;
    });
    
    return {
      ...classroom,
      computers: filteredComputers
    };
  }).filter(classroom => classroom.computers.length > 0);

  // Calculate overall statistics
  const totalComputers = classrooms.reduce((sum, classroom) => sum + classroom.computers.length, 0);
  const activeComputers = classrooms.reduce((sum, classroom) => 
    sum + classroom.computers.filter(c => c.status === 'activa').length, 0);
  const maintenanceComputers = classrooms.reduce((sum, classroom) => 
    sum + classroom.computers.filter(c => c.status === 'mantenimiento').length, 0);
  const unknownComputers = classrooms.reduce((sum, classroom) => 
    sum + classroom.computers.filter(c => c.status === 'desconocido').length, 0);

  return (
    <TooltipProvider>
      <div className="p-4 md:p-8 flex flex-col min-h-screen ">
        <div className="w-full  mx-auto space-y-6">


          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Total de Computadoras</p>
                  <p className="text-2xl font-bold text-slate-800">{totalComputers}</p>
                </div>
                <div className="p-3 rounded-full bg-blue-50">
                  <Monitor className="h-5 w-5 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Activas</p>
                  <p className="text-2xl font-bold text-emerald-600">{activeComputers}</p>
                </div>
                <div className="p-3 rounded-full bg-emerald-50">
                  <CheckCircle className="h-5 w-5 text-emerald-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">En Mantenimiento</p>
                  <p className="text-2xl font-bold text-amber-600">{maintenanceComputers}</p>
                </div>
                <div className="p-3 rounded-full bg-amber-50">
                  <Clock className="h-5 w-5 text-amber-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-slate-100">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-slate-500">Desconocido</p>
                  <p className="text-2xl font-bold text-slate-600">{unknownComputers}</p>
                </div>
                <div className="p-3 rounded-full bg-slate-100">
                  <HelpCircle className="h-5 w-5 text-slate-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar por nombre o IP..."
                className="pl-9 border-slate-200"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2 w-full md:w-auto">
              <Button 
                onClick={() => setActiveFilter('all')}
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className={activeFilter !== 'all' ? "border-slate-200" : ""}
              >
                Todos
              </Button>
              <Button 
                onClick={() => setActiveFilter('activa')}
                variant={activeFilter === 'activa' ? 'default' : 'outline'}
                size="sm"
                className={activeFilter !== 'activa' ? 
                  "text-emerald-700 border-emerald-200 hover:bg-emerald-50" : 
                  "bg-emerald-500 hover:bg-emerald-600"}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Activas
              </Button>
              <Button 
                onClick={() => setActiveFilter('mantenimiento')}
                variant={activeFilter === 'mantenimiento' ? 'default' : 'outline'}
                size="sm"
                className={activeFilter !== 'mantenimiento' ? 
                  "text-amber-700 border-amber-200 hover:bg-amber-50" : 
                  "bg-amber-500 hover:bg-amber-600"}
              >
                <Clock className="h-4 w-4 mr-1" />
                Mantenimiento
              </Button>
              <Button 
                onClick={() => setActiveFilter('desconocido')}
                variant={activeFilter === 'desconocido' ? 'default' : 'outline'}
                size="sm"
                className={activeFilter !== 'desconocido' ? 
                  "text-slate-700 border-slate-200 hover:bg-slate-50" : 
                  "bg-slate-500 hover:bg-slate-600"}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                Desconocido
              </Button>
              <Button 
              variant="outline"
              size="sm"
              onClick={handleRetry}
              className="flex items-center gap-1 text-slate-600 border-slate-200 hover:bg-slate-100"
            >
              <RefreshCcw className="h-4 w-4" />
              Actualizar
            </Button>
            </div>
          </div>

          {/* Classroom Cards */}
          {filteredClassrooms.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-100">
              <HelpCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <h3 className="text-lg font-medium text-slate-700 mb-1">No se encontraron resultados</h3>
              <p className="text-slate-500 mb-4">No hay computadoras que coincidan con tus criterios de búsqueda.</p>
              <Button variant="outline" onClick={() => {setSearchTerm(''); setActiveFilter('all');}}>
                Limpiar filtros
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredClassrooms.map((classroom) => {
                const totalComputers = classroom.computers.length;
                const activeComputers = classroom.computers.filter(c => c.status === 'activa').length;
                const maintenanceComputers = classroom.computers.filter(c => c.status === 'mantenimiento').length;
                const unknownComputers = classroom.computers.filter(c => c.status === 'desconocido').length;
                const activePercentage = ((activeComputers / totalComputers) * 100).toFixed(1);
                
                return (
                  <Card key={classroom.id} className="overflow-hidden shadow-md border-0 bg-gradient-to-br from-white to-slate-50">
                    <CardHeader className="border-b border-slate-100 bg-white pb-3">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                        <div className="space-y-1">
                          <CardTitle className="text-xl font-medium flex items-center text-slate-800">
                            <School className="mr-2 h-5 w-5 text-blue-500" />
                            {classroom.name}
                          </CardTitle>
                          <div className="text-sm text-slate-500 flex items-center">
                            <span className="font-medium">{totalComputers}</span> 
                            <span className="mx-1">computadoras</span>
                            {activeComputers > 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs font-normal bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {activeComputers} activas
                              </Badge>
                            )}
                            {maintenanceComputers > 0 && (
                              <Badge variant="secondary" className="ml-2 text-xs font-normal bg-amber-50 text-amber-700 border border-amber-100">
                                {maintenanceComputers} en mantenimiento
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="bg-slate-100 h-2 w-28 md:w-36 rounded-full overflow-hidden flex">
                            <div className="bg-emerald-500 h-full" style={{ width: `${(activeComputers/totalComputers)*100}%` }}></div>
                            <div className="bg-amber-500 h-full" style={{ width: `${(maintenanceComputers/totalComputers)*100}%` }}></div>
                            <div className="bg-slate-300 h-full" style={{ width: `${(unknownComputers/totalComputers)*100}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-slate-700">{activePercentage}%</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2">
                        {classroom.computers.map((computer) => {
                          const status = statusConfig[computer.status];
                          return (
                            <Tooltip key={computer.id}>
                              <TooltipTrigger asChild>
                                <button
                                  className={`p-3 rounded-md border ${status.borderColor} ${status.bgColor} hover:bg-opacity-80 transition-all duration-200 w-full h-20 flex flex-col items-center justify-center gap-1`}
                                  onClick={() => setSelectedComputer(computer)}
                                >
                                  {osIcons[computer.os]}
                                  <span className={`text-xs font-medium ${status.textColor} truncate w-full text-center`}>
                                    {computer.name}
                                  </span>
                                  <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="bg-slate-800 text-xs p-2">
                                <p className="text-white font-medium">{computer.name}</p>
                                <div className="flex items-center text-slate-300 gap-1 mt-1">
                                  <div className={`w-2 h-2 rounded-full ${status.color}`}></div>
                                  <span>{status.name}</span>
                                </div>
                                <div className="flex items-center text-slate-300 gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  <span>Último inicio: {computer.lastLogin || 'Desconocido'}</span>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Computer Details Dialog */}
        {selectedComputer && (
          <Dialog open={!!selectedComputer} onOpenChange={() => setSelectedComputer(null)}>
            <DialogContent className="bg-white rounded-xl shadow-2xl max-w-md">
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center text-slate-800">
                  <div className="p-2 rounded-full bg-blue-50 mr-3">
                    {osIcons[selectedComputer.os]}
                  </div>
                  {selectedComputer.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-4 space-y-4">
                <div className="flex justify-between items-center p-3 rounded-md bg-slate-50">
                  <div className="text-sm text-slate-600">Estado</div>
                  <Badge className={`${statusConfig[selectedComputer.status].bgColor} ${statusConfig[selectedComputer.status].textColor} border ${statusConfig[selectedComputer.status].borderColor}`}>
                    <div className="flex items-center gap-1.5">
                      {statusConfig[selectedComputer.status].icon}
                      {statusConfig[selectedComputer.status].name}
                    </div>
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-md bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Sistema Operativo</div>
                    <div className="flex items-center text-slate-800">
                      {osIcons[selectedComputer.os]}
                      <span className="ml-2 capitalize">{selectedComputer.os}</span>
                    </div>
                  </div>
                  
                  <div className="p-3 rounded-md bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Dirección IP</div>
                    <div className="flex items-center text-slate-800">
                      <Wifi className="h-4 w-4 text-slate-500 mr-2" />
                      {selectedComputer.ip || 'No disponible'}
                    </div>
                  </div>
                </div>
                
                <div className="p-3 rounded-md bg-slate-50">
                  <div className="text-xs text-slate-500 mb-1">Último inicio de sesión</div>
                  <div className="text-slate-800 flex items-center">
                    <Calendar className="h-4 w-4 text-slate-500 mr-2" />
                    {selectedComputer.lastLogin || 'Sin registro'}
                  </div>
                </div>
                
                <div className="p-3 rounded-md bg-slate-50">
                  <div className="text-xs text-slate-500 mb-1">Número de inicios de sesión</div>
                  <div className="text-slate-800">
                    {selectedComputer.loginCount || '0'}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-4 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setSelectedComputer(null)}
                  className="text-slate-600 border-slate-200"
                >
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}