import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUp, ArrowDown, ChevronDown } from "lucide-react";

export default function TableHeader({
    columns,
    visibleColumns,
    sortColumn,
    sortDirection,
    handleSort,
    paginatedUsers,
    selectedRows,
    toggleAllRows
}) {
    return (
        <TableHeader>
            <TableRow>
                <TableHead className="w-[50px]">
                    <Checkbox
                        checked={selectedRows.length === paginatedUsers.length && paginatedUsers.length > 0}
                        onCheckedChange={() => toggleAllRows(paginatedUsers)}
                        aria-label="Select all rows"
                    />
                </TableHead>
                {columns.filter((col) => visibleColumns.includes(col.key)).map((column) => (
                    <TableHead key={column.key}>
                        {column.sortable ? (
                            <Button 
                                variant="ghost" 
                                className="hover:bg-gray-100 -ml-4 h-8" 
                                onClick={() => handleSort(column.key)}
                            >
                                {column.label}
                                {sortColumn === column.key ? (
                                    sortDirection === "asc" ? 
                                        <ArrowUp className="ml-2 h-4 w-4" /> : 
                                        <ArrowDown className="ml-2 h-4 w-4" />
                                ) : (
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                )}
                            </Button>
                        ) : (
                            column.label
                        )}
                    </TableHead>
                ))}
            </TableRow>
        </TableHeader>
    );
}
