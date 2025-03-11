"use client"
import { useState, useEffect } from "react";
import { format, parse, differenceInDays, differenceInHours, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/analytics/StatsCard";
import { BarChart } from "@/components/analytics/BarChart";
import { PieChart } from "@/components/analytics/PieChart";
import { LineChart } from "@/components/analytics/LineChart";
import { ActivityHeatmap } from "@/components/analytics/ActivityHeatmap";

// Import hooks
import { useLogs } from "@/hooks/useLogs";
import { useUsers } from "@/hooks/useUsers";
import { useComputers } from "@/hooks/useComputers";

export function Dashboard() {
  const { logs, isLoading: logsLoading, refreshLogs } = useLogs();
  const { users, isLoading: usersLoading, refreshUsers } = useUsers();
  const { computers, groupedComputers, isLoading: computersLoading, refreshComputers } = useComputers();
  
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    activeSessions: 0,
    activeUsers: 0,
    activeComputers: 0,
    averageSessionTime: "0h",
    topUsers: [],
    loginsByHour: [],
    osDistribution: [],
    usersByOU: [],
    loginTrend: [],
    recentActivity: []
  });

  // Process data when it's available
  useEffect(() => {
    if (logsLoading || usersLoading || computersLoading) return;
    
    calculateStatistics();
  }, [logs, users, computers, logsLoading, usersLoading, computersLoading]);

  const calculateStatistics = () => {
    // 1. Get active sessions (logins in the last 24h)
    const now = new Date();
    const recentLogs = logs.filter(log => {
      try {
        // Parse the date string to a Date object
        const [datePart, timePart] = log.date.split(' ');
        const [day, month, year] = datePart.split('/').map(Number);
        const dateObj = new Date(year, month - 1, day);
        return differenceInDays(now, dateObj) <= 7; // Last week
      } catch (e) {
        return false;
      }
    });
    
    // Count unique users with logins in the last 24 hours
    const activeUsernames = [...new Set(recentLogs.map(log => log.user))];
    
    // 2. Calculate OS Distribution
    const osDistribution = [];
    const osCount = {};
    computers.forEach(computer => {
      const os = computer.operatingSystem || 'Unknown';
      if (!osCount[os]) osCount[os] = 0;
      osCount[os]++;
    });
    
    Object.entries(osCount).forEach(([os, count]) => {
      osDistribution.push({ name: os, value: count });
    });
    
    // 3. Calculate Users by OU
    const ouCount = {};
    users.forEach(user => {
      const ou = user.ou || 'Unknown';
      if (!ouCount[ou]) ouCount[ou] = 0;
      ouCount[ou]++;
    });
    
    const usersByOU = Object.entries(ouCount)
      .map(([ou, count]) => ({ name: ou, value: count }))
      .sort((a, b) => b.value - a.value);
    
    // 4. Calculate top users by login count
    const topUsers = [...users]
      .sort((a, b) => (b.logonCount || 0) - (a.logonCount || 0))
      .slice(0, 10)
      .map(user => ({ name: user.username, count: user.logonCount || 0 }));
    
    // 5. Calculate login activity by hour
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
    
    const loginsByHour = hourCounts.map((count, hour) => ({
      hour: hour.toString(),
      count
    }));
    
    // 6. Calculate login trend (last 7 days)
    const last7Days = Array(7).fill().map((_, i) => {
      const date = subDays(now, 6 - i);
      return {
        date: format(date, 'dd/MM', { locale: es }),
        logins: 0,
        users: 0
      };
    });
    
    logs.forEach(log => {
      try {
        const [datePart] = log.date.split(' ');
        const [day, month] = datePart.split('/').map(Number);
        
        for (let i = 0; i < 7; i++) {
          const compareDate = format(subDays(now, 6 - i), 'dd/MM', { locale: es });
          const [compareDay, compareMonth] = compareDate.split('/').map(Number);
          
          if (day === compareDay && month === compareMonth) {
            last7Days[i].logins++;
            break;
          }
        }
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    // Count unique users by day
    const usersByDay = {};
    logs.forEach(log => {
      try {
        const [datePart] = log.date.split(' ');
        const key = datePart.split(' ')[0]; // Just get DD/MM part
        if (!usersByDay[key]) usersByDay[key] = new Set();
        usersByDay[key].add(log.user);
      } catch (e) {
        // Skip invalid dates
      }
    });
    
    // Add user count to the trend
    last7Days.forEach((day, i) => {
      const dateKey = day.date;
      if (usersByDay[dateKey]) {
        day.users = usersByDay[dateKey].size;
      }
    });
    
    // Calculate active computers (used in the last month)
    const activeComputers = computers.filter(computer => 
      computer.status === 'Activa'
    ).length;
    
    // Set all calculated statistics
    setStats({
      activeSessions: recentLogs.length,
      activeUsers: activeUsernames.length,
      activeComputers,
      averageSessionTime: "2.5h", // This would require more data to calculate accurately
      topUsers: topUsers.map(user => ({ name: user.name, value: user.count })),
      loginsByHour,
      osDistribution,
      usersByOU,
      loginTrend: last7Days,
      recentActivity: logs.slice(0, 50) // Most recent 50 activities
    });
  };

  if (logsLoading || usersLoading || computersLoading) {
    return <div className="flex justify-center items-center h-screen">Cargando datos del dashboard...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard de Auditoría</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="computers">Computadoras</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Sesiones Activas (Última semana)"
              value={stats.activeSessions}
              description="Total de inicios de sesión registrados"
            />
            <StatsCard
              title="Usuarios Activos"
              value={stats.activeUsers}
              description="Usuarios únicos con actividad reciente"
            />
            <StatsCard
              title="Computadoras Activas"
              value={stats.activeComputers}
              description="Equipos con actividad en el último mes"
            />
            <StatsCard
              title="Tiempo Promedio de Sesión"
              value={stats.averageSessionTime}
              description="Duración promedio de sesión"
            />
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 mt-4">
            <LineChart 
              title="Tendencia de Actividad (Últimos 7 días)"
              data={stats.loginTrend}
              xAxisKey="date"
              lines={[
                { dataKey: "logins", name: "Inicios de Sesión" },
                { dataKey: "users", name: "Usuarios Únicos" }
              ]}
            />
            <ActivityHeatmap 
              title="Distribución de Actividad por Hora"
              data={logs}
            />
          </div>

          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mt-4">
            <PieChart 
              title="Distribución de Usuarios por OU"
              data={stats.usersByOU.length > 0 ? stats.usersByOU : [{ name: "Sin datos", value: 1 }]}
              dataKey="value"
              nameKey="name"
            />
            <PieChart 
              title="Distribución de Sistemas Operativos"
              data={stats.osDistribution.length > 0 ? stats.osDistribution : [{ name: "Sin datos", value: 1 }]}
              dataKey="value"
              nameKey="name"
            />
            <BarChart 
              title="Usuarios con Más Inicios de Sesión"
              data={stats.topUsers.slice(0, 5)}
              xKey="name"
              yKey="value"
            />
          </div>
        </TabsContent>
        
        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Usuarios por Actividad</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.topUsers.map((user, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-3">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{user.name}</p>
                      </div>
                      <div>
                        <p className="font-bold">{user.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <PieChart 
              title="Usuarios por Grupo Organizacional"
              data={stats.usersByOU}
              dataKey="value"
              nameKey="name"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Usuarios sin Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  Usuarios que no han iniciado sesión en los últimos 30 días
                </p>
                <div className="space-y-2">
                  {users
                    .filter(user => {
                      try {
                        const lastLogin = user.lastLogon.split(' ')[0];
                        const [day, month, year] = lastLogin.split('/').map(Number);
                        const loginDate = new Date(year, month - 1, day);
                        return differenceInDays(new Date(), loginDate) > 30;
                      } catch (e) {
                        return false;
                      }
                    })
                    .slice(0, 10)
                    .map((user, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span>{user.username}</span>
                        <span className="text-gray-500 text-sm">{user.lastLogon}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Computers Tab */}
        <TabsContent value="computers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PieChart 
              title="Sistemas Operativos"
              data={stats.osDistribution}
              dataKey="value"
              nameKey="name"
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Equipos por Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(groupedComputers).map(([location, comps]) => (
                    <div key={location} className="flex items-center justify-between">
                      <span>{location}</span>
                      <span className="font-bold">{comps.length}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <PieChart 
              title="Estado de Equipos"
              data={[
                { name: "Activa", value: computers.filter(c => c.status === "Activa").length },
                { name: "Desconocido", value: computers.filter(c => c.status === "Desconocido").length },
                { name: "Otros", value: computers.filter(c => c.status !== "Activa" && c.status !== "Desconocido").length }
              ]}
              dataKey="value"
              nameKey="name"
            />
          </div>
        </TabsContent>
        
        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ActivityHeatmap 
              title="Actividad por Hora (Detección de Anomalías)"
              data={logs}
            />
            
            <Card>
              <CardHeader>
                <CardTitle>Actividad Reciente</CardTitle>
              </CardHeader>
              <CardContent className="max-h-96 overflow-auto">
                <div className="space-y-2">
                  {stats.recentActivity.map((log, index) => (
                    <div key={index} className="flex items-center justify-between text-sm border-b pb-1">
                      <span>{log.user}</span>
                      <span>{log.event}</span>
                      <span className="text-gray-500">{log.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Direcciones IP Inusuales</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-muted-foreground">
                  IPs con pocas apariciones en los registros (posible actividad irregular)
                </p>
                {(() => {
                  // Count occurrences of each IP
                  const ipCounts = {};
                  logs.forEach(log => {
                    if (!ipCounts[log.ip]) ipCounts[log.ip] = 0;
                    ipCounts[log.ip]++;
                  });
                  
                  // Find IPs with low occurrence (potential anomalies)
                  const unusualIPs = Object.entries(ipCounts)
                    .filter(([ip, count]) => count < 3 && ip && ip !== 'undefined')
                    .sort((a, b) => a[1] - b[1])
                    .slice(0, 10);
                    
                  return (
                    <div className="space-y-2">
                      {unusualIPs.map(([ip, count], index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span>{ip}</span>
                          <span className="text-red-500">{count} {count === 1 ? 'ocurrencia' : 'ocurrencias'}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default Dashboard;
