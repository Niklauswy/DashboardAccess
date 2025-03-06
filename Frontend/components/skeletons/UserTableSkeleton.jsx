import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function UserTableSkeleton() {
  // Create an array of rows for the skeleton
  const skeletonRows = Array.from({ length: 10 }, (_, i) => i);
  
  return (
    <div className="p-4 md:p-8 flex flex-col min-h-screen space-y-4 animate-pulse">
      {/* Skeleton for filter section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="h-10 w-64 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-36 bg-gray-200 rounded-md"></div>
          <div className="h-8 w-20 bg-gray-200 rounded-full"></div>
          <div className="h-8 w-24 bg-gray-200 rounded-full"></div>
        </div>
        <div className="flex items-center gap-4">
          <div className="h-10 w-24 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-32 bg-gray-200 rounded-md"></div>
          <div className="h-10 w-40 bg-gray-200 rounded-md"></div>
        </div>
      </div>

      {/* Skeleton for table */}
      <div className="rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <div className="h-4 w-4 bg-gray-200 rounded"></div>
              </TableHead>
              <TableHead><div className="h-5 w-24 bg-gray-200 rounded"></div></TableHead>
              <TableHead><div className="h-5 w-32 bg-gray-200 rounded"></div></TableHead>
              <TableHead><div className="h-5 w-20 bg-gray-200 rounded"></div></TableHead>
              <TableHead><div className="h-5 w-28 bg-gray-200 rounded"></div></TableHead>
              <TableHead><div className="h-5 w-36 bg-gray-200 rounded"></div></TableHead>
              <TableHead><div className="h-5 w-28 bg-gray-200 rounded"></div></TableHead>
              <TableHead><div className="h-5 w-10 bg-gray-200 rounded"></div></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {skeletonRows.map((row) => (
              <TableRow key={row} className="hover:bg-gray-50">
                <TableCell>
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                </TableCell>
                <TableCell><div className="h-5 w-24 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-5 w-32 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-5 w-16 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-5 w-16 bg-gray-200 rounded"></div></TableCell>
                <TableCell><div className="h-5 w-32 bg-gray-200 rounded"></div></TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                    <div className="h-6 w-16 bg-gray-200 rounded-full"></div>
                  </div>
                </TableCell>
                <TableCell><div className="h-8 w-8 bg-gray-200 rounded"></div></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Skeleton for pagination */}
      <div className="flex justify-between items-center">
        <div className="h-5 w-48 bg-gray-200 rounded"></div>
        <div className="flex items-center space-x-2">
          <div className="h-5 w-36 bg-gray-200 rounded"></div>
          <div className="h-8 w-24 bg-gray-200 rounded"></div>
          <div className="h-5 w-32 bg-gray-200 rounded"></div>
          <div className="flex space-x-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-8 w-8 bg-gray-200 rounded-full"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
