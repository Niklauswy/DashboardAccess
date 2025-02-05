'use client'
import React, { useState } from 'react'
import useSWR from 'swr'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Monitor, School, Info, Command } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip"
import { Terminal, Apple, HelpCircle } from "lucide-react"
import ErrorServer from '@/components/ErrorServer'
import NoData from '@/components/NoData'

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
    return <ErrorServer message={classroomsData.error} onRetry={handleRetry} />;
  }

  if (error) {
    return <ErrorServer message="No se pudieron obtener los datos de las computadoras." onRetry={handleRetry} />;
  }

  if (!classroomsData) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        {/* ...existing loading skeleton code... */}
      </div>
    )
  }

  let classrooms = []
  if (classroomsData) {
    console.log('Classrooms Data:', classroomsData)
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
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        {/* Full-width container */}
        <div className="w-full mx-auto space-y-6">
          {classrooms.map((classroom) => {
            const totalComputers = classroom.computers.length;
            const activeComputers = classroom.computers.filter(c => c.status === 'activa').length;
            const activePercentage = ((activeComputers / totalComputers) * 100).toFixed(1);
            return (
              <Card key={classroom.id} className="w-full shadow-lg border-0 bg-white/50 backdrop-blur p-4">
                {/* Redesigned header */}
                <CardHeader className="border-b border-slate-100 bg-white pb-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-2xl font-semibold text-slate-800 flex items-center gap-2">
                        <School className="h-6 w-6 text-slate-600" />
                        {classroom.name}
                      </CardTitle>
                      <p className="text-sm text-slate-500">{totalComputers} computadoras</p>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-emerald-50 text-emerald-700">
                      {activePercentage}% Activas
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    {/* Existing status legend and computer buttons */}
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 text-xs text-slate-500">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                        <span>Activa</span>
                        <div className="w-2 h-2 bg-amber-500 rounded-full ml-2" />
                        <span>Mantenimiento</span>
                        <div className="w-2 h-2 bg-slate-300 rounded-full ml-2" />
                        <span className="flex items-center group relative">
                          Desconocido
                          <Info 
                            className="h-3 w-3 ml-1 text-slate-400 cursor-help"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="invisible group-hover:visible absolute -top-12 left-0 bg-slate-800 text-white text-xs p-2 rounded w-64">
                            Se marca como &quot;desconocida&quot; cuando no ha registrado actividad en 3 meses.
                          </div>
                        </span>
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

                    {/* New tracker section inspired by Tremor design */}
                    <div className="mt-4">
                      <div className="flex h-2 space-x-1">
                        {classroom.computers.map((computer, index) => (
                          <div
                            key={index}
                            className={`flex-1 rounded ${statusColors[computer.status]}`}
                            title={computer.name}
                          ></div>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs mt-1 text-slate-500">
                        <span>Hace 60 días</span>
                        <span>Hoy</span>
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