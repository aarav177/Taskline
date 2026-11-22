import { STATUSES, STATUS_LABELS } from '../utils/format.js';

// Counts per status. Each one is also a filter button, and the bar shows the overall split.
export default function StatsStrip({ stats, activeStatus, onSelect }) {
  const total = stats?.total ?? 0;

  return (
    <section className="stats" aria-label="Task summary">
      <div className="stat-buttons">
        <button className={`stat all ${activeStatus === '' ? 'active' : ''}`} onClick={() => onSelect('')} aria-pressed={activeStatus === ''}>
          <span className="stat-count">{total}</span>
          <span className="stat-label">All tasks</span>
        </button>
        {STATUSES.map((status) => (
          <button
            key={status}
            className={`stat ${status} ${activeStatus === status ? 'active' : ''}`}
            onClick={() => onSelect(activeStatus === status ? '' : status)}
            aria-pressed={activeStatus === status}
          >
            <span className="stat-count">{stats?.[status] ?? 0}</span>
            <span className="stat-label">{STATUS_LABELS[status]}</span>
          </button>
        ))}
      </div>

      <div className="split" role="img" aria-label={`${stats?.completed ?? 0} of ${total} tasks completed`}>
        {total > 0 &&
          STATUSES.map((status) => (
            <span key={status} className={`split-part ${status}`} style={{ flexGrow: stats[status] }} />
          ))}
      </div>

      {stats?.overdue > 0 && (
        <p className="overdue-note">
          {stats.overdue} {stats.overdue === 1 ? 'task is' : 'tasks are'} overdue.
        </p>
      )}
    </section>
  );
}
