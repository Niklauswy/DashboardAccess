"use client"
import {Activity, AlertTriangle, Clock, Monitor, Users} from "lucide-react";
import {Cell, Pie, PieChart, ResponsiveContainer} from "recharts";

import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {ActivityAreaChart} from "@/components/analytics/ActivityAreaChart";
import {LabeledBarChart} from "@/components/analytics/LabeledBarChart";

// Importar el nuevo hook
import {useDashboardStats} from "@/hooks/useDashboardStats";
import Image from "next/image";

export function Dashboard() {
  const { stats, isLoading, refreshStats } = useDashboardStats();
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'];

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando datos del dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Image
          src="/vercel.svg"
          alt="Logo Cimarron UABC"
          width={80}
          height={80}
          className="mx-auto opacity-80"
      />
      <h1 className="text-3xl font-bold mb-8">Dashboard de Auditoría</h1>
      
      {/* Key Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">Conexiones sin desconexión</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Con sesiones abiertas</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Computadoras Activas</CardTitle>
            <Monitor className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeComputers}</div>
            <p className="text-xs text-muted-foreground">Actividad en las últimas 3 horas</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio de Sesión</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSessionTime}</div>
            <p className="text-xs text-muted-foreground">Basado en sesiones completas</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Hourly Activity Chart - Using Area Chart */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <ActivityAreaChart
          title="Actividad por Hora"
          description="Distribución de inicios de sesión durante el día"
          data={stats.hourlyActivity}
          dataKeys={[
            { dataKey: 'count', label: 'Inicios de sesión', color: 'hsl(215, 100%, 50%)' }
          ]}
          stacked={false}
          footer={{
            trend: "Monitoreo en tiempo real",
            description: "Estadísticas calculadas en el servidor"
          }}
          className="lg:col-span-2"
        />

        {/* OS Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Sistemas Operativos</CardTitle>
            <CardDescription>Distribución por SO</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.osDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {stats.osDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            Basado en la información de Active Directory
          </CardFooter>
        </Card>
      </div>
      
      {/* Top Users and Unusual Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {/* Top Users - Using Labeled Bar Chart */}
        <LabeledBarChart
          title="Usuarios más Activos"
          description="Por número de inicios de sesión"
          data={stats.topUsers}
          dataKey="value"
          nameKey="name"
          vertical={true}
          color="hsl(210, 100%, 50%)"
          footer="Basado en contador de inicios de sesión"
          className="lg:col-span-2"
        />
        
        {/* Unusual IPs */}
        <Card className="border border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <CardTitle>IPs Inusuales</CardTitle>
            </div>
            <CardDescription>Posible actividad irregular</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.unusualIPs.map((item, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div className="font-medium">{item.ip}</div>
                  <div className="text-red-500 text-sm font-semibold">{item.count} {item.count === 1 ? 'ocurrencia' : 'ocurrencias'}</div>
                </div>
              ))}
              {stats.unusualIPs.length === 0 && (
                <div className="text-center text-muted-foreground py-4">No se encontraron IPs inusuales</div>
              )}
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            IPs con menos de 3 apariciones en logs
          </CardFooter>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimos eventos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Usuario</th>
                    <th className="text-left font-medium p-2">Evento</th>
                    <th className="text-left font-medium p-2">IP</th>
                    <th className="text-left font-medium p-2">Fecha y Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentActivity.map((log, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2">{log.user}</td>
                      <td className="p-2">{log.event}</td>
                      <td className="p-2">{log.ip}</td>
                      <td className="p-2 text-muted-foreground">{log.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <button 
              className="text-sm text-primary hover:underline"
              onClick={refreshStats}
            >
              Actualizar estadísticas
            </button>
          </CardFooter>
        </Card>
        
        {/* Active Sessions Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sesiones Activas</CardTitle>
            <CardDescription>Sesiones abiertas actualmente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto max-h-[400px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left font-medium p-2">Usuario</th>
                    <th className="text-left font-medium p-2">IP</th>
                    <th className="text-left font-medium p-2">Inicio</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.sessionList && stats.sessionList.map((session, index) => (
                    <tr key={index} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{session.user}</td>
                      <td className="p-2">{session.ip}</td>
                      <td className="p-2 text-muted-foreground">
                        {session.start_time ? new Date(session.start_time).toLocaleString() : 'Desconocido'}
                      </td>
                    </tr>
                  ))}
                  {!stats.sessionList || stats.sessionList.length === 0 && (
                    <tr>
                      <td colSpan="3" className="p-4 text-center text-muted-foreground">No hay sesiones activas</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
