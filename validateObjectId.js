import mongoose from 'mongoose';
import { AppError } from '../utils/AppError.js';

export function validateObjectId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return next(new AppError(400, 'INVALID_ID', 'That task id is not valid.'));
  }
  next();
}
