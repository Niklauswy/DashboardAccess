'use client'
import React, { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Monitor, Laptop, Info, School, ChevronDown, CheckCircle, XCircle, MinusCircle, Clock, Calendar, Check, X, Minus, Command } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Terminal, Apple, HelpCircle } from "lucide-react"
import ErrorServer from '@/components/ErrorServer';
import NoData from '@/components/NoData';

const osIcons = {
  windows: <Monitor className="h-6 w-6 text-blue-500" />,
  unix: <Terminal className="h-6 w-6 text-green-500" />,
  mac: <Apple className="h-6 w-6 text-gray-800" />,
  linux: <Command className="h-6 w-6 text-orange-500" />,
  unknown: <HelpCircle className="h-6 w-6 text-gray-500" />,
}

const statusColors = {
  activa: 'bg-emerald-500 hover:bg-emerald-600',
  mantenimiento: 'bg-amber-500 hover:bg-amber-600',
  desconocido: 'bg-slate-300 hover:bg-slate-400',
}

const statusNames = {
  activa: 'Activa',
  mantenimiento: 'Mantenimiento',
  desconocido: 'Desconocido',
}



const fetcher = (url) => fetch(url).then((res) => res.json())

export default function ComputerManagement() {
  const { data: classroomsData, error, mutate } = useSWR('/api/computers', fetcher)
  const [selectedComputer, setSelectedComputer] = useState(null)

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
    ); // Move this middleware to parse JSON request bodies before routes
  }

  if (!classroomsData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
   

        <div className="max-w-6xl mx-auto space-y-10">
          {[1, 2, 3].map((_, index) => (
            <Card key={index} className="shadow-lg border-0 bg-white/50 backdrop-blur">
              <CardHeader className="border-b border-slate-100 bg-white animate-pulse">
                <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                  <div className="h-8 bg-slate-200 rounded w-full"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  let classrooms = []

  if (classroomsData) {
    console.log('Classrooms Data:', classroomsData) // Agrega esto para ver la estructura en la consola

    classrooms = Object.entries(classroomsData).map(([classroomName, computersData]) => {
      // Verifica si computersData es un arreglo o un objeto
      const computersArray = Array.isArray(computersData)
        ? computersData
        : Object.values(computersData)

      return {
        id: classroomName,
        name: classroomName,
        computers: computersArray.map((computer, index) => ({
          id: computer.id || `computer-${index}`, // Asegurar un id único
          name: computer.id || `Computer-${index}`,
          status: computer.status?.toLowerCase() || 'desconocido',
          os:
            computer.operatingSystem?.toLowerCase().includes('windows') ? 'windows' :
            computer.operatingSystem?.toLowerCase().includes('linux') ? 'linux' :
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

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center justify-center min-h-screen">
        {/* Update container to occupy full width */}
        <div className="w-full mx-auto space-y-6">
          {classrooms.map((classroom) => {
            const totalComputers = classroom.computers.length;
            const activeComputers = classroom.computers.filter(c => c.status === 'activa').length;
            const activePercentage = ((activeComputers / totalComputers) * 100).toFixed(1);
            return (
              <Card key={classroom.id} className="w-full shadow-lg border-0 bg-white/50 backdrop-blur p-4">
                <CardHeader className="border-b border-slate-100 bg-white pb-3">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-medium flex items-center text-slate-700">
                         <School className="mr-2 h-5 w-5 text-slate-600" />
                        {classroom.name}
                      </CardTitle>
                      <div className="text-sm text-slate-500">
                        {totalComputers} computadoras
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                      {activePercentage}% Activas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"/>
                          <span>Activa</span>
                          <div className="w-2 h-2 bg-amber-500 rounded-full ml-2"/>
                          <span>Mantenimiento</span>
                          <div className="w-2 h-2 bg-slate-300 rounded-full ml-2"/>
                          <span className="flex items-center group relative">
                            Desconocido
                            <Info 
                              className="h-3 w-3 ml-1 text-slate-400 cursor-help"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <div className="invisible group-hover:visible absolute -top-12 left-0 bg-slate-800 text-white text-xs p-2 rounded w-64">
                              Una computadora se marca como &quot;desconocida&quot; cuando no ha registrado actividad en los últimos 3 meses.
                            </div>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <div className="flex h-8 gap-px w-full">
                        {classroom.computers.map((computer) => (
                          <Tooltip key={computer.id}>
                            <TooltipTrigger asChild>
                              <button
                                className={`w-10 min-w-[10px] transition-all duration-200 ${statusColors[computer.status]} first:rounded-l last:rounded-r`}
                                onClick={() => setSelectedComputer(computer)}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="bg-slate-800 text-xs p-2">
                              <p className="text-white font-medium">{computer.name}</p>
                              <p className="text-slate-300">Último inicio: {computer.lastLogin}</p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {selectedComputer && (
          <Dialog open={!!selectedComputer} onOpenChange={() => setSelectedComputer(null)}>
            <DialogContent className="bg-white rounded-xl shadow-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center text-slate-800">
                  <Info className="mr-2 h-5 w-5 text-blue-500" />
                  Información de {selectedComputer.name}
                </DialogTitle>
              </DialogHeader>
              <div className="mt-6 space-y-4 text-slate-700">
                <p><strong>Estado:</strong> {statusNames[selectedComputer.status]}</p>
                <div className="flex items-center">
                  <strong className="mr-2">Sistema Operativo:</strong>
                  {osIcons[selectedComputer.os]}
                  <span className="ml-2 capitalize">{selectedComputer.os}</span>
                </div>
                <p><strong>Dirección IP:</strong> {selectedComputer.ip}</p>
                <p><strong>Último inicio de sesión:</strong> {selectedComputer.lastLogin}</p>
                <p><strong>Número de inicios de sesión:</strong> {selectedComputer.loginCount}</p>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </TooltipProvider>
  )
}