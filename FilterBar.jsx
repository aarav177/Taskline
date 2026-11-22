export const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due soonest' },
  { value: 'dueDate:desc', label: 'Due latest' },
  { value: 'title:asc', label: 'Title A-Z' },
  { value: 'title:desc', label: 'Title Z-A' },
];

export default function FilterBar({ search, onSearch, priority, onPriority, sortValue, onSort, onNew }) {
  return (
    <div className="toolbar">
      <div className="control grow">
        <label htmlFor="search">Search</label>
        <input id="search" type="search" placeholder="Search titles" value={search} onChange={(e) => onSearch(e.target.value)} />
      </div>
      <div className="control">
        <label htmlFor="priority">Priority</label>
        <select id="priority" value={priority} onChange={(e) => onPriority(e.target.value)}>
          <option value="">Any</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>
      <div className="control">
        <label htmlFor="sort">Sort by</label>
        <select id="sort" value={sortValue} onChange={(e) => onSort(e.target.value)}>
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>
      <button className="btn primary new-task" onClick={onNew}>New task</button>
    </div>
  );
}
