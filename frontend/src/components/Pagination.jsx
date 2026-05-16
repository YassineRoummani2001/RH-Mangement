import React from 'react';

/**
 * Pagination component
 * @param {number} currentPage - 1-indexed current page
 * @param {number} totalItems   - total number of items
 * @param {number} itemsPerPage - items per page (default 5)
 * @param {function} onPageChange - callback(pageNumber)
 */
const Pagination = ({ currentPage, totalItems, itemsPerPage = 5, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));

  const firstItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const lastItem  = Math.min(currentPage * itemsPerPage, totalItems);

  // Show at most 3 pages around current
  const getPageNumbers = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages = [];
    if (currentPage > 2) pages.push(1, '...');
    for (let i = Math.max(1, currentPage - 1); i <= Math.min(totalPages, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 1) pages.push('...', totalPages);
    return pages;
  };

  return (
    <div className="pagination-bar">
      <span className="pagination-info">
        Affichage {firstItem} à {lastItem} sur {totalItems} entrées
      </span>

      <div className="pagination-controls">
        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Précédent
        </button>

        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="pagination-ellipsis">…</span>
          ) : (
            <button
              key={page}
              className={`pagination-btn page-num ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
            >
              {page}
            </button>
          )
        )}

        <button
          className="pagination-btn"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Suivant
        </button>
      </div>
    </div>
  );
};

export default Pagination;
