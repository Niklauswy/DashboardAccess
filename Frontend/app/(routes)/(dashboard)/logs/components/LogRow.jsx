import React from 'react';
import { TableCell, TableRow } from "@/components/ui/table";

const LogRow = ({ log, index }) => {
  const rowClass = index % 2 === 0 ? 'bg-gray-100' : 'bg-white';
  return (
    <TableRow className={rowClass}>
      <TableCell>{log.user}</TableCell>
      <TableCell>{log.ip}</TableCell>
        <TableCell>{log.id_computer}</TableCell>
        <TableCell>{log.lab}</TableCell>
      <TableCell>{log.event}</TableCell>
      <TableCell>{log.date}</TableCell>
    </TableRow>
  );
};

export default LogRow;