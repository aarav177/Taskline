import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { validateLogin, validateRegister } from '../utils/validators.js';

const signToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });

const publicUser = (user) => ({ id: user._id.toString(), name: user.name, email: user.email });

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = validateRegister(req.body);

  if (await User.exists({ email })) {
    throw new AppError(409, 'EMAIL_TAKEN', 'An account with this email already exists.', [
      { field: 'email', message: 'This email is already registered.' },
    ]);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, passwordHash });
  res.status(201).json({ token: signToken(user.id), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateLogin(req.body);

  const user = await User.findOne({ email });
  const ok = user && (await bcrypt.compare(password, user.passwordHash));
  // Same message for "no such email" and "wrong password", so nobody can probe for accounts.
  if (!ok) throw new AppError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');

  res.json({ token: signToken(user.id), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) throw new AppError(401, 'INVALID_TOKEN', 'Your session is no longer valid.');
  res.json({ user: publicUser(user) });
});
