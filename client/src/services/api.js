// The single place that talks HTTP to the backend.
// The base URL comes from an environment variable so the same code works locally and in production.
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
const TOKEN_KEY = 'taskflow_token';

/*
 * Token storage trade-off: localStorage is simple but can be read by any script running on the page
 * (XSS risk). httpOnly cookies are safer but need extra CORS/CSRF setup. localStorage is fine for a
 * learning project - mention this trade-off in your README.
 */
export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(message, status, errors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors || {}; // field-level messages from the server
  }
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Check your connection and try again.', 0);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    // An expired or invalid token on a protected call logs the user out everywhere in the app.
    if (response.status === 401 && auth && token) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expired'));
    }
    throw new ApiError(data?.message || 'Something went wrong. Please try again.', response.status, data?.errors);
  }
  return data;
}
