import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';

// Reads "Authorization: Bearer <token>", verifies it, and sets req.userId.
export async function requireAuth(req, res, next) {
  try {
    const [scheme, token] = (req.headers.authorization || '').split(' ');
    if (scheme !== 'Bearer' || !token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Please sign in to continue.');
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      throw new AppError(401, 'INVALID_TOKEN', 'Your session has expired. Please sign in again.');
    }

    // The account might have been deleted since the token was issued.
    if (!(await User.exists({ _id: payload.sub }))) {
      throw new AppError(401, 'INVALID_TOKEN', 'Your session is no longer valid. Please sign in again.');
    }

    req.userId = payload.sub;
    next();
  } catch (err) {
    next(err);
  }
}
