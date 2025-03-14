import {useCallback, useEffect, useState} from 'react';

export function useUserTableState(columns) {
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortColumn, setSortColumn] = useState(null);
    const [sortDirection, setSortDirection] = useState("asc");
    const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.key));
    const [selectedRows, setSelectedRows] = useState([]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [sortColumn, sortDirection]);

    const toggleAllRows = useCallback((paginatedUsers) => {
        if (selectedRows.length === paginatedUsers.length && paginatedUsers.length > 0) {
            setSelectedRows([]);
        } else {
            setSelectedRows(paginatedUsers.map((user) => user.username));
        }
    }, [selectedRows]);

    const toggleRow = useCallback((id) => {
        setSelectedRows((prev) => 
            prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
        );
    }, []);

    const toggleColumn = useCallback((key) => {
        if (columns.find((col) => col.key === key)?.fixed) return;
        setVisibleColumns((prev) => 
            prev.includes(key) ? prev.filter((col) => col !== key) : [...prev, key]
        );
    }, [columns]);

    const handleSort = useCallback((column) => {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }, [sortColumn]);

    return {
        page,
        setPage,
        rowsPerPage,
        setRowsPerPage,
        sortColumn,
        setSortColumn,
        sortDirection,
        setSortDirection,
        visibleColumns,
        setVisibleColumns,
        selectedRows,
        setSelectedRows,
        toggleAllRows: (users) => toggleAllRows(users),
        toggleRow,
        toggleColumn,
        handleSort
    };
}
