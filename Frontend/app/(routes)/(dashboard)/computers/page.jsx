'use client'
import React, { useState, useMemo } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Laptop, Info, School, Search, CheckCircle, XCircle, MinusCircle, Clock, Calendar, Check, X, Minus, Command, RefreshCcw } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Terminal, Apple, HelpCircle, Cpu, Wifi } from "lucide-react"
import ErrorServer from '@/components/ErrorServer'
import NoData from '@/components/NoData'
import ComputerTableSkeleton from '@/components/skeletons/ComputerTableSkeleton'
import Image from 'next/image'

// UABC Color Theme
const uabcColors = {
  primary: '#006341', // UABC Green
  secondary: '#F2A900', // UABC Gold
  accent: '#00843D', // Lighter green
  light: '#F5F5F5',
  dark: '#333333',
}

const osIcons = {
  windows: <Monitor className="h-5 w-5 text-blue-500" />,
  unix: <Terminal className="h-5 w-5 text-green-500" />,
  mac: <Apple className="h-5 w-5 text-gray-800" />,
  linux: <Command className="h-5 w-5 text-orange-500" />,
  unknown: <HelpCircle className="h-5 w-5 text-gray-500" />,
}

const statusConfig = {
  activa: {
    color: 'bg-[#00843D]',
    hoverColor: 'hover:bg-[#006341]',
    gradient: 'from-[#00843D] to-[#006341]',
    icon: <CheckCircle className="h-4 w-4 text-[#00843D]" />,
    name: 'Activa',
    textColor: 'text-[#006341]',
    bgColor: 'bg-green-50',
    borderColor: 'border-[#00843D]/20'
  },
  mantenimiento: {
    color: 'bg-[#F2A900]',
    hoverColor: 'hover:bg-amber-600',
    gradient: 'from-[#F2A900] to-amber-600',
    icon: <Clock className="h-4 w-4 text-[#F2A900]" />,
    name: 'Mantenimiento',
    textColor: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-[#F2A900]/20'
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

  const handleRetry = () => {
    mutate();
  };

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
      <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-green-50">
        {/* UABC Header Banner */}
        <div className="bg-[#006341] text-white py-4 px-6 shadow-md">
          <div className="w-full max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Add UABC logo here */}
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden">
                <div className="text-[#006341] font-bold text-xs text-center">
                  LOGO<br/>UABC
                </div>
                {/* Uncomment and add proper logo path
                <Image 
                  src="/images/uabc-logo.png" 
                  alt="UABC Logo"
                  width={48}
                  height={48}
                />
                */}
              </div>
              <div>
                <h1 className="text-xl font-bold">Universidad Autónoma de Baja California</h1>
                <p className="text-sm opacity-80">Sistema de Gestión de Laboratorios</p>
              </div>
            </div>
            <div className="hidden md:block">
              <p className="text-sm">Facultad de Ingeniería y Negocios</p>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8 flex-grow">
          <div className="w-full max-w-7xl mx-auto space-y-6">
            {/* Campus Navigator Card */}
            <Card className="overflow-hidden border-0 shadow-md bg-white">
              <div className="bg-[#F2A900] h-2 w-full"></div>
              <CardContent className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-[#006341]/10">
                    <School className="h-6 w-6 text-[#006341]" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-800">Campus Tijuana</h2>
                    <p className="text-sm text-gray-600">Monitoreo de Salas de Cómputo</p>
                  </div>
                </div>
                <Button 
                  onClick={handleRetry}
                  className="bg-[#006341] hover:bg-[#00843D] text-white"
                >
                  <RefreshCcw className="h-4 w-4 mr-2" />
                  Actualizar
                </Button>
              </CardContent>
            </Card>

            {/* Stats Overview Row */}
            <div className="relative">
              {/* Decorative element */}
              <div className="hidden md:block absolute -top-3 -left-6 w-12 h-12 rounded-full border-4 border-[#F2A900]/30"></div>
              <div className="hidden md:block absolute -bottom-3 -right-6 w-8 h-8 rounded-full border-4 border-[#006341]/20"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white shadow-md border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#006341] to-[#00843D] h-1"></div>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Total de Computadoras</p>
                      <p className="text-2xl font-bold text-slate-800">{totalComputers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-[#006341]/10">
                      <Monitor className="h-5 w-5 text-[#006341]" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-md border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#00843D] to-[#00843D] h-1"></div>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">Activas</p>
                      <p className="text-2xl font-bold text-[#00843D]">{activeComputers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-[#00843D]/10">
                      <CheckCircle className="h-5 w-5 text-[#00843D]" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-md border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-[#F2A900] to-amber-500 h-1"></div>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-slate-500">En Mantenimiento</p>
                      <p className="text-2xl font-bold text-[#F2A900]">{maintenanceComputers}</p>
                    </div>
                    <div className="p-3 rounded-full bg-[#F2A900]/10">
                      <Clock className="h-5 w-5 text-[#F2A900]" />
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-white shadow-md border-0 overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-300 to-slate-200 h-1"></div>
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
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between bg-white p-4 rounded-lg shadow-md border-0 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#006341] via-[#F2A900] to-[#006341]"></div>
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por nombre o IP..."
                  className="pl-9 border-slate-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button 
                  onClick={() => setActiveFilter('all')}
                  variant={activeFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  className={activeFilter === 'all' ? 
                    "bg-[#006341] hover:bg-[#00843D]" : 
                    "border-slate-200"}
                >
                  Todos
                </Button>
                <Button 
                  onClick={() => setActiveFilter('activa')}
                  variant={activeFilter === 'activa' ? 'default' : 'outline'}
                  size="sm"
                  className={activeFilter !== 'activa' ? 
                    "text-[#00843D] border-[#00843D]/20 hover:bg-[#00843D]/10" : 
                    "bg-[#00843D]"}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Activas
                </Button>
                <Button 
                  onClick={() => setActiveFilter('mantenimiento')}
                  variant={activeFilter === 'mantenimiento' ? 'default' : 'outline'}
                  size="sm"
                  className={activeFilter !== 'mantenimiento' ? 
                    "text-amber-700 border-[#F2A900]/20 hover:bg-[#F2A900]/10" : 
                    "bg-[#F2A900]"}
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
                    "bg-slate-500"}
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Desconocido
                </Button>
              </div>
            </div>

            {/* Classroom Cards */}
            {filteredClassrooms.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center border-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#F2A900]"></div>
                <HelpCircle className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-medium text-slate-700 mb-1">No se encontraron resultados</h3>
                <p className="text-slate-500 mb-4">No hay computadoras que coincidan con tus criterios de búsqueda.</p>
                <Button 
                  variant="outline" 
                  onClick={() => {setSearchTerm(''); setActiveFilter('all');}}
                  className="border-[#006341] text-[#006341] hover:bg-[#006341]/10"
                >
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
                    <Card key={classroom.id} className="overflow-hidden shadow-md border-0 bg-white relative">
                      <div className="absolute top-0 left-0 w-full h-1 bg-[#006341]"></div>
                      <CardHeader className="border-b border-slate-100 pb-3">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                          <div className="space-y-1">
                            <CardTitle className="text-xl font-medium flex items-center text-slate-800">
                              <div className="p-1.5 rounded-md bg-[#006341]/10 mr-2">
                                <School className="h-5 w-5 text-[#006341]" />
                              </div>
                              {classroom.name}
                            </CardTitle>
                            <div className="text-sm text-slate-500 flex flex-wrap items-center gap-2">
                              <span className="font-medium">{totalComputers}</span> 
                              <span>computadoras</span>
                              {activeComputers > 0 && (
                                <Badge className="text-xs font-normal bg-[#00843D]/10 text-[#00843D] border border-[#00843D]/20">
                                  {activeComputers} activas
                                </Badge>
                              )}
                              {maintenanceComputers > 0 && (
                                <Badge className="text-xs font-normal bg-[#F2A900]/10 text-amber-700 border border-[#F2A900]/20">
                                  {maintenanceComputers} en mantenimiento
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-semibold text-[#00843D]">{activePercentage}% Disponibles</span>
                            <div className="w-full md:w-36 h-2.5 rounded-full overflow-hidden bg-slate-100 flex mt-1 border border-slate-100">
                              <div className="bg-[#00843D] h-full" style={{ width: `${(activeComputers/totalComputers)*100}%` }}></div>
                              <div className="bg-[#F2A900] h-full" style={{ width: `${(maintenanceComputers/totalComputers)*100}%` }}></div>
                              <div className="bg-slate-300 h-full" style={{ width: `${(unknownComputers/totalComputers)*100}%` }}></div>
                            </div>
                            <div className="flex items-center justify-end mt-1.5 text-xs gap-3">
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-[#00843D] rounded-full mr-1.5"></div>
                                <span>Activa</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-[#F2A900] rounded-full mr-1.5"></div>
                                <span>Mantenimiento</span>
                              </div>
                              <div className="flex items-center">
                                <div className="w-2 h-2 bg-slate-300 rounded-full mr-1.5"></div>
                                <span>Desconocido</span>
                              </div>
                            </div>
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
            
            {/* UABC Branded Footer */}
            <div className="mt-8 border-t border-[#006341]/10 pt-4 text-center">
              <div className="flex items-center justify-center gap-2 text-sm text-[#006341]">
                <span>© {new Date().getFullYear()} Universidad Autónoma de Baja California</span>
                <div className="h-4 w-px bg-[#006341]/20"></div>
                <span>Sistema de Gestión de Laboratorios</span>
              </div>
              <div className="text-xs text-slate-500 mt-1">
                Facultad de Ingeniería y Negocios, Campus Tijuana
              </div>
            </div>
          </div>
        </div>

        {/* Computer Details Dialog */}
        {selectedComputer && (
          <Dialog open={!!selectedComputer} onOpenChange={() => setSelectedComputer(null)}>
            <DialogContent className="bg-white rounded-xl shadow-2xl max-w-md overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#006341] to-[#00843D] -mx-6 -mt-6 mb-3"></div>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="flex items-center text-slate-800">
                  <div className="p-2 rounded-full bg-[#006341]/10 mr-3">
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
                  className="text-[#006341] border-[#006341]/20 hover:bg-[#006341]/10"
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