import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

export default function CustomPagination({ 
  currentPage, 
  totalPages, 
  onPageChange,
  className = "", 
  showFirstLast = true,
  maxDisplayedPages = 5
}) {
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  // Calculate page range to display
  const getPageNumbers = () => {
    if (totalPages <= maxDisplayedPages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Calculate the start and end of the page range
    let start = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
    let end = start + maxDisplayedPages - 1;
    
    // Adjust if end goes beyond totalPages
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxDisplayedPages + 1);
    }
    
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {/* First Page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(1)}
          disabled={currentPage === 1}
          className="hidden sm:flex"
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">Primera página</span>
        </Button>
      )}
      
      {/* Previous Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
        <span className="sr-only">Página anterior</span>
      </Button>
      
      {/* Page Numbers */}
      {getPageNumbers().map(pageNumber => (
        <Button
          key={pageNumber}
          variant={currentPage === pageNumber ? "default" : "outline"}
          size="icon"
          onClick={() => handlePageChange(pageNumber)}
          className={pageNumber === currentPage ? "bg-primary text-primary-foreground" : ""}
        >
          {pageNumber}
        </Button>
      ))}
      
      {/* Next Page */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-4 w-4" />
        <span className="sr-only">Página siguiente</span>
      </Button>
      
      {/* Last Page */}
      {showFirstLast && (
        <Button
          variant="outline"
          size="icon"
          onClick={() => handlePageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="hidden sm:flex"
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Última página</span>
        </Button>
      )}
    </div>
  );
}