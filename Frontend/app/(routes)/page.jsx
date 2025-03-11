"use client"
import { useState, useEffect } from "react";
import { format, parse, differenceInDays, differenceInHours, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Activity, BarChart3, Users, Monitor, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ActivityAreaChart } from "@/components/analytics/ActivityAreaChart";
import { LabeledBarChart } from "@/components/analytics/LabeledBarChart";

// Import hooks
import { useLogs } from "@/hooks/useLogs";
import { useUsers } from "@/hooks/useUsers";
import { useComputers } from "@/hooks/useComputers";

export function Dashboard() {
  const { logs, isLoading: logsLoading, refreshLogs } = useLogs();
  const { users, isLoading: usersLoading, refreshUsers } = useUsers();
  const { computers, groupedComputers, isLoading: computersLoading, refreshComputers } = useComputers();
  
  const [stats, setStats] = useState({
    activeSessions: 0,
    activeUsers: 0,
    activeComputers: 0,
    averageSessionTime: "0h",
    topUsers: [],
    loginsByHour: [],
    osDistribution: [],
    hourlyActivity: [],
    recentActivity: [],
    unusualIPs: []
  });

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57'];

  // Process data when it's available
  useEffect(() => {
    if (logsLoading || usersLoading || computersLoading) return;
    
    calculateStatistics();
  }, [logs, users, computers, logsLoading, usersLoading, computersLoading]);

  const calculateStatistics = () => {
    // Get active sessions (logins in the last week)
    const now = new Date();
    const recentLogs = logs.filter(log => {
      try {
        const [datePart, timePart] = log.date.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return differenceInDays(now, dateObj) <= 7;
      } catch (e) {
        return false;
      }
    });
    
    // Count unique users with logins in the last week
    const activeUsernames = [...new Set(recentLogs.map(log => log.user))];
    
    // Calculate OS Distribution
    const osCount = {};
    computers.forEach(computer => {
      const os = computer.operatingSystem || 'Unknown';
      if (!osCount[os]) osCount[os] = 0;
      osCount[os]++;
    });
    
    const osDistribution = Object.entries(osCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Only top 5 OS
    
    // Calculate top users by login count
    const topUsers = [...users]
      .sort((a, b) => (b.logonCount || 0) - (a.logonCount || 0))
      .slice(0, 7) // Top 7 users
      .map(user => ({ name: user.username, value: user.logonCount || 0 }));
    
    // Calculate login activity by hour
    const hourCounts = Array(24).fill(0);
    logs.forEach(log => {
      try {
        const time = log.date.split(' ')[1];
        const hour = parseInt(time.split(':')[0], 10);
        if (!isNaN(hour) && hour >= 0 && hour < 24) {
          hourCounts[hour]++;
        }
      } catch (e) {
        // Skip invalid date formats
      }
    });
    
    // Format hourly activity for chart
    const hourlyActivity = hourCounts.map((count, hour) => ({
      hour: hour < 10 ? `0${hour}:00` : `${hour}:00`,
      count
    }));
    
    // Calculate active computers
    const activeComputers = computers.filter(computer => 
      computer.status === 'Activa'
    ).length;
    
    // Find unusual IPs
    const ipCounts = {};
    logs.forEach(log => {
      if (!ipCounts[log.ip]) ipCounts[log.ip] = 0;
      ipCounts[log.ip]++;
    });
    
    const unusualIPs = Object.entries(ipCounts)
      .filter(([ip, count]) => count < 3 && ip && ip !== 'undefined')
      .sort((a, b) => a[1] - b[1])
      .slice(0, 5)
      .map(([ip, count]) => ({ ip, count }));
    
    // Set all calculated statistics
    setStats({
      activeSessions: recentLogs.length,
      activeUsers: activeUsernames.length,
      activeComputers,
      averageSessionTime: "2.5h", 
      topUsers,
      hourlyActivity,
      osDistribution,
      recentActivity: logs.slice(0, 5), // Just 5 most recent
      unusualIPs
    });
  };

  if (logsLoading || usersLoading || computersLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando datos del dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-6">
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
            <p className="text-xs text-muted-foreground">Última semana</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Usuarios Activos</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Usuarios únicos con actividad reciente</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Computadoras Activas</CardTitle>
            <Monitor className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeComputers}</div>
            <p className="text-xs text-muted-foreground">Equipos con actividad reciente</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tiempo Promedio de Sesión</CardTitle>
            <Clock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageSessionTime}</div>
            <p className="text-xs text-muted-foreground">Duración promedio</p>
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
            trend: "Mayor actividad entre las 09:00 y 11:00",
            description: `Basado en ${logs.length} registros de inicios de sesión`
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
            Basado en {computers.length} equipos registrados
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
          footer={`Total de ${users.length} usuarios registrados`}
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
            </div>
          </CardContent>
          <CardFooter className="text-sm text-muted-foreground">
            IPs con menos de 3 ocurrencias en los registros
          </CardFooter>
        </Card>
      </div>
      
      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>Últimos inicios de sesión registrados</CardDescription>
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
            onClick={refreshLogs}
          >
            Ver todos los registros
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default Dashboard;
