import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useDebounce } from '../hooks/useDebounce.js';
import { useTasks } from '../hooks/useTasks.js';
import FilterBar from '../components/FilterBar.jsx';
import Pagination from '../components/Pagination.jsx';
import StatsStrip from '../components/StatsStrip.jsx';
import TaskCard from '../components/TaskCard.jsx';
import TaskForm from '../components/TaskForm.jsx';

export default function TasksPage() {
  const { user, logout } = useAuth();

  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortValue, setSortValue] = useState('createdAt:desc');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput.trim(), 300);

  const [sort, order] = sortValue.split(':');
  const { tasks, pagination, stats, loading, error, refresh } = useTasks({ status, priority, search, sort, order, page });

  const [editing, setEditing] = useState(null); // null = closed, {} = new task, task = edit
  const [busyId, setBusyId] = useState(null);
  const [actionError, setActionError] = useState('');

  // Changing any filter goes back to the first page.
  const withReset = (setter) => (value) => {
    setter(value);
    setPage(1);
  };

  // If the last task on a page was deleted, step back to the last page that still exists.
  useEffect(() => {
    if (!loading && page > pagination.totalPages) setPage(pagination.totalPages);
  }, [loading, page, pagination.totalPages]);

  const saveTask = async (values) => {
    if (editing?.id) await api.updateTask(editing.id, values);
    else await api.createTask(values);
    setEditing(null);
    refresh();
  };

  const changeStatus = async (task, nextStatus) => {
    setBusyId(task.id);
    setActionError('');
    try {
      await api.updateTask(task.id, { status: nextStatus });
      refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const removeTask = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    setBusyId(task.id);
    setActionError('');
    try {
      await api.deleteTask(task.id);
      refresh();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const filtered = Boolean(status || priority || search);

  return (
    <div className="page">
      <header className="top">
        <h1 className="wordmark">Taskline</h1>
        <div className="top-user">
          <span>{user.name}</span>
          <button className="btn quiet" onClick={logout}>Sign out</button>
        </div>
      </header>

      <StatsStrip stats={stats} activeStatus={status} onSelect={withReset(setStatus)} />

      <FilterBar
        search={searchInput}
        onSearch={(value) => {
          setSearchInput(value);
          setPage(1);
        }}
        priority={priority}
        onPriority={withReset(setPriority)}
        sortValue={sortValue}
        onSort={withReset(setSortValue)}
        onNew={() => setEditing({})}
      />

      {(error || actionError) && <p className="banner-error" role="alert">{error || actionError}</p>}

      <main aria-busy={loading}>
        {loading && tasks.length === 0 && !error && <p className="empty">Loading tasks...</p>}

        {!loading && !error && tasks.length === 0 && (
          <div className="empty">
            {filtered ? (
              <p>No tasks match these filters.</p>
            ) : (
              <>
                <p>Your list is empty.</p>
                <button className="btn primary" onClick={() => setEditing({})}>Add your first task</button>
              </>
            )}
          </div>
        )}

        <ul className="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              busy={busyId === task.id}
              onStatus={changeStatus}
              onEdit={setEditing}
              onDelete={removeTask}
            />
          ))}
        </ul>
      </main>

      <Pagination pagination={pagination} onPage={setPage} />

      {editing && <TaskForm task={editing.id ? editing : null} onSave={saveTask} onCancel={() => setEditing(null)} />}
    </div>
  );
}
