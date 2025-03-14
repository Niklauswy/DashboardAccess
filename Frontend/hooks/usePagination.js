import { useState, useMemo } from 'react';
import { parseDate } from '@/lib/date-utils';

export function usePagination(items, options = {}) {
  const {
    initialPage = 1,
    initialPageSize = 20,
    pageSizeOptions = [10, 20, 50, 100],
    sortKey = null,
    sortDirection = 'desc'
  } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sort, setSort] = useState({ key: sortKey, direction: sortDirection });

  // Reset to first page when pageSize changes
  const changePageSize = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Sort function
  const requestSort = (key) => {
    setSort((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Calculate pagination values
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / pageSize);

  // Ensure current page is valid
  const safeCurrentPage = Math.min(Math.max(1, currentPage), Math.max(1, totalPages));
  if (safeCurrentPage !== currentPage) {
    setCurrentPage(safeCurrentPage);
  }

  // Apply sorting and pagination
  const paginatedItems = useMemo(() => {
    // First sort
    let result = [...items];
    
    if (sort.key) {
      result.sort((a, b) => {
        // Handle date fields (any field with 'date', 'time', or 'timestamp' in the name)
        if (sort.key.toLowerCase().includes('date') || 
            sort.key.toLowerCase().includes('time') || 
            sort.key.toLowerCase().includes('timestamp')) {
          
          // Attempt to parse as dates for proper comparison
          const aValue = parseDate(a[sort.key])?.getTime() || 0;
          const bValue = parseDate(b[sort.key])?.getTime() || 0;
          
          return sort.direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // Handle numeric values stored as strings
        if (typeof a[sort.key] === 'string' && !isNaN(Number(a[sort.key]))) {
          return sort.direction === 'asc' 
            ? Number(a[sort.key]) - Number(b[sort.key]) 
            : Number(b[sort.key]) - Number(a[sort.key]);
        }
        
        // Handle regular string comparison
        const aValue = String(a[sort.key] || '').toLowerCase();
        const bValue = String(b[sort.key] || '').toLowerCase();
        
        return sort.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      });
    }
    
    // Then paginate
    const startIndex = (safeCurrentPage - 1) * pageSize;
    return result.slice(startIndex, startIndex + pageSize);
  }, [items, safeCurrentPage, pageSize, sort]);

  // Navigation functions
  const goToPage = (page) => setCurrentPage(Math.min(Math.max(1, page), totalPages));
  const nextPage = () => goToPage(currentPage + 1);
  const prevPage = () => goToPage(currentPage - 1);
  const firstPage = () => goToPage(1);
  const lastPage = () => goToPage(totalPages);

  return {
    // Data
    pageItems: paginatedItems,
    
    // State
    currentPage: safeCurrentPage,
    pageSize,
    totalItems,
    totalPages,
    sort,
    pageSizeOptions,
    
    // Actions
    setCurrentPage: goToPage,
    setPageSize: changePageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    requestSort
  };
}
