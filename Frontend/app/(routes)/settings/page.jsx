"use client"

import {useEffect, useRef, useState} from "react"
import useSWR from 'swr';
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {Slider} from "@/components/ui/slider"
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card"
import {ScrollArea} from "@/components/ui/scroll-area"
import {Separator} from "@/components/ui/separator"

import {AlertCircle, Clock, Database, HardDrive, Home, RotateCcw, Server, Users} from "lucide-react"
import {useToast} from "@/hooks/use-toast";
import UsersTab from "./components/UsersTab"
import ErrorServer from "@/components/ErrorServer";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("General")
  const [logRotation, setLogRotation] = useState(7)
  const [detailedLogging, setDetailedLogging] = useState(false)
  const [syslogEntries, setSyslogEntries] = useState([])
  const [syslogError, setSyslogError] = useState(null); 
  const { toast } = useToast();

  const [activeIndex, setActiveIndex] = useState(0)
  const [activeStyle, setActiveStyle] = useState({ left: "0px", width: "0px" })
  const tabRefs = useRef([])
  const tabs = ["General", "Usuarios", "Grupos", "Unidades", "Logs"]


  useEffect(() => {
    const activeEl = tabRefs.current[activeIndex]
    if (activeEl) {
      setActiveStyle({ left: `${activeEl.offsetLeft}px`, width: `${activeEl.offsetWidth}px` })
    }
  }, [activeIndex])

  useEffect(() => {
    if (tabRefs.current[0]) {
      setActiveStyle({
        left: `${tabRefs.current[0].offsetLeft}px`,
        width: `${tabRefs.current[0].offsetWidth}px`
      })
    }
  }, [])

  // Fetcher para SWR
  const fetcher = (url) => fetch(url).then(res => res.json());

  // Update systemInfo SWR hook to refresh every second
  const { data: systemInfo, error: systemInfoError } = useSWR(
    activeTab === "General" ? '/api/systeminfo' : null,
    fetcher,
    {
      refreshInterval: 1000,
      dedupingInterval: 0, 
      revalidateOnFocus: false // Opt
    }
  );

  const shouldFetchGroups = activeTab === "Usuarios" || activeTab === "Grupos";
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

    fetchSyslog().then(r => {
        if (r) {
            toast({
            title: "Error",
            description: "Error al cargar los logs del sistema",
            variant: "destructive",
            });
        }
    });

    const syslogInterval = setInterval(fetchSyslog, 5000);

    return () => {
      clearInterval(syslogInterval);
    };
  }, [activeTab])

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 ">
      <h1 className="text-4xl font-bold text-center mb-8 ">Configuración</h1>

      <div className="relative">
        {/* Se removió el div de hover */}
        <div
          className="absolute bottom-[-6px] h-[2px] bg-green-600 dark:bg-white transition-all duration-300 ease-out z-0"
          style={activeStyle}
        />
        <div className="flex space-x-2 justify-center relative z-10 ">
          {tabs.map((tab, i) => (
            <div
              key={tab}
              ref={(el) => (tabRefs.current[i] = el)}
              onClick={() => {
                setActiveTab(tab)
                setActiveIndex(i)
              }}
              className={`px-3 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-md  py-2 cursor-pointer transition-colors duration-300 ${
                activeTab === tab ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {tab}
            </div>
          ))}
        </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Lista de Grupos
                </CardTitle>
              </CardHeader>
              <CardContent>
                {groupsError ? (
                  <ErrorServer message="Error al cargar Grupos" />
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <HardDrive className="w-5 h-5" />
                  Lista de Unidades Organizacionales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ousError ? (
                  <ErrorServer message="Error al cargar las Unidades Organizacionales" />
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
                  <Label htmlFor="log-rotation">Rotación de logs (Días)</Label>
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
                  <Label htmlFor="detailed-logging">Habilitar registro detallado</Label>
                </div>
                <Button>Guardar Configuración</Button>
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