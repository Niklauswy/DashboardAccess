import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { DateTimeDisplay } from "@/lib/date-utils";

const UserRow = ({ user, onEdit, selected, onToggleSelect }) => (
  <TableRow>
    <TableCell>
      <Checkbox 
        checked={selected} 
        onCheckedChange={onToggleSelect}
        aria-label={`Select ${user.username}`} 
      />
    </TableCell>

    <TableCell className="font-medium">{user.username}</TableCell>
    <TableCell className="font-medium">{user.givenName}</TableCell>
    <TableCell className="font-medium">{user.sn}</TableCell>
    <TableCell><Badge variant="primary">{user.ou}</Badge></TableCell>
    <TableCell>{user.logonCount}</TableCell>
    <TableCell>
      <DateTimeDisplay dateInput={user.lastLogon} />
    </TableCell>
    <TableCell className="hidden md:table-cell">
      <div className="flex flex-wrap gap-1 max-w-xs">
        {user.groups?.map((group) => (
          <Badge key={group} variant="secondary">
            {group}
          </Badge>
        ))}
      </div>
    </TableCell>
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