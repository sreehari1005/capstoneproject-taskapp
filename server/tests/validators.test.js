// Run with: npm test   (uses Node's built-in test runner, no extra packages needed)
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  validateRegister,
  validateLogin,
  validateTask,
  parsePagination,
  isValidObjectId,
  escapeRegex,
} = require('../src/utils/validators');

test('register: accepts valid input and normalises email', () => {
  const r = validateRegister({ name: ' Anu ', email: ' ANU@Example.com ', password: 'abc12345' });
  assert.equal(r.isValid, true);
  assert.equal(r.value.name, 'Anu');
  assert.equal(r.value.email, 'anu@example.com');
});

test('register: rejects bad name, email and weak password', () => {
  const r = validateRegister({ name: 'A', email: 'nope', password: 'short' });
  assert.equal(r.isValid, false);
  assert.ok(r.errors.name && r.errors.email && r.errors.password);
});

test('register: password needs a letter and a number', () => {
  assert.ok(validateRegister({ name: 'Anu', email: 'a@b.co', password: 'onlyletters' }).errors.password);
  assert.ok(validateRegister({ name: 'Anu', email: 'a@b.co', password: '12345678' }).errors.password);
});

test('register: object values (NoSQL injection attempt) are rejected', () => {
  const r = validateRegister({ name: 'Anu', email: { $gt: '' }, password: 'abc12345' });
  assert.ok(r.errors.email);
});

test('login: requires email and password', () => {
  assert.equal(validateLogin({}).isValid, false);
  assert.equal(validateLogin({ email: 'a@b.co', password: 'x' }).isValid, true);
});

test('task: title is required on create', () => {
  assert.ok(validateTask({ title: '   ' }).errors.title);
  assert.ok(validateTask({}).errors.title);
});

test('task: valid create cleans values', () => {
  const r = validateTask({ title: ' Write report ', status: 'todo', priority: 'high', dueDate: '2026-12-01' });
  assert.equal(r.isValid, true);
  assert.equal(r.value.title, 'Write report');
  assert.ok(r.value.dueDate instanceof Date);
});

test('task: rejects invalid status, priority and date', () => {
  const r = validateTask({ title: 'x', status: 'finished', priority: 'urgent', dueDate: 'tomorrow' });
  assert.ok(r.errors.status && r.errors.priority && r.errors.dueDate);
});

test('task: empty dueDate clears the date', () => {
  assert.equal(validateTask({ title: 'x', dueDate: '' }).value.dueDate, null);
});

test('task: partial update only checks supplied fields', () => {
  assert.equal(validateTask({ status: 'done' }, { partial: true }).isValid, true);
  assert.ok(validateTask({}, { partial: true }).errors.body);
  assert.ok(validateTask({ title: '' }, { partial: true }).errors.title);
});

test('task: ignores unknown fields such as user or _id (mass assignment)', () => {
  const r = validateTask({ title: 'x', user: 'someoneElse', _id: '123' });
  assert.equal(r.value.user, undefined);
  assert.equal(r.value._id, undefined);
});

test('pagination: defaults, clamping and bad input', () => {
  assert.deepEqual(parsePagination({}), { page: 1, limit: 10 });
  assert.deepEqual(parsePagination({ page: '3', limit: '5' }), { page: 3, limit: 5 });
  assert.deepEqual(parsePagination({ page: '-2', limit: '9999' }), { page: 1, limit: 50 });
  assert.deepEqual(parsePagination({ page: ['1', '2'], limit: 'abc' }), { page: 1, limit: 10 });
});

test('objectId and regex helpers', () => {
  assert.equal(isValidObjectId('64b7f0c2a1b2c3d4e5f60718'), true);
  assert.equal(isValidObjectId('not-an-id'), false);
  assert.equal(escapeRegex('a.b*c'), 'a\\.b\\*c');
});
