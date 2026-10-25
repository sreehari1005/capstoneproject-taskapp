import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import * as taskService from '../services/taskService.js';
import TaskForm from '../components/TaskForm.jsx';
import TaskItem from '../components/TaskItem.jsx';
import Pagination from '../components/Pagination.jsx';
import Spinner from '../components/Spinner.jsx';
import ErrorMessage from '../components/ErrorMessage.jsx';
import EmptyState from '../components/EmptyState.jsx';

const PAGE_SIZE = 6;

export default function Dashboard() {
  const { user } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);

  const reload = () => setReloadKey((k) => k + 1);

  // Wait until the user stops typing before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load tasks whenever the filters, page or reloadKey change.
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    taskService
      .list({ page, limit: PAGE_SIZE, status, search })
      .then((res) => {
        if (!active) return;
        setTasks(res.data);
        setPagination(res.pagination);
        // e.g. deleted the last task on the last page -> step back one page
        if (res.data.length === 0 && res.pagination.page > res.pagination.totalPages) {
          setPage(res.pagination.totalPages);
        }
      })
      .catch((err) => active && setError(err.message))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [page, status, search, reloadKey]);

  const openCreate = () => { setEditing(null); setShowForm(true); setNotice(''); };
  const openEdit = (task) => { setEditing(task); setShowForm(true); setNotice(''); };
  const closeForm = () => { setShowForm(false); setEditing(null); };

  // Rejects on failure so TaskForm can show the server's messages.
  const handleSave = async (values) => {
    if (editing) {
      await taskService.update(editing._id, values);
      setNotice('Task updated.');
    } else {
      await taskService.create(values);
      setNotice('Task added.');
      setPage(1);
    }
    closeForm();
    reload();
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`)) return;
    setBusyId(task._id);
    try {
      await taskService.remove(task._id);
      setNotice('Task deleted.');
      reload();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    setBusyId(task._id);
    try {
      const res = await taskService.update(task._id, { status: newStatus });
      setTasks((list) => list.map((t) => (t._id === task._id ? res.data : t)));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  const hasFilters = Boolean(status || search);

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>My tasks</h1>
          <p className="muted">Welcome back, {user.name}. You have {pagination.total} task{pagination.total === 1 ? '' : 's'}{hasFilters ? ' matching your filters' : ''}.</p>
        </div>
        {!showForm && <button type="button" className="btn" onClick={openCreate}>+ Add task</button>}
      </div>

      <div className="visually-hidden" role="status" aria-live="polite">{notice}</div>
      {notice && <div className="alert alert-success">{notice}</div>}

      {showForm && <TaskForm key={editing?._id || 'new'} initial={editing} onSubmit={handleSave} onCancel={closeForm} />}

      <div className="toolbar">
        <div className="field">
          <label htmlFor="search">Search by title</label>
          <input id="search" type="search" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Type to search..." />
        </div>
        <div className="field">
          <label htmlFor="filter-status">Status</label>
          <select id="filter-status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
            <option value="">All</option>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
      </div>

      {/* The four states: loading, error, empty, success */}
      {loading && <Spinner label="Loading your tasks..." />}
      {!loading && error && <ErrorMessage message={error} onRetry={reload} />}
      {!loading && !error && tasks.length === 0 && (
        hasFilters ? (
          <EmptyState title="No matching tasks" text="Try a different search or status filter."
            action={<button type="button" className="btn btn-small" onClick={() => { setSearchInput(''); setStatus(''); }}>Clear filters</button>} />
        ) : (
          <EmptyState title="No tasks yet" text="Add your first task to get started."
            action={<button type="button" className="btn" onClick={openCreate}>+ Add task</button>} />
        )
      )}
      {!loading && !error && tasks.length > 0 && (
        <>
          <ul className="task-list">
            {tasks.map((task) => (
              <TaskItem key={task._id} task={task} busy={busyId === task._id}
                onEdit={openEdit} onDelete={handleDelete} onStatusChange={handleStatusChange} />
            ))}
          </ul>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onChange={setPage} />
        </>
      )}
    </section>
  );
}
