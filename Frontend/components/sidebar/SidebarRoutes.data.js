import {
    Computer,
    FileBarChart2,
    FileQuestion,
    Logs,
     RectangleEllipsis, SettingsIcon,
    User,

} from "lucide-react";


export const dataSlidebarRoutes = [

    {
        icon: RectangleEllipsis,
        label: "Menú",
        href: "/",
        section: "general"


    },
    {
        icon: Logs,
        label: "Logs",
        href: "/logs",
        section: "gestionar"
    },
    {
        icon: Computer,
        label: "Computadoras",
        href: "/computers",
        section: "gestionar"

    },
    {
        icon: User,
        label: "Usuarios",
        href: "/users",
        section: "gestionar"

    },

 {
        icon: SettingsIcon,
        label: "Configuración",
        href: "/settings",
        section: "soporte"
    },
    {
        icon: FileQuestion,
        label: "FAQ",
        href: "/faq",
        section: "soporte",
    },
    {
        icon: FileBarChart2,
        label: "Reportes",
        href: "/reports",
        section: "general"

    }


]