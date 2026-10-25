import { request } from './api.js';

export function list({ page = 1, limit = 6, status = '', search = '' } = {}) {
  const params = new URLSearchParams({ page, limit });
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  return request(`/tasks?${params.toString()}`);
}

export const create = (task) => request('/tasks', { method: 'POST', body: task });
export const update = (id, changes) => request(`/tasks/${id}`, { method: 'PATCH', body: changes });
export const remove = (id) => request(`/tasks/${id}`, { method: 'DELETE' });
