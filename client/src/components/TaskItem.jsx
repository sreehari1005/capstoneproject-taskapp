const STATUS_LABEL = { todo: 'To do', 'in-progress': 'In progress', done: 'Done' };

// Compare as plain YYYY-MM-DD strings to avoid time-zone surprises.
const todayString = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

const formatDate = (iso) =>
  new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export default function TaskItem({ task, busy, onEdit, onDelete, onStatusChange }) {
  const overdue = task.dueDate && task.status !== 'done' && task.dueDate.slice(0, 10) < todayString();

  return (
    <li className={`card task ${task.status === 'done' ? 'task-done' : ''}`}>
      <div className="task-main">
        <h3>{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="meta">
          <span className={`badge badge-${task.priority}`}>{task.priority} priority</span>
          {task.dueDate && (
            <span className={`badge ${overdue ? 'badge-overdue' : ''}`}>
              {overdue ? 'Overdue: ' : 'Due: '}{formatDate(task.dueDate)}
            </span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <label className="visually-hidden" htmlFor={`status-${task._id}`}>Status for {task.title}</label>
        <select id={`status-${task._id}`} value={task.status} disabled={busy}
          onChange={(e) => onStatusChange(task, e.target.value)}>
          {Object.entries(STATUS_LABEL).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
        <button type="button" className="btn btn-small btn-ghost" onClick={() => onEdit(task)} disabled={busy}
          aria-label={`Edit ${task.title}`}>Edit</button>
        <button type="button" className="btn btn-small btn-danger" onClick={() => onDelete(task)} disabled={busy}
          aria-label={`Delete ${task.title}`}>Delete</button>
      </div>
    </li>
  );
}
