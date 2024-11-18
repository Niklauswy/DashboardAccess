
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export default function UserTableSkeleton() {
    return (
        <div className="p-4 space-y-4 min-h-screen">
            <div className="flex items-center justify-between space-x-4">
                <Skeleton className="h-8 w-64" /> {/* Skeleton del título o encabezado */}
            </div>
            <div className="rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                        <tr>
                            {Array.from({ length: 6 }).map((_, index) => (
                                <th key={index} className="px-6 py-3 bg-gray-50">
                                    <Skeleton className="h-4 w-24" />
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: 10 }).map((_, rowIndex) => (
                            <tr key={rowIndex} className="bg-white">
                                {Array.from({ length: 6 }).map((_, colIndex) => (
                                    <td key={colIndex} className="px-6 py-4">
                                        <Skeleton className="h-4 w-full" />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}