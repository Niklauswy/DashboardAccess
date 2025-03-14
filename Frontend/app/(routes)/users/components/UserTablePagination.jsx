import React from "react";
import { TablePagination } from "@/components/data-table/TablePagination";

export default function UserTablePagination({
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
      

    </div>
  );
}
