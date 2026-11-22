import { AppError } from '../utils/AppError.js';

export function notFound(req, res, next) {
  next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.originalUrl} was not found.`));
}

// Every error leaves the API in one shape: { error: { code, message, details? } }
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let status = 500;
  let code = 'SERVER_ERROR';
  let message = 'Something went wrong on the server.';
  let details;

  if (err instanceof AppError) {
    ({ status, code, message, details } = err);
  } else if (err.type === 'entity.parse.failed') {
    status = 400;
    code = 'BAD_JSON';
    message = 'The request body is not valid JSON.';
  } else if (err.type === 'entity.too.large') {
    status = 413;
    code = 'TOO_LARGE';
    message = 'The request body is too large.';
  } else if (err.code === 11000) {
    status = 409;
    code = 'DUPLICATE';
    message = 'That value is already in use.';
  } else {
    console.error(err);
  }

  res.status(status).json({ error: { code, message, ...(details ? { details } : {}) } });
}
