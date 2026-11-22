// An error we expect and can describe to the client: it carries an HTTP status,
// a machine-readable code, a readable message and optional per-field details.
export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}
