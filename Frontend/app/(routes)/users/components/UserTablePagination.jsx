import { Button } from "@/components/ui/button";

export default function UserTablePagination({
    selectedRows,
    sortedUsers,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    totalPages
}) {
    return (
        <div className="flex justify-between items-center text-sm text-gray-500">
            <span>
                {selectedRows.length} de {sortedUsers.length} usuarios seleccionados
            </span>
            
            <div className="flex items-center space-x-2">
                <span>Usuarios por página</span>
                <select
                    className="border rounded p-1"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    aria-label="Rows per page"
                >
                    <option>10</option>
                    <option>50</option>
                    <option>100</option>
                </select>
                
                <span>Página {page} de {totalPages}</span>
                
                <div className="space-x-1">
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 rounded-full"
                        onClick={() => setPage(1)}
                        disabled={page === 1}
                        aria-label="First page"
                    >
                        «
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 rounded-full"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={page === 1}
                        aria-label="Previous page"
                    >
                        ‹
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 rounded-full"
                        onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                        disabled={page === totalPages || totalPages === 0}
                        aria-label="Next page"
                    >
                        ›
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="px-2 py-1 rounded-full"
                        onClick={() => setPage(totalPages)}
                        disabled={page === totalPages || totalPages === 0}
                        aria-label="Last page"
                    >
                        »
                    </Button>
                </div>
            </div>
        </div>
    );
}
