"use client"

import { useState, useEffect } from "react"
import useSWR from 'swr'; // Importar useSWR para manejo eficiente de datos
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, FileSpreadsheet, HardDrive, AlertCircle, RotateCcw, Clock, Server, Info, Database, Home } from "lucide-react"
import Papa from 'papaparse'; // ensure PapaParse is imported
import { useToast } from "@/hooks/use-toast"; // NEW toast import
import UsersTab from "./UsersTab"  // New import for separated Usuarios component

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General")
  const [logRotation, setLogRotation] = useState(7)
  const [detailedLogging, setDetailedLogging] = useState(false)
  const [syslogEntries, setSyslogEntries] = useState([])
  const [syslogError, setSyslogError] = useState(null); // Nuevo estado para errores de syslog
  const { toast } = useToast(); // initialize toast hook

  // Fetcher para SWR
  const fetcher = (url) => fetch(url).then(res => res.json());

  // Update systemInfo SWR hook to refresh every second
  const { data: systemInfo, error: systemInfoError } = useSWR(
    activeTab === "General" ? '/api/systeminfo' : null,
    fetcher,
    {
      refreshInterval: 1000,
      dedupingInterval: 0, // Add this
      revalidateOnFocus: false // Optional
    }
  );

  // Conditionally fetch groups when in Usuarios or Grupos tabs
  const shouldFetchGroups = activeTab === "Usuarios" || activeTab === "Grupos";
  // Fetch OUs also when activeTab is Unidades
  const shouldFetchOus = activeTab === "Usuarios" || activeTab === "Grupos" || activeTab === "Unidades";
  const { data: groups, error: groupsError } = useSWR(
    shouldFetchGroups ? '/api/groups' : null,
    fetcher
  );
  const { data: ous, error: ousError } = useSWR(
    shouldFetchOus ? '/api/ous' : null,
    fetcher
  );

  // Fetch syslog only if "Logs" tab is active
  useEffect(() => {
    if (activeTab !== "Logs") return;
    const fetchSyslog = async () => {
      try {
        const response = await fetch('/api/syslog');
        const result = await response.json();
        if (response.ok) {
          setSyslogEntries(result.syslog);
          setSyslogError(null); // Resetear error si la solicitud es exitosa
        } else {
          console.error(result.error);
          setSyslogError(result.error); // Establecer mensaje de error
        }
      } catch (error) {
        console.error('Error fetching syslog:', error);
        setSyslogError('Error fetching syslog'); // Establecer mensaje de error
      }
    };

    // Realizar la solicitud inicial
    fetchSyslog();

    // Configurar polling para syslog cada 5 segundos
    const syslogInterval = setInterval(fetchSyslog, 5000);

    return () => {
      clearInterval(syslogInterval);
    };
  }, [activeTab])

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Configuración</h1>

      <div role="tablist" className="flex flex-wrap justify-center gap-4 border-b">
        {["General", "Usuarios", "Grupos", "Unidades", "Logs"].map(tab => (
          <Button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            variant={activeTab === tab ? "primary" : "ghost"}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 border-b-2"
          >
            {tab}
          </Button>
        ))}
      </div>

      <div className="mt-6">
        {activeTab === "General" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Server className="w-5 h-5" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {systemInfoError ? (
                <p className="text-red-500">{systemInfoError}</p>
              ) : (
                <>
                  <p><Clock className="inline w-4 h-4 mr-2" /> Time: {systemInfo?.time}</p>
                  <p><Home className="inline w-4 h-4 mr-2" /> Hostname: {systemInfo?.hostname}</p>
                  <p><Server className="inline w-4 h-4 mr-2" /> Domain: {systemInfo?.domain}</p>
                  <p><AlertCircle className="inline w-4 h-4 mr-2" /> Core version: {systemInfo?.coreVersion}</p>
                  <p><HardDrive className="inline w-4 h-4 mr-2" /> Software: {systemInfo?.software}</p>
                  <p><AlertCircle className="inline w-4 h-4 mr-2" /> System load: {systemInfo?.systemLoad}</p>
                  <p><Clock className="inline w-4 h-4 mr-2" /> Uptime: {systemInfo?.uptime}</p>
                  <p><Database className="inline w-4 h-4 mr-2" /> Storage: {systemInfo?.storage}</p>
                </>
              )}
            </CardContent>
          </Card>
        )}
        {activeTab === "Usuarios" && (
          <UsersTab />
        )}
        {activeTab === "Grupos" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Manejo de Grupos</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Grupos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupsError ? (
                  <p className="text-red-500">Error al cargar grupos</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {groups && groups.map((group, index) => (
                      <li key={index} className="mt-2">{group}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "Unidades" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Unidades Organizacionales</h2>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Lista de Unidades Organizacionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ousError ? (
                  <p className="text-red-500">Error al cargar Unidades Organizacionales</p>
                ) : (
                  <ul className="list-disc pl-5">
                    {ous && ous.map((ou, index) => (
                      <li key={index} className="mt-2">{ou}</li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {activeTab === "Logs" && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Configuración de Logs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="log-rotation">Log Rotation (days)</Label>
                  <div className="flex items-center space-x-2">
                    <RotateCcw className="w-4 h-4 text-gray-500" />
                    <Slider
                      id="log-rotation"
                      min={1}
                      max={120}
                      step={1}
                      value={[logRotation]}
                      onValueChange={(value) => setLogRotation(value[0])}
                    />
                    <span className="w-12 text-right">{logRotation}</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="detailed-logging"
                    checked={detailedLogging}
                    onCheckedChange={setDetailedLogging}
                  />
                  <Label htmlFor="detailed-logging">Enable Detailed Logging</Label>
                </div>
                <Button>Save Log Settings</Button>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Live Syslog
                </CardTitle>
              </CardHeader>
              <CardContent>
                {syslogError ? (
                  <p className="text-red-500">{syslogError}</p>
                ) : (
                  <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                    {syslogEntries.map((entry, index) => (
                      <p key={index} className="text-sm">{entry}</p>
                    ))}
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}