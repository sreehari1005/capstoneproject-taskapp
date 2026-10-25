export default function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  return (
    <nav className="pagination" aria-label="Pagination">
      <button type="button" className="btn btn-small" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span aria-live="polite">Page {page} of {totalPages}</span>
      <button type="button" className="btn btn-small" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Next
      </button>
    </nav>
  );
}
