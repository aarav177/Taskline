// Every call to the server goes through here, so the login token is attached in one place.
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const TOKEN_KEY = 'taskline:token';

let token = localStorage.getItem(TOKEN_KEY);
let onSessionExpired = () => {};

export const getToken = () => token;
export function setToken(value) {
  token = value;
  if (value) localStorage.setItem(TOKEN_KEY, value);
  else localStorage.removeItem(TOKEN_KEY);
}
export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

export class ApiError extends Error {
  constructor(message, { code, status, details } = {}) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details || [];
  }
  // { title: 'Title must be...' } so forms can show each message under its field
  get fieldErrors() {
    return Object.fromEntries(this.details.map((d) => [d.field, d.message]));
  }
}

async function request(path, { method = 'GET', body, query } = {}) {
  const url = new URL(BASE + path);
  for (const [key, value] of Object.entries(query || {})) {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is it running?', { code: 'NETWORK' });
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = data.error || {};
    if (['UNAUTHORIZED', 'INVALID_TOKEN'].includes(err.code)) onSessionExpired();
    throw new ApiError(err.message || 'Request failed.', { code: err.code, status: res.status, details: err.details });
  }
  return data;
}

export const api = {
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me').then((d) => d.user),
  listTasks: (query) => request('/tasks', { query }),
  getStats: () => request('/tasks/stats'),
  createTask: (body) => request('/tasks', { method: 'POST', body }).then((d) => d.task),
  updateTask: (id, body) => request(`/tasks/${id}`, { method: 'PATCH', body }).then((d) => d.task),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
