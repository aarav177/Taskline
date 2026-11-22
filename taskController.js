import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { canTransition } from '../utils/constants.js';
import { parseTaskQuery, validateTask } from '../utils/validators.js';

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const serializeTask = (t) => ({
  id: String(t._id),
  title: t.title,
  description: t.description || '',
  status: t.status,
  priority: t.priority,
  dueDate: t.dueDate ? new Date(t.dueDate).toISOString().slice(0, 10) : null,
  createdAt: t.createdAt,
  updatedAt: t.updatedAt,
});

// Every query below includes the signed-in user's id, so nobody can touch someone else's tasks.
async function findOwnedTask(req) {
  const task = await Task.findOne({ _id: req.params.id, user: req.userId });
  if (!task) throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found.');
  return task;
}

// GET /api/tasks?status=&priority=&search=&sort=&order=&page=&limit=
export const listTasks = asyncHandler(async (req, res) => {
  const q = parseTaskQuery(req.query);

  const match = { user: new mongoose.Types.ObjectId(req.userId) };
  if (q.status) match.status = q.status;
  if (q.priority) match.priority = q.priority;
  if (q.search) match.title = { $regex: escapeRegex(q.search), $options: 'i' };

  const dir = q.order === 'asc' ? 1 : -1;
  // Tasks without a due date always go last when sorting by due date.
  const sortStage =
    q.sort === 'dueDate' ? { noDue: 1, dueDate: dir, _id: 1 } : { [q.sort]: dir, _id: 1 };

  const [rows, total] = await Promise.all([
    Task.aggregate([
      { $match: match },
      { $addFields: { noDue: { $cond: [{ $eq: [{ $ifNull: ['$dueDate', null] }, null] }, 1, 0] } } },
      { $sort: sortStage },
      { $skip: (q.page - 1) * q.limit },
      { $limit: q.limit },
    ]).collation({ locale: 'en', strength: 2 }), // case-insensitive title sorting
    Task.countDocuments(match),
  ]);

  res.json({
    tasks: rows.map(serializeTask),
    pagination: {
      page: q.page,
      limit: q.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / q.limit)),
    },
  });
});

// GET /api/tasks/stats
export const getStats = asyncHandler(async (req, res) => {
  const userId = new mongoose.Types.ObjectId(req.userId);
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  const [grouped, overdue] = await Promise.all([
    Task.aggregate([{ $match: { user: userId } }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Task.countDocuments({ user: userId, status: { $ne: 'completed' }, dueDate: { $lt: startOfToday } }),
  ]);

  const counts = { pending: 0, 'in-progress': 0, completed: 0 };
  for (const row of grouped) counts[row._id] = row.count;
  res.json({ ...counts, total: counts.pending + counts['in-progress'] + counts.completed, overdue });
});

export const createTask = asyncHandler(async (req, res) => {
  const data = validateTask(req.body);
  const task = await Task.create({ ...data, user: req.userId });
  res.status(201).json({ task: serializeTask(task) });
});

export const getTask = asyncHandler(async (req, res) => {
  res.json({ task: serializeTask(await findOwnedTask(req)) });
});

export const updateTask = asyncHandler(async (req, res) => {
  const data = validateTask(req.body, { partial: true });
  const task = await findOwnedTask(req);

  if (data.status && !canTransition(task.status, data.status)) {
    throw new AppError(409, 'INVALID_TRANSITION', `A ${task.status} task cannot move straight to ${data.status}.`, [
      { field: 'status', message: 'Tasks move one step at a time: pending, in-progress, completed.' },
    ]);
  }

  Object.assign(task, data);
  await task.save();
  res.json({ task: serializeTask(task) });
});

export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!task) throw new AppError(404, 'TASK_NOT_FOUND', 'Task not found.');
  res.json({ message: 'Task deleted.' });
});
