import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";

const UserRow = ({ user, onEdit }) => (
  <TableRow>
    <TableCell className="hidden sm:table-cell">
      <Image alt="Product image" className="aspect-square rounded-md object-cover" height="64"  src={`https://robohash.org/${user.name}?set=set1`}  width="64" />
    </TableCell>
    <TableCell className="font-medium">{user.username}</TableCell>
    <TableCell className="font-medium">{user.name}</TableCell>
    <TableCell><Badge variant="primary" className="bg-red-400 text-white">{user.ou}</Badge></TableCell>
    <TableCell>{user.logonCount}</TableCell>
    <TableCell className="hidden md:table-cell">{user.group}</TableCell>
    <TableCell className="hidden md:table-cell">{user.lastLogon}</TableCell>
    <TableCell>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={onEdit}>Editar</DropdownMenuItem>
          <DropdownMenuItem>Eliminar</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableCell>
  </TableRow>
);

export default UserRow;