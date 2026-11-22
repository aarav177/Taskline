import { useEffect, useRef, useState } from 'react';

// Create or edit a task in a native <dialog>, which handles focus and the Escape key for us.
export default function TaskForm({ task, onSave, onCancel }) {
  const dialogRef = useRef(null);
  const [form, setForm] = useState({
    title: task?.title ?? '',
    description: task?.description ?? '',
    priority: task?.priority ?? 'medium',
    dueDate: task?.dueDate ?? '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setFieldErrors({});
    setError('');
    try {
      await onSave({ ...form, dueDate: form.dueDate || null });
    } catch (err) {
      setFieldErrors(err.fieldErrors || {});
      if (!err.details?.length) setError(err.message);
      setBusy(false);
    }
  };

  return (
    <dialog ref={dialogRef} className="dialog" onClose={onCancel} aria-labelledby="task-form-title">
      <form onSubmit={submit} noValidate>
        <h2 id="task-form-title">{task ? 'Edit task' : 'New task'}</h2>

        <div className="field">
          <label htmlFor="task-title">Title</label>
          <input id="task-title" value={form.title} onChange={update('title')} maxLength={100} autoFocus aria-invalid={Boolean(fieldErrors.title)} />
          {fieldErrors.title && <p className="field-error">{fieldErrors.title}</p>}
        </div>

        <div className="field">
          <label htmlFor="task-desc">Description (optional)</label>
          <textarea id="task-desc" rows={3} value={form.description} onChange={update('description')} maxLength={500} aria-invalid={Boolean(fieldErrors.description)} />
          {fieldErrors.description && <p className="field-error">{fieldErrors.description}</p>}
        </div>

        <div className="row">
          <div className="field">
            <label htmlFor="task-priority">Priority</label>
            <select id="task-priority" value={form.priority} onChange={update('priority')}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="task-due">Due date (optional)</label>
            <input id="task-due" type="date" value={form.dueDate} onChange={update('dueDate')} aria-invalid={Boolean(fieldErrors.dueDate)} />
            {fieldErrors.dueDate && <p className="field-error">{fieldErrors.dueDate}</p>}
          </div>
        </div>

        {error && <p className="banner-error" role="alert">{error}</p>}

        <div className="dialog-actions">
          <button type="button" className="btn" onClick={() => dialogRef.current?.close()} disabled={busy}>Cancel</button>
          <button className="btn primary" disabled={busy}>{busy ? 'Saving...' : task ? 'Save changes' : 'Add task'}</button>
        </div>
      </form>
    </dialog>
  );
}
