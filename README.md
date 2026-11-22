# Taskline

A to-do list application with user accounts, built for an Advanced MERN Architecture minor project.

- **Frontend:** React (Vite), React Hooks and reusable components
- **Backend:** Node.js, Express, JWT authentication
- **Database:** MongoDB (Mongoose)

## Features

- Register and sign in; every user sees only their own tasks (JWT)
- Create, read, update and delete tasks (REST API)
- Status workflow: **Pending -> In progress -> Completed**, one step at a time (the server enforces this)
- Priority and optional due date, with overdue highlighting
- Server-side pagination, filtering (status, priority, title search) and sorting (date added, due date, title)
- Server-side validation with one consistent error format; the form shows each message under its field

## Run it locally

You need Node.js 18+ and MongoDB running.

```bash
# 1. Server
cd server
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:4000

# 2. Client (new terminal)
cd client
npm install
npm run dev              # http://localhost:5173
```

Open http://localhost:5173, create an account, and add some tasks.

## Architecture

```
React client  --(JSON + Bearer token)-->  Express API  -->  MongoDB
  pages/                                   routes/         models/
  components/                              controllers/
  hooks/                                   middleware/
  context/ (auth)                          utils/
```

| Folder | Job |
|---|---|
| `routes/` | Lists the URLs and which middleware and controller handle each one |
| `controllers/` | Handles a request: validate input, use the models, send the response |
| `models/` | Mongoose schemas for User and Task |
| `middleware/` | `requireAuth` (checks the JWT), `validateObjectId`, error handling |
| `utils/` | Validators, the workflow rules, the `AppError` class |

### API

All task routes need the header `Authorization: Bearer <token>`.

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create an account, returns a token |
| POST | `/api/auth/login` | Sign in, returns a token |
| GET | `/api/auth/me` | Current user |
| GET | `/api/tasks` | List tasks (see query parameters below) |
| GET | `/api/tasks/stats` | Counts per status, plus overdue |
| POST | `/api/tasks` | Create a task |
| GET | `/api/tasks/:id` | One task |
| PATCH | `/api/tasks/:id` | Update any fields, including `status` |
| DELETE | `/api/tasks/:id` | Delete a task |

**List query parameters:** `status` (`pending`, `in-progress`, `completed`), `priority` (`low`, `medium`, `high`), `search` (title), `sort` (`createdAt`, `dueDate`, `title`), `order` (`asc`, `desc`), `page`, `limit` (1-50, default 10).

Example: `GET /api/tasks?status=pending&sort=dueDate&order=asc&page=2`

### Structured errors

Every error has the same shape, so the frontend can show it properly:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please fix the highlighted fields.",
    "details": [{ "field": "title", "message": "Title must be 1-100 characters." }]
  }
}
```

| Status | When |
|---|---|
| 400 | Invalid input (`VALIDATION_ERROR`, `INVALID_ID`, `BAD_JSON`) |
| 401 | Missing, expired or invalid token; wrong login |
| 404 | Task not found (also returned for another user's task) |
| 409 | Email already registered, or an invalid status jump (`INVALID_TRANSITION`) |

### Security notes

- Passwords are hashed with bcrypt, never stored as plain text.
- The JWT secret is read from `.env`, which is excluded from Git.
- Every task query includes the signed-in user's id, so users cannot read or change each other's tasks.
- Login returns the same message for a wrong email and a wrong password.
- Search text is escaped before it is used in a database pattern.

## Possible improvements

- Refresh tokens or httpOnly cookies instead of keeping the token in localStorage
- Rate limiting on the login route
- Automated API tests
- Deploying: set `MONGODB_URI` to a MongoDB Atlas string, set a long random `JWT_SECRET`, and set `CLIENT_ORIGIN` and `VITE_API_URL` to the deployed addresses
