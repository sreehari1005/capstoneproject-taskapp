# TaskFlow - Test Log (Milestone 7)

Fill in **Result** (Pass / Fail) and **Notes** as you test. Re-run everything after each bug fix (regression).

Tester: ______________   Date: ______________   Environment: Local / Live

## A. API tests (Postman or Thunder Client)

| # | Test | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| A1 | POST /api/auth/register with valid data | 201, user + token, no password in response | | |
| A2 | Register with the same email again | 409 | | |
| A3 | Register with weak password (`abc`) | 400 with `errors.password` | | |
| A4 | Register sending `"role":"admin"` in body | 201 but user role is `user` | | |
| A5 | POST /api/auth/login with correct data | 200 + token | | |
| A6 | Login with wrong password | 401 "Invalid email or password." | | |
| A7 | Login with `{"email":{"$gt":""},"password":"x"}` | 400/401, never logs in | | |
| A8 | GET /api/tasks without token | 401 | | |
| A9 | GET /api/tasks with malformed token | 401 | | |
| A10 | POST /api/tasks with valid data | 201, task returned | | |
| A11 | POST /api/tasks with empty title | 400 with `errors.title` | | |
| A12 | POST /api/tasks with status `finished` | 400 with `errors.status` | | |
| A13 | GET /api/tasks?page=1&limit=2 | 200, max 2 items, pagination object | | |
| A14 | GET /api/tasks?status=bogus | 400 | | |
| A15 | GET /api/tasks?search=report | Only matching titles | | |
| A16 | PATCH own task `{ "status": "done" }` | 200, status updated | | |
| A17 | PATCH task with empty body | 400 | | |
| A18 | GET/PATCH/DELETE **another user's** task id | 404 | | |
| A19 | GET /api/tasks/not-an-id | 400 | | |
| A20 | DELETE own task, then GET it | 200 then 404 | | |
| A21 | GET /api/admin/users as normal user | 403 | | |
| A22 | GET /api/admin/users as admin | 200 | | |
| A23 | POST with invalid JSON body | 400 "not valid JSON" | | |
| A24 | 21 rapid login attempts | 429 after the limit | | |

## B. UI tests

| # | Test | Expected | Result | Notes |
| --- | --- | --- | --- | --- |
| B1 | Open `/` while logged out | Redirected to /login | | |
| B2 | Submit empty register form | Inline messages, no request sent | | |
| B3 | Register then land on dashboard | New account sees empty state | | |
| B4 | Add task with empty title | Message "Title is required." | | |
| B5 | Add valid task | Appears in list, success message | | |
| B6 | Edit a task | Form pre-filled, change saved | | |
| B7 | Change status from the dropdown | Updates without reload | | |
| B8 | Delete task (Cancel, then OK) | Cancel keeps it, OK removes it | | |
| B9 | Search for text with no match | "No matching tasks" + Clear filters | | |
| B10 | Add 7+ tasks | Pagination appears, Next / Previous work | | |
| B11 | Stop the API, reload dashboard | Error message with "Try again" | | |
| B12 | Past due date on non-done task | "Overdue" badge | | |
| B13 | Refresh browser on `/login` (live site) | Page loads (no 404) | | |
| B14 | Phone width (360px) in DevTools | No sideways scrolling, buttons usable | | |
| B15 | Keyboard only (Tab / Enter / Space) | Every action reachable, focus visible | | |
| B16 | Log out, press Back | Cannot see tasks | | |

## C. Integration (end-to-end) flows

| # | Flow | Result | Notes |
| --- | --- | --- | --- |
| C1 | Register -> add task -> refresh page -> task still there (check in Atlas/Compass) | | |
| C2 | Log in on a second browser as a different user -> cannot see first user's tasks | | |
| C3 | Edit a task -> confirm `updatedAt` changed in the database | | |
| C4 | Delete a task -> confirm document removed from the database | | |

## D. Bugs found and fixed

| # | Description | Fix | Commit |
| --- | --- | --- | --- |
| | | | |
