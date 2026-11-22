export const STATUSES = ['pending', 'in-progress', 'completed'];
export const STATUS_LABELS = { pending: 'Pending', 'in-progress': 'In progress', completed: 'Completed' };
export const PRIORITY_LABELS = { low: 'Low', medium: 'Medium', high: 'High' };

// Due dates are plain calendar dates ("2026-12-01"), so format them without time zone shifts.
export function formatDue(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const sameYear = date.getUTCFullYear() === new Date().getFullYear();
  return date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    ...(sameYear ? {} : { year: 'numeric' }),
    timeZone: 'UTC',
  });
}

function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
}

export const isOverdue = (task) => Boolean(task.dueDate) && task.status !== 'completed' && task.dueDate < todayString();
