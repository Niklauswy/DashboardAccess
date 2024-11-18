import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const TabsComponent = ({ children }) => (
  <Tabs defaultValue="all">
    <div className="flex items-center">
      <TabsList>
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="active">Estudiantes</TabsTrigger>
        <TabsTrigger value="draft">Maestros</TabsTrigger>
        <TabsTrigger value="CDD">Invitados</TabsTrigger>
        <TabsTrigger value="archived" className="hidden sm:flex">Otros</TabsTrigger>
      </TabsList>
    </div>
    {children}
  </Tabs>
)

export default TabsComponent