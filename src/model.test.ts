import assert from 'node:assert/strict';
import test from 'node:test';
import { freshState, isAppState, isDayKey, parseStoredState, reducer, selectStats, serializeState, todayKey } from './model';
import type { AppState, Task } from './model';

// Artificial data is confined to tests. The application starts empty.
function fixtureState(): AppState {
  return {
    ...freshState(),
    books: [
      { id: 'test-reading-1', title: 'Test reading one', author: 'Test author', totalPages: 320, currentPage: 124, status: 'reading', cover: '' },
      { id: 'test-reading-2', title: 'Test reading two', author: 'Test author', totalPages: 432, currentPage: 86, status: 'reading', cover: '' },
      { id: 'test-finished', title: 'Test finished book', author: 'Test author', totalPages: 200, currentPage: 200, status: 'finished', cover: '' },
    ],
    tasks: [{ id: 'test-task', title: 'Test task', completed: false, due: 'someday', category: 'Personal' }],
  };
}

test('new installs and resets have no sample books, tasks, or history', () => {
  const state = freshState();
  assert.equal(isAppState(state), true);
  assert.deepEqual(state, { books: [], tasks: [], sessions: [], dailyGoal: 30 });
  assert.equal(selectStats(state).totalPagesRead, 0);
  assert.deepEqual(reducer(fixtureState(), { type: 'state/reset' }), state);
  const second = freshState();
  const mutable = freshState();
  mutable.tasks.push(fixtureState().tasks[0]);
  assert.equal(second.tasks.length, 0);
});

test('logging pages records only the positive difference and marks a completed book finished', () => {
  const initial = fixtureState();
  const book = initial.books[0];
  const next = reducer(initial, { type: 'reading/log', bookId: book.id, currentPage: book.totalPages, date: '2026-09-14' });
  assert.equal(next.books[0].status, 'finished');
  assert.equal(next.sessions[0].pages, book.totalPages - book.currentPage);
  assert.equal(next.sessions[0].date, '2026-09-14');
  assert.equal(initial.books[0].currentPage, 124);
  assert.equal(initial.sessions.length, 0);
  assert.equal(reducer(next, { type: 'reading/log', bookId: book.id, currentPage: book.totalPages, date: '2026-09-14' }), next);
});

test('invalid page counts and invalid dates cannot corrupt progress or create sessions', () => {
  const state = fixtureState();
  for (const currentPage of [-1, 321, 10.5, NaN, Infinity]) {
    assert.equal(reducer(state, { type: 'reading/log', bookId: state.books[0].id, currentPage, date: '2026-09-14' }), state);
  }
  for (const date of ['2026-02-30', '2026-13-01', 'yesterday', '2026-9-14']) {
    assert.equal(reducer(state, { type: 'reading/log', bookId: state.books[0].id, currentPage: 130, date }), state);
  }
  assert.equal(reducer(state, { type: 'reading/log', bookId: 'missing', currentPage: 130, date: '2026-09-14' }), state);
});

test('correcting progress backwards reopens a book without adding negative history', () => {
  const state = fixtureState();
  const book = state.books.find(item => item.status === 'finished')!;
  const result = reducer(state, { type: 'reading/log', bookId: book.id, currentPage: 20, date: '2026-09-14' });
  assert.equal(result.books.find(item => item.id === book.id)?.status, 'reading');
  assert.equal(result.books.find(item => item.id === book.id)?.currentPage, 20);
  assert.equal(result.sessions.length, 0);
});

test('repeated correction and logging creates unique session IDs', () => {
  let state = fixtureState();
  for (const currentPage of [150, 130, 150]) state = reducer(state, { type: 'reading/log', bookId: 'test-reading-1', currentPage, date: '2026-09-14' });
  assert.equal(state.sessions.length, 2);
  assert.equal(new Set(state.sessions.map(item => item.id)).size, 2);
  assert.equal(isAppState(state), true);
});

test('book updates normalize completion and deletion removes only related history', () => {
  let state = fixtureState();
  state = reducer(state, { type: 'reading/log', bookId: 'test-reading-1', currentPage: 140, date: '2026-09-14' });
  state = reducer(state, { type: 'reading/log', bookId: 'test-reading-2', currentPage: 100, date: '2026-09-14' });
  state = reducer(state, { type: 'book/update', id: 'test-reading-2', updates: { status: 'finished' } });
  assert.equal(state.books[1].currentPage, state.books[1].totalPages);
  state = reducer(state, { type: 'book/delete', id: 'test-reading-1' });
  assert.equal(state.books.some(book => book.id === 'test-reading-1'), false);
  assert.equal(state.sessions.length, 1);
  assert.equal(state.sessions[0].bookId, 'test-reading-2');
  assert.equal(isAppState(state), true);
});

test('task editing validates titles and goal rejects zero or fractional targets', () => {
  const state = fixtureState();
  const toggled = reducer(state, { type: 'task/toggle', id: state.tasks[0].id });
  assert.equal(toggled.tasks[0].completed, true);
  assert.equal(state.tasks[0].completed, false);
  assert.equal(reducer(state, { type: 'task/update', id: state.tasks[0].id, updates: { title: '  ' } }), state);
  for (const dailyGoal of [0, -1, 2.5, Infinity, 1001]) assert.equal(reducer(state, { type: 'goal/set', dailyGoal }), state);
  assert.equal(reducer(state, { type: 'goal/set', dailyGoal: 50 }).dailyGoal, 50);
});

test('persisted state round trips and empty storage is distinct from corrupt storage', () => {
  const state = fixtureState();
  assert.deepEqual(parseStoredState(serializeState(state)), { ok: true, state });
  assert.deepEqual(parseStoredState(JSON.stringify(state)), { ok: true, state });
  assert.deepEqual(parseStoredState(null), { ok: true, state: null });
  for (const raw of ['', '{', 'null', '[]', '{}', '{"version":3,"state":{}}']) assert.equal(parseStoredState(raw).ok, false);
});

test('restoration rejects duplicate IDs, impossible pages, dangling history, and partial records', () => {
  const duplicate = fixtureState();
  duplicate.books.push({ ...duplicate.books[0] });
  const invalidPage = fixtureState();
  invalidPage.books[0].currentPage = 99999;
  const dangling = fixtureState();
  dangling.sessions.push({ id: 'bad', bookId: 'missing', pages: 10, date: '2026-09-14' });
  const badSession = fixtureState();
  badSession.sessions.push({ id: 'bad', bookId: 'test-reading-1', pages: -10, date: '2026-09-14' });
  const badDate = fixtureState();
  badDate.sessions.push({ id: 'bad', bookId: 'test-reading-1', pages: 10, date: '2026-02-30' });
  for (const state of [duplicate, invalidPage, dangling, badSession, badDate, { ...fixtureState(), tasks: [{ id: 'partial' }] }]) {
    assert.equal(parseStoredState(JSON.stringify({ version: 1, state })).ok, false);
  }
});

test('stats use calendar days, include yesterday’s ongoing streak, and cap goal progress', () => {
  const state = fixtureState();
  state.sessions = [
    { id: '1', bookId: 'test-reading-1', date: '2026-09-12', pages: 20 },
    { id: '2', bookId: 'test-reading-1', date: '2026-09-13', pages: 40 },
    { id: '3', bookId: 'test-reading-2', date: '2026-09-01', pages: 10 },
  ];
  const now = new Date(2026, 8, 14, 0, 5);
  let stats = selectStats(state, now);
  assert.equal(stats.readingStreak, 2);
  assert.equal(stats.pagesToday, 0);
  assert.equal(stats.pagesThisWeek, 60);
  assert.equal(stats.totalPagesRead, 70);
  assert.equal(stats.week[0].date, '2026-09-08');
  assert.equal(stats.week[6].date, '2026-09-14');
  state.sessions.push({ id: '4', bookId: 'test-reading-2', date: '2026-09-14', pages: 60 });
  stats = selectStats(state, now);
  assert.equal(stats.readingStreak, 3);
  assert.equal(stats.goalProgress, 1);
  assert.equal(todayKey(now), '2026-09-14');
  assert.equal(isDayKey('2024-02-29'), true);
  assert.equal(isDayKey('2026-02-29'), false);
});

test('legacy migration removes only shipped sample IDs and their sessions', () => {
  const state = fixtureState();
  state.dailyGoal = 45;
  state.books.push({ ...state.books[0], id: 'atomic-habits' });
  state.tasks.push({ ...state.tasks[0], id: 'read-tonight' });
  state.sessions = [
    { id: 'user-session', bookId: 'test-reading-1', pages: 17, date: '2026-09-14' },
    { id: 'sample-session', bookId: 'atomic-habits', pages: 10, date: '2026-09-14' },
  ];
  for (const raw of [JSON.stringify(state), JSON.stringify({ version: 1, state })]) {
    const result = parseStoredState(raw);
    assert.equal(result.ok, true);
    if (!result.ok || !result.state) throw new Error('Expected migrated state');
    assert.deepEqual(result.state.books.map(book => book.id), ['test-reading-1', 'test-reading-2', 'test-finished']);
    assert.deepEqual(result.state.tasks.map(task => task.id), ['test-task']);
    assert.deepEqual(result.state.sessions, [state.sessions[0]]);
    assert.equal(result.state.dailyGoal, 45);
    assert.equal(JSON.parse(serializeState(result.state)).version, 2);
    assert.deepEqual(parseStoredState(serializeState(result.state)), result);
  }
});

test('version 2 does not remove a user entry whose ID matches a past sample ID', () => {
  const state = fixtureState();
  state.books[0].id = 'atomic-habits';
  assert.deepEqual(parseStoredState(serializeState(state)), { ok: true, state });
});

test('tomorrow becomes today after midnight and remains today when overdue', () => {
  const now = new Date(2026, 8, 14, 23, 58);
  const task: Task = { id: 'dated-task', title: 'A real reminder', completed: false, due: 'tomorrow', category: 'Personal' };
  let state = reducer(freshState(), { type: 'task/add', task }, now);
  assert.equal(state.tasks[0].dueDate, '2026-09-15');
  assert.equal(state.tasks[0].due, 'tomorrow');
  state = reducer(state, { type: 'day/rollover', date: '2026-09-15' });
  assert.equal(state.tasks[0].due, 'today');
  const overdue = reducer(state, { type: 'day/rollover', date: '2026-09-18' });
  assert.equal(overdue.tasks[0].due, 'today');
  assert.equal(overdue.tasks[0].dueDate, '2026-09-15');
  assert.equal(reducer(overdue, { type: 'day/rollover', date: '2026-09-18' }), overdue);
  assert.equal(reducer(overdue, { type: 'day/rollover', date: 'bad-date' }), overdue);
});

test('completed reminders leave Today next day and reopening restores overdue work', () => {
  const now = new Date(2026, 8, 14, 12);
  const task: Task = { id: 'dated-task', title: 'A reminder', completed: false, due: 'today', category: 'Personal' };
  let state = reducer(freshState(), { type: 'task/add', task }, now);
  state = reducer(state, { type: 'task/toggle', id: task.id }, now);
  assert.equal(state.tasks[0].due, 'today');
  assert.equal(state.tasks[0].completedDate, '2026-09-14');
  state = reducer(state, { type: 'day/rollover', date: '2026-09-15' });
  assert.equal(state.tasks[0].due, 'someday');
  assert.equal(state.tasks[0].completed, true);
  state = reducer(state, { type: 'task/toggle', id: task.id }, new Date(2026, 8, 15, 12));
  assert.equal(state.tasks[0].due, 'today');
  assert.equal(state.tasks[0].completedDate, undefined);
  state = reducer(state, { type: 'task/toggle', id: task.id }, new Date(2026, 8, 15, 12));
  assert.equal(state.tasks[0].due, 'today');
  assert.equal(state.tasks[0].completedDate, '2026-09-15');
});

test('legacy tasks get calendar dates on load; persisted dates do not slide on each load', () => {
  const state = freshState();
  state.tasks = [{ id: 'user-task', title: 'User task', completed: false, due: 'tomorrow', category: 'Work' }];
  const result = parseStoredState(JSON.stringify({ version: 1, state }), new Date(2026, 11, 31, 20));
  if (!result.ok || !result.state) throw new Error('Expected migrated state');
  assert.equal(result.state.tasks[0].dueDate, '2027-01-01');
  const restored = parseStoredState(serializeState(result.state), new Date(2027, 0, 2, 12));
  if (!restored.ok || !restored.state) throw new Error('Expected restored state');
  assert.equal(restored.state.tasks[0].dueDate, '2027-01-01');
  assert.equal(restored.state.tasks[0].due, 'today');
});

test('rescheduling updates calendar date and Someday clears scheduling', () => {
  const now = new Date(2026, 8, 14, 12);
  let state = reducer(freshState(), { type: 'task/add', task: { id: 'user-task', title: 'User task', completed: false, due: 'today', category: 'Work' } }, now);
  state = reducer(state, { type: 'task/update', id: 'user-task', updates: { due: 'tomorrow' } }, now);
  assert.equal(state.tasks[0].dueDate, '2026-09-15');
  state = reducer(state, { type: 'task/update', id: 'user-task', updates: { title: 'Renamed' } }, now);
  assert.equal(state.tasks[0].dueDate, '2026-09-15');
  state = reducer(state, { type: 'task/update', id: 'user-task', updates: { due: 'someday' } }, now);
  assert.equal(state.tasks[0].dueDate, undefined);
  assert.equal(state.tasks[0].due, 'someday');
  const invalid = { ...state, tasks: [{ ...state.tasks[0], dueDate: '2026-02-30' }] };
  assert.equal(isAppState(invalid), false);
});

test('books support rating, genre, and commonplace notes with validation', () => {
  const now = new Date(2026, 8, 14, 12);
  let state = reducer(freshState(), {
    type: 'book/add',
    book: {
      id: 'book-with-notes',
      title: 'Walden',
      author: 'Henry David Thoreau',
      totalPages: 350,
      currentPage: 50,
      status: 'reading',
      cover: '',
      rating: 5,
      genre: 'Philosophy',
    },
  }, now);
  assert.equal(state.books[0].rating, 5);
  assert.equal(state.books[0].genre, 'Philosophy');
  assert.equal(isAppState(state), true);

  // Add note
  state = reducer(state, {
    type: 'book/addNote',
    bookId: 'book-with-notes',
    note: { id: 'note-1', text: 'I went to the woods because I wished to live deliberately.', page: 90, createdAt: '2026-09-14' },
  }, now);
  assert.equal(state.books[0].notes?.length, 1);
  assert.equal(state.books[0].notes?.[0].page, 90);
  assert.equal(isAppState(state), true);

  // Delete note
  state = reducer(state, { type: 'book/deleteNote', bookId: 'book-with-notes', noteId: 'note-1' }, now);
  assert.equal(state.books[0].notes?.length, 0);

  // Invalid rating rejection
  const invalidRating = { ...state, books: [{ ...state.books[0], rating: 6 }] };
  assert.equal(isAppState(invalidRating), false);
});

test('state import validates imported data and updates state', () => {
  const imported: AppState = {
    books: [{ id: 'b1', title: 'Cosmos', author: 'Carl Sagan', totalPages: 400, currentPage: 100, status: 'reading', cover: '' }],
    tasks: [{ id: 't1', title: 'Stargaze', completed: false, due: 'today', category: 'Personal' }],
    sessions: [{ id: 's1', bookId: 'b1', pages: 20, date: '2026-09-14' }],
    dailyGoal: 25,
  };
  const next = reducer(freshState(), { type: 'state/import', state: imported });
  assert.equal(next.books.length, 1);
  assert.equal(next.tasks.length, 1);
  assert.equal(next.dailyGoal, 25);
  // Invalid state rejection
  assert.equal(reducer(freshState(), { type: 'state/import', state: { ...imported, dailyGoal: -5 } }).books.length, 0);
});

