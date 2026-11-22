import { AppError } from './AppError.js';
import { STATUSES, PRIORITIES } from './constants.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function fail(errors) {
  throw new AppError(400, 'VALIDATION_ERROR', 'Please fix the highlighted fields.', errors);
}

const one = (value) => (Array.isArray(value) ? value[0] : value);

export function validateRegister(body = {}) {
  const errors = [];
  const name = String(body.name ?? '').trim();
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');

  if (name.length < 2 || name.length > 50) errors.push({ field: 'name', message: 'Name must be 2-50 characters.' });
  if (!EMAIL_RE.test(email) || email.length > 100) errors.push({ field: 'email', message: 'Enter a valid email address.' });
  // bcrypt only uses the first 72 bytes of a password, so cap it there.
  if (password.length < 8 || password.length > 72) errors.push({ field: 'password', message: 'Password must be 8-72 characters.' });

  if (errors.length) fail(errors);
  return { name, email, password };
}

export function validateLogin(body = {}) {
  const errors = [];
  const email = String(body.email ?? '').trim().toLowerCase();
  const password = String(body.password ?? '');
  if (!EMAIL_RE.test(email)) errors.push({ field: 'email', message: 'Enter a valid email address.' });
  if (!password) errors.push({ field: 'password', message: 'Enter your password.' });
  if (errors.length) fail(errors);
  return { email, password };
}

// Accepts "YYYY-MM-DD" only, and rejects dates that do not exist (like 2026-02-31).
function parseDueDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return null;
  return date;
}

// partial = true is used for PATCH: only the fields that were sent are checked.
export function validateTask(body = {}, { partial = false } = {}) {
  const errors = [];
  const data = {};

  if (!partial || body.title !== undefined) {
    const title = String(body.title ?? '').trim();
    if (title.length < 1 || title.length > 100) errors.push({ field: 'title', message: 'Title must be 1-100 characters.' });
    else data.title = title;
  }
  if (body.description !== undefined) {
    const description = String(body.description ?? '').trim();
    if (description.length > 500) errors.push({ field: 'description', message: 'Description can be up to 500 characters.' });
    else data.description = description;
  }
  if (body.status !== undefined) {
    if (!STATUSES.includes(body.status)) errors.push({ field: 'status', message: `Status must be one of: ${STATUSES.join(', ')}.` });
    else data.status = body.status;
  }
  if (body.priority !== undefined) {
    if (!PRIORITIES.includes(body.priority)) errors.push({ field: 'priority', message: `Priority must be one of: ${PRIORITIES.join(', ')}.` });
    else data.priority = body.priority;
  }
  if (body.dueDate !== undefined) {
    if (body.dueDate === null || body.dueDate === '') data.dueDate = null;
    else {
      const date = parseDueDate(body.dueDate);
      if (!date) errors.push({ field: 'dueDate', message: 'Use a valid date (YYYY-MM-DD).' });
      else data.dueDate = date;
    }
  }

  if (partial && !errors.length && Object.keys(data).length === 0) {
    errors.push({ field: 'body', message: 'Send at least one field to update.' });
  }
  if (errors.length) fail(errors);
  return data;
}

export const SORT_FIELDS = ['createdAt', 'dueDate', 'title'];

// Validates ?status=&priority=&search=&sort=&order=&page=&limit= and fills in defaults.
export function parseTaskQuery(query = {}) {
  const errors = [];

  const status = one(query.status);
  if (status && status !== 'all' && !STATUSES.includes(status)) {
    errors.push({ field: 'status', message: `Status must be one of: ${STATUSES.join(', ')}.` });
  }
  const priority = one(query.priority);
  if (priority && priority !== 'all' && !PRIORITIES.includes(priority)) {
    errors.push({ field: 'priority', message: `Priority must be one of: ${PRIORITIES.join(', ')}.` });
  }

  const search = String(one(query.search) ?? '').trim().slice(0, 100);

  const sort = one(query.sort) ?? 'createdAt';
  if (!SORT_FIELDS.includes(sort)) errors.push({ field: 'sort', message: `Sort must be one of: ${SORT_FIELDS.join(', ')}.` });

  const defaultOrder = sort === 'createdAt' ? 'desc' : 'asc';
  const order = one(query.order) ?? defaultOrder;
  if (!['asc', 'desc'].includes(order)) errors.push({ field: 'order', message: 'Order must be asc or desc.' });

  const page = query.page === undefined ? 1 : Number(one(query.page));
  if (!Number.isInteger(page) || page < 1) errors.push({ field: 'page', message: 'Page must be a whole number, 1 or more.' });

  const limit = query.limit === undefined ? 10 : Number(one(query.limit));
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) errors.push({ field: 'limit', message: 'Limit must be a whole number from 1 to 50.' });

  if (errors.length) fail(errors);
  return {
    status: status && status !== 'all' ? status : null,
    priority: priority && priority !== 'all' ? priority : null,
    search,
    sort,
    order,
    page,
    limit,
  };
}
