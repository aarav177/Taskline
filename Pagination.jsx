export default function Pagination({ pagination, onPage }) {
  const { page, totalPages, total } = pagination;
  if (total === 0) return null;

  return (
    <nav className="pagination" aria-label="Pages">
      <button className="btn" onClick={() => onPage(page - 1)} disabled={page <= 1}>Previous</button>
      <span>
        Page {page} of {totalPages} ({total} {total === 1 ? 'task' : 'tasks'})
      </span>
      <button className="btn" onClick={() => onPage(page + 1)} disabled={page >= totalPages}>Next</button>
    </nav>
  );
}
