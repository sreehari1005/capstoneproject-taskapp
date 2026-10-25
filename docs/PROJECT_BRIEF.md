# TaskFlow - Project Brief (Milestone 1)

## 1. Problem statement
People lose track of what they need to do when tasks are spread across chats and notes. They need one private place to record, prioritise and find their tasks.

## 2. Target users

| Role | Allowed to |
| --- | --- |
| User | Register, log in, create / view / edit / delete **their own** tasks |
| Admin | Everything a user can, plus list all users (`GET /api/admin/users`) |

## 3. MVP scope

**Must have:** register, login, logout, task CRUD, status / priority / due date, search, status filter, pagination, responsive UI, validation and error handling.
**Later:** password reset, tags, reminders, task sharing, dark mode, drag-and-drop ordering.

## 4. User stories and acceptance criteria

1. **As a visitor, I want to create an account so that my tasks are saved.**
   - Name (2-50), valid email and password (8+ chars, letter + number) are required; clear messages otherwise.
   - A duplicate email is rejected with 409 and a friendly message.
   - After sign-up I am logged in and taken to my task list.
2. **As a registered user, I want to log in so that I can see my tasks.**
   - Wrong email or password shows one generic message (no hint which was wrong).
   - Opening a protected page while logged out redirects to login.
3. **As a logged-in user, I want to add a task so that I can track my work.**
   - Title is required (max 100); empty title shows a message and nothing is saved.
   - After saving, the task appears in the list without a manual refresh.
4. **As a user, I want to edit or delete a task so that my list stays accurate.**
   - Delete asks for confirmation.
   - I cannot see, edit or delete another user's task (API returns 404).
5. **As a user, I want to search, filter and page my tasks so that I can find things quickly.**
   - Search by title, filter by status, 6 tasks per page, page controls disabled at the ends.
   - If nothing matches, I see a "No matching tasks" message with a way to clear filters.
6. **As a user, I want clear feedback when something goes wrong.**
   - Loading spinner while fetching; error message with "Try again" if the API fails; empty-state message when there are no tasks.

## 5. Wireframes (text sketches)

```
LOGIN / REGISTER                         DASHBOARD
+--------------------------+             +--------------------------------------------+
| TaskFlow      Log in Sign|             | TaskFlow                  Hi, Anu [Log out]|
+--------------------------+             +--------------------------------------------+
|   +------------------+   |             | My tasks                      [+ Add task] |
|   | Log in           |   |             | [ Search by title... ] [ Status: All v ]   |
|   | Email [        ] |   |             | +----------------------------------------+ |
|   | Password [     ] |   |             | | Write report         [To do v][Edit][x]| |
|   | [    Log in    ]  |   |             | | high priority  Due: 1 Dec 2026         | |
|   +------------------+   |             | +----------------------------------------+ |
+--------------------------+             |        < Previous   Page 1 of 3   Next >   |
                                         +--------------------------------------------+
MOBILE: same screens in a single column; task actions wrap under the task text.
```

## 6. Data model

**User** (`users`)

| Field | Type | Notes |
| --- | --- | --- |
| name | String | required, 2-50 |
| email | String | required, unique, lowercase |
| password | String | bcrypt hash, `select: false` |
| role | String | `user` (default) or `admin` |
| createdAt / updatedAt | Date | timestamps |

**Task** (`tasks`)

| Field | Type | Notes |
| --- | --- | --- |
| user | ObjectId -> User | owner, required (**referenced**: a user has many tasks that change independently) |
| title | String | required, max 100 |
| description | String | max 500 |
| status | String | `todo` / `in-progress` / `done` |
| priority | String | `low` / `medium` / `high` |
| dueDate | Date | optional |
| createdAt / updatedAt | Date | timestamps |

Indexes: `users.email` (unique); `tasks {user, createdAt}` and `tasks {user, status}`.

## 7. API contract

Base path: `/api`. Protected routes need header `Authorization: Bearer <token>`.
Error shape: `{ "success": false, "message": "...", "errors": { "field": "..." } }`

| Method and path | Purpose | Request | Success | Errors |
| --- | --- | --- | --- | --- |
| POST /auth/register | Create account | JSON: name, email, password | 201 `{ user, token }` | 400 invalid, 409 email used, 429 too many |
| POST /auth/login | Log in | JSON: email, password | 200 `{ user, token }` | 400 missing, 401 bad credentials, 429 |
| GET /auth/me | Current user | - | 200 `{ user }` | 401 |
| GET /tasks | List own tasks | Query: page, limit (max 50), status, search | 200 `{ data[], pagination{page,limit,total,totalPages} }` | 400 bad status, 401 |
| POST /tasks | Create task | JSON: title, description?, status?, priority?, dueDate? | 201 `{ data }` | 400 invalid, 401 |
| GET /tasks/:id | One own task | - | 200 `{ data }` | 400 bad id, 401, 404 |
| PUT/PATCH /tasks/:id | Update own task | JSON: any task fields | 200 `{ data }` | 400 invalid, 401, 404 |
| DELETE /tasks/:id | Delete own task | - | 200 `{ message }` | 400, 401, 404 |
| GET /admin/users | List users | Query: page, limit | 200 `{ data[], pagination }` | 401, 403 not admin |
| GET /health | Health check | - | 200 `{ status: "ok" }` | - |

## 8. Non-functional requirements

- **Performance:** list endpoint responds with at most 50 records per request; indexed queries.
- **Security:** hashed passwords, JWT expiry (1 day), rate limiting, input validation, CORS allow-list.
- **Accessibility:** labelled inputs, visible focus, keyboard-operable controls, colour contrast of at least 4.5:1, skip link.
- **Browsers:** current Chrome, Firefox, Edge, Safari; mobile width from 360px.
- **Privacy:** only name, email and tasks are stored; use fake data in demos and screenshots.
