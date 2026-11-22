import mongoose from 'mongoose';
import { STATUSES, PRIORITIES } from '../utils/constants.js';

const taskSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    status: { type: String, enum: STATUSES, default: 'pending' },
    priority: { type: String, enum: PRIORITIES, default: 'medium' },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

// Support the list screen: one user's tasks, filtered by status, newest first or by due date.
taskSchema.index({ user: 1, status: 1, createdAt: -1 });
taskSchema.index({ user: 1, dueDate: 1 });

export default mongoose.model('Task', taskSchema);
