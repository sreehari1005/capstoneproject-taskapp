# TaskFlow

A task manager built with the **MERN stack** (MongoDB, Express, React, Node.js).
Users sign up, log in, and manage their own tasks: add, edit, delete, search, filter by status, and page through results.

> **Problem:** People lose track of what they need to do when tasks live in chats and scattered notes.
> **Solution:** TaskFlow gives each user one private, searchable list of tasks with priorities and due dates.

- **Live app:** _add your hosted frontend URL here_
- **Live API:** _add your hosted API URL here_
- **Repository:** _add your GitHub URL here_

---

## Features

- Register and log in (passwords hashed with bcrypt, sessions use JWT tokens)
- Each user sees and edits **only their own** tasks (ownership checked on the server)
- Create, read, update and delete tasks (title, description, status, priority, due date)
- Search by title, filter by status, server-side pagination
- Overdue highlighting, loading / empty / error states on every screen
- Responsive layout, labelled forms, keyboard navigation, skip link
- Role field (`user` / `admin`) with one admin-only endpoint to demonstrate authorization (403)

## Tech stack

| Layer | Technology |
| --- | --- |
| Database | MongoDB with Mongoose |
| API | Node.js, Express 4, JWT, bcryptjs, helmet, express-rate-limit, cors |
| Frontend | React 18, React Router 6, Vite |

## Project structure

```
taskflow/
  client/                  React app (Vite)
    src/components/        reusable UI pieces
    src/pages/             route-level screens
    src/services/          API client - every HTTP call lives here
    src/context/           AuthContext (logged-in user)
  server/                  Express API
    src/routes/            URL + method -> controller
    src/controllers/       request handling logic
    src/models/            Mongoose schemas (User, Task)
    src/middleware/        auth, sanitize, rate limit, error handler
    src/utils/             validators, AppError, asyncHandler
    src/config/            env + database connection
    tests/                 unit tests for validators
  docs/                    project brief, API contract, test log
```

---

## Setup (run locally)

**Requirements:** Node.js 18 or newer, npm, and a MongoDB database (Atlas or local).

### 1. Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 2. Connect MongoDB  <-- this is the part you must do yourself

**Option A - MongoDB Atlas (free, recommended)**

1. Create a free cluster at <https://www.mongodb.com/atlas>.
2. **Database Access** -> add a database user with a password (give it only read/write on your database).
3. **Network Access** -> add your current IP address (or `0.0.0.0/0` temporarily while testing; tighten it later).
4. Click **Connect -> Drivers** and copy the connection string.
5. In `server/`, copy `.env.example` to `.env` and paste the string into `MONGODB_URI`.
   Put a database name before the `?`, for example `...mongodb.net/taskflow?retryWrites=true&w=majority`.
6. If your password contains special characters (`@ : / ?` etc.) URL-encode them.

**Option B - Local MongoDB**

Install MongoDB Community Server and use `MONGODB_URI=mongodb://127.0.0.1:27017/taskflow`.

### 3. Configure environment variables

```bash
# server/.env  (copy from server/.env.example)
PORT=5000
NODE_ENV=development
MONGODB_URI=<your connection string>
JWT_SECRET=<long random string>
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:5173

# client/.env  (copy from client/.env.example)
VITE_API_URL=http://localhost:5000/api
```

Generate a secret with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### 4. Start both apps (two terminals)

```bash
# Terminal 1 - API  (http://localhost:5000)
cd server
npm run dev

# Terminal 2 - React (http://localhost:5173)
cd client
npm run dev
```

Check the API: open <http://localhost:5000/api/health> - you should see `{"success":true,"status":"ok"}`.

### 5. Run the tests

```bash
cd server
npm test
```

### Making an admin (optional)

Self-registration always creates a normal `user`. To try the admin endpoint, open the `users` collection in
Atlas or Compass and change that user's `role` to `"admin"`, then call `GET /api/admin/users`.

---

## Environment variables

| Where | Name | Purpose |
| --- | --- | --- |
| server | `PORT` | Port the API listens on |
| server | `NODE_ENV` | `development` or `production` |
| server | `MONGODB_URI` | MongoDB connection string |
| server | `JWT_SECRET` | Secret used to sign tokens |
| server | `JWT_EXPIRES_IN` | Token lifetime (e.g. `1d`) |
| server | `CLIENT_URL` | Allowed frontend origin(s) for CORS, comma separated |
| client | `VITE_API_URL` | Base URL of the API, ending in `/api` (public, no secrets) |

Real `.env` files are git-ignored. Only the `.env.example` files are committed.

---

## API overview

Full details (inputs, outputs, errors) are in [`docs/PROJECT_BRIEF.md`](docs/PROJECT_BRIEF.md).

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| GET | `/api/health` | no | Health check |
| POST | `/api/auth/register` | no | Create account, returns token |
| POST | `/api/auth/login` | no | Log in, returns token |
| GET | `/api/auth/me` | yes | Current user |
| GET | `/api/tasks` | yes | List own tasks (`page`, `limit`, `status`, `search`) |
| POST | `/api/tasks` | yes | Create a task |
| GET | `/api/tasks/:id` | yes | Get one own task |
| PUT / PATCH | `/api/tasks/:id` | yes | Update own task (partial) |
| DELETE | `/api/tasks/:id` | yes | Delete own task |
| GET | `/api/admin/users` | admin | List users |

All errors use one JSON shape: `{ "success": false, "message": "...", "errors": { "field": "..." } }`.

---

## Security measures

- Passwords hashed with bcrypt (cost 12); hashes are never returned by the API
- JWT authentication middleware + role-based `authorize` middleware
- Ownership enforced in every task query (`{ _id, user }`), so users cannot reach each other's data
- Server-side validation of all input; unknown fields are ignored (no mass assignment; `role` can't be set on signup)
- NoSQL operator injection blocked (`$`/`.` keys stripped, values type-checked)
- `helmet` security headers, strict CORS allow-list, 10 kb body limit
- Rate limiting: 300 requests / 15 min per IP overall, 20 / 15 min on login and register
- Generic error messages to clients; details only in server logs
- Secrets only in environment variables

## Deployment notes

1. **Database:** MongoDB Atlas. Use a dedicated DB user with minimum permissions and restrict network access.
2. **API:** deploy `server/` to a host that runs a long-lived Node process (e.g. Render, Railway). Build command `npm install`, start command `npm start`. Set `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`, and `CLIENT_URL=<your live frontend URL>` in the host's dashboard.
3. **Frontend:** deploy `client/` to a static host (e.g. Netlify, Vercel). Build command `npm run build`, output `dist`. Set `VITE_API_URL=<your live API URL>/api` **before** building. SPA fallback is already provided (`public/_redirects` for Netlify, `vercel.json` for Vercel).
4. Check each provider's **current** free-tier limits (free services may sleep or expire).
5. Post-deployment: test sign-up, login and all task actions on the live URL; confirm no request still points to `localhost`.

## Testing

- `npm test` in `server/` runs unit tests for the validation logic.
- Manual API, UI and integration test cases with results are recorded in [`docs/TEST_LOG.md`](docs/TEST_LOG.md).

## Known limitations and future improvements

- Token is stored in `localStorage` (simple, but exposed to XSS); httpOnly cookies would be safer.
- No password reset or email verification.
- No automated API/integration tests yet (only validator unit tests).
- Tasks are personal only - no sharing, tags or reminders.
- Pagination uses page numbers; a cursor would scale better for very large lists.

## Screenshots

_Add screenshots of: login, register, dashboard (desktop), dashboard (mobile), add-task form, empty state._
