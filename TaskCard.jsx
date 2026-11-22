import { PRIORITY_LABELS, formatDue, isOverdue } from '../utils/format.js';
import StatusStepper from './StatusStepper.jsx';

export default function TaskCard({ task, busy, onStatus, onEdit, onDelete }) {
  const overdue = isOverdue(task);

  return (
    <li className={`task ${task.status}`}>
      <div className="task-main">
        <h3 className={task.status === 'completed' ? 'done' : ''}>{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span className={`priority ${task.priority}`}>{PRIORITY_LABELS[task.priority]} priority</span>
          {task.dueDate && (
            <span className={`due ${overdue ? 'overdue' : ''}`}>
              {overdue ? 'Overdue: ' : 'Due '}
              {formatDue(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-side">
        <StatusStepper status={task.status} disabled={busy} onChange={(status) => onStatus(task, status)} />
        <div className="task-actions">
          <button className="btn quiet" onClick={() => onEdit(task)} disabled={busy}>Edit</button>
          <button className="btn quiet danger" onClick={() => onDelete(task)} disabled={busy}>Delete</button>
        </div>
      </div>
    </li>
  );
}
