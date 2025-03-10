import { Cpu, Database, SquareFunction, Atom, Beaker, Leaf, Microscope } from "lucide-react";

export const careerIcons = {
    CC: <Cpu className="h-4 w-4" />,
    CDD: <Database className="h-4 w-4" />,
    MAT: <SquareFunction className="h-4 w-4" />,
    FIS: <Atom className="h-4 w-4" />,
    TCCE: <Beaker className="h-4 w-4" />,
    TCCN: <Leaf className="h-4 w-4" />,
    BIO: <Microscope className="h-4 w-4" />,
};

export const columns = [
    { key: "username", label: "Usuario", fixed: true },
    { key: "name", label: "Nombre", fixed: true },
    { key: "ou", label: "Carrera" },
    { key: "logonCount", label: "Total Logs", sortable: true },
    { key: "lastLogon", label: "Último Inicio", sortable: true },
    { key: "groups", label: "Grupos", sortable: false }, 
    { key: "accion", label: "", fixed: true },
    {
        header: "Nombre",
        id: "givenName",
        accessorKey: "givenName",
        cell: ({ row }) => <div>{row.original.givenName || 'N/A'}</div>,
    },
    {
        header: "Apellido",
        id: "sn",
        accessorKey: "sn",
        cell: ({ row }) => <div>{row.original.sn || 'N/A'}</div>,
    },
    {
        header: "Nombre Completo",
        id: "displayName",
        accessorKey: "displayName",
        cell: ({ row }) => <div>{row.original.displayName || 'N/A'}</div>,
    },
];
