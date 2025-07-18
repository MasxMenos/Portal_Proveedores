// src/hooks/usePagination.js
import { useState, useMemo } from "react";

export function usePagination(data, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useMemo(
    () => Math.ceil(data.length / itemsPerPage),
    [data.length, itemsPerPage]
  );

  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  }, [data, currentPage, itemsPerPage]);

  const blockSize = 4; // ahora 4 páginas en el centro
  const blockIndex = Math.floor((currentPage - 1) / blockSize);

  const pageNumbers = useMemo(() => {
    if (totalPages <= blockSize) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const start = blockIndex * blockSize + 1;
    const end = Math.min(start + blockSize - 1, totalPages);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [blockIndex, totalPages]);

  const hasPrevGroup = blockIndex > 0;
  const hasNextGroup = (blockIndex + 1) * blockSize < totalPages;

  const prevGroupPage = hasPrevGroup ? (blockIndex - 1) * blockSize + 1 : null;
  const nextGroupPage = hasNextGroup ? (blockIndex + 1) * blockSize + 1 : null;

  return {
    currentPage,
    totalPages,
    paginatedData,
    pageNumbers,
    hasPrevGroup,
    hasNextGroup,
    prevGroupPage,
    nextGroupPage,
    setCurrentPage,
  };
}
