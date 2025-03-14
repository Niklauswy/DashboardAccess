import {Atom, Beaker, Cpu, Database, Leaf, Microscope, SquareFunction} from "lucide-react";

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
    { key: "givenName", label: "Nombre", fixed: true },
    { key: "sn", label: "Apellidos", fixed: true },
    { key: "ou", label: "Carrera" },
    { key: "logonCount", label: "Total Logs", sortable: true },
    { key: "lastLogon", label: "Último Inicio", sortable: true },
    { key: "groups", label: "Grupos", sortable: false }, 
    { key: "accion", label: "", fixed: true },
   
];
