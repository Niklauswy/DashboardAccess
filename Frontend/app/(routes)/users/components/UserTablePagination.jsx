import React from "react";
import { TablePagination } from "@/components/data-table/TablePagination";

export default function UserTablePagination({
  selectedRows,
  sortedUsers,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  totalPages,
  pageSizeOptions = [10, 20, 50, 100],
}) {
  return (
    <div className="mt-4">
      <TablePagination
        currentPage={page}
        pageSize={rowsPerPage}
        setCurrentPage={setPage}
        setPageSize={setRowsPerPage}
        totalItems={sortedUsers.length}
        totalPages={totalPages}
        pageSizeOptions={pageSizeOptions}
      />
      
      {selectedRows.length > 0 && (
        <div className="text-sm text-muted-foreground mt-2">
          <span className="font-medium">{selectedRows.length}</span> fila(s) seleccionada(s)
        </div>
      )}
    </div>
  );
}
