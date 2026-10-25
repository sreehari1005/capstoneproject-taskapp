import { useState } from 'react';
import { ApiError } from '../services/api.js';

const toDateInput = (iso) => (iso ? iso.slice(0, 10) : '');

/**
 * Create / edit form. `onSubmit(values)` must return a promise; if it rejects with an ApiError the
 * field messages from the server are shown next to the inputs.
 */
export default function TaskForm({ initial, onSubmit, onCancel }) {
  const [values, setValues] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    status: initial?.status || 'todo',
    priority: initial?.priority || 'medium',
    dueDate: toDateInput(initial?.dueDate),
  });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setValues((v) => ({ ...v, [e.target.name]: e.target.value }));

  // Frontend validation = better UX. The server validates again.
  const validate = () => {
    const found = {};
    if (!values.title.trim()) found.title = 'Title is required.';
    else if (values.title.trim().length > 100) found.title = 'Title must be 100 characters or fewer.';
    if (values.description.length > 500) found.description = 'Description must be 500 characters or fewer.';
    return found;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await onSubmit({ ...values, title: values.title.trim(), dueDate: values.dueDate || null });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(err.errors || {});
        setFormError(err.message);
      } else {
        setFormError('Something went wrong. Please try again.');
      }
      setSubmitting(false);
    }
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate aria-label={initial ? 'Edit task' : 'Add task'}>
      <h2>{initial ? 'Edit task' : 'Add a task'}</h2>
      {formError && <div className="alert alert-error" role="alert">{formError}</div>}

      <div className="field">
        <label htmlFor="title">Title *</label>
        <input id="title" name="title" value={values.title} onChange={handleChange} maxLength={100}
          aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-err' : undefined} autoFocus />
        {errors.title && <p id="title-err" className="field-error">{errors.title}</p>}
      </div>

      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" rows={3} value={values.description} onChange={handleChange}
          maxLength={500} aria-invalid={Boolean(errors.description)} />
        {errors.description && <p className="field-error">{errors.description}</p>}
      </div>

      <div className="grid-3">
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={values.status} onChange={handleChange}>
            <option value="todo">To do</option>
            <option value="in-progress">In progress</option>
            <option value="done">Done</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select id="priority" name="priority" value={values.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="dueDate">Due date</label>
          <input id="dueDate" name="dueDate" type="date" value={values.dueDate} onChange={handleChange} />
          {errors.dueDate && <p className="field-error">{errors.dueDate}</p>}
        </div>
      </div>

      <div className="actions">
        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? 'Saving...' : initial ? 'Save changes' : 'Add task'}
        </button>
        <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={submitting}>Cancel</button>
      </div>
    </form>
  );
}
