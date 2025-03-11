import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogIn, LogOut, Link2 } from "lucide-react";

const LogRow = ({ log, index }) => {
  const rowClass = index % 2 === 0 ? 'bg-muted/50' : '';
  
  // Determine badge color based on event type
  const getEventBadge = (event) => {
    if (!event) return <Badge variant="outline">Desconocido</Badge>;
    
    const lowerEvent = event.toLowerCase();
    
    // Exact match check first for disconnect
    if (lowerEvent === 'disconnect') {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">
          <LogOut className="mr-1 h-3 w-3" />
          {event}
        </Badge>
      );
    }
    
    // Exact match for connect
    if (lowerEvent === 'connect') {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200">
          <Link2 className="mr-1 h-3 w-3" />
          {event}
        </Badge>
      );
    }
    
 
    
    return <Badge variant="outline">{event}</Badge>;
  };

  return (
    <TableRow className={rowClass}>
      <TableCell className="font-medium">{log.user || '-'}</TableCell>
      <TableCell>{log.ip || '-'}</TableCell>
      <TableCell>{log.id_computer || '-'}</TableCell>
      <TableCell>{log.lab || '-'}</TableCell>
      <TableCell>{getEventBadge(log.event)}</TableCell>
      <TableCell className="text-right font-mono text-xs">
        {log.formattedDate || log.date || '-'}
      </TableCell>
    </TableRow>
  );
};

export default LogRow;