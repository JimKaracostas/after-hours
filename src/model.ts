export type BookStatus = 'reading' | 'want-to-read' | 'finished';
export type BookNote = { id: string; text: string; page?: number; createdAt: string };
export type Book = {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: BookStatus;
  cover: string;
  color?: string;
  rating?: number;
  genre?: string;
  notes?: BookNote[];
};
export type Task = {
  id: string;
  title: string;
  completed: boolean;
  due: 'today' | 'tomorrow' | 'someday';
  dueDate?: string;
  completedDate?: string;
  category: 'Personal' | 'Reading' | 'Work';
};
export type ReadingSession = { id: string; bookId: string; pages: number; date: string };
export type AppState = { books: Book[]; tasks: Task[]; sessions: ReadingSession[]; dailyGoal: number };
export type AppAction =
  | { type: 'book/add'; book: Book }
  | { type: 'book/update'; id: string; updates: Partial<Omit<Book, 'id'>> }
  | { type: 'book/delete'; id: string }
  | { type: 'book/addNote'; bookId: string; note: BookNote }
  | { type: 'book/deleteNote'; bookId: string; noteId: string }
  | { type: 'task/add'; task: Task }
  | { type: 'task/update'; id: string; updates: Partial<Omit<Task, 'id'>> }
  | { type: 'task/delete'; id: string }
  | { type: 'task/toggle'; id: string }
  | { type: 'reading/log'; bookId: string; currentPage: number; date?: string }
  | { type: 'goal/set'; dailyGoal: number }
  | { type: 'day/rollover'; date?: string }
  | { type: 'state/import'; state: AppState }
  | { type: 'state/reset' };

export function freshState(): AppState {
  return { books: [], tasks: [], sessions: [], dailyGoal: 30 };
}

// Only the fixed IDs shipped by the early prototype are removed during migration.
const legacyBookIds = new Set(['atomic-habits', 'creative-act', 'midnight-library', 'tomorrow', 'deep-work', 'psalm-wild-built']);
const legacyTaskIds = new Set(['read-tonight', 'evening-walk', 'clear-desk', 'weekly-notes', 'next-book']);

export function todayKey(date = new Date()): string {
  return `${String(date.getFullYear()).padStart(4, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isDayKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1900 || year > 9999) return false;
  const date = new Date(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
}

function object(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function text(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max;
}
function integer(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= min && value <= max;
}

function uniqueIds(items: { id: string }[]): boolean {
  return new Set(items.map(item => item.id)).size === items.length;
}

export function isBookNote(value: unknown): value is BookNote {
  return object(value) && text(value.id, 128) && text(value.text, 2000)
    && (value.page === undefined || integer(value.page, 0, 100000))
    && (typeof value.createdAt === 'string' && value.createdAt.length <= 50);
}

export function isBook(value: unknown): value is Book {
  return object(value) && text(value.id, 128) && text(value.title, 300) && text(value.author, 200)
    && integer(value.totalPages, 1, 100000) && integer(value.currentPage, 0, value.totalPages)
    && ['reading', 'want-to-read', 'finished'].includes(value.status as string)
    && (value.status !== 'finished' || value.currentPage === value.totalPages)
    && (value.currentPage !== value.totalPages || value.status === 'finished')
    && (value.status !== 'want-to-read' || value.currentPage === 0)
    && typeof value.cover === 'string' && value.cover.length <= 4096
    && (value.color === undefined || text(value.color, 80))
    && (value.rating === undefined || integer(value.rating, 1, 5))
    && (value.genre === undefined || text(value.genre, 60))
    && (value.notes === undefined || (Array.isArray(value.notes) && value.notes.every(isBookNote) && uniqueIds(value.notes)));
}

export function isTask(value: unknown): value is Task {
  return object(value) && text(value.id, 128) && text(value.title, 500)
    && typeof value.completed === 'boolean'
    && ['today', 'tomorrow', 'someday'].includes(value.due as string)
    && (value.dueDate === undefined || isDayKey(value.dueDate))
    && (value.completedDate === undefined || isDayKey(value.completedDate))
    && ['Personal', 'Reading', 'Work'].includes(value.category as string);
}

function taskDate(due: Task['due'], now: Date): string | undefined {
  return due === 'someday' ? undefined : todayKey(offsetDay(now, due === 'tomorrow' ? 1 : 0));
}

function normalizeTask(task: Task, now: Date): Task {
  const today = todayKey(now);
  const dueDate = task.dueDate ?? taskDate(task.due, now);
  const completedDate = task.completed ? task.completedDate ?? dueDate ?? today : undefined;
  const due: Task['due'] = task.completed && completedDate! < today ? 'someday'
    : dueDate === undefined ? 'someday'
    : dueDate <= today ? 'today'
    : dueDate === todayKey(offsetDay(now, 1)) ? 'tomorrow' : 'someday';
  return due === task.due && dueDate === task.dueDate && completedDate === task.completedDate
    ? task : { ...task, due, dueDate, completedDate };
}

export function rolloverTasks(state: AppState, now = new Date()): AppState {
  const tasks = state.tasks.map(task => normalizeTask(task, now));
  return tasks.some((task, index) => task !== state.tasks[index]) ? { ...state, tasks } : state;
}

function normalizedBook(book: Book): Book | null {
  if (!integer(book.totalPages, 1, 100000) || !integer(book.currentPage, 0, book.totalPages)) return null;
  const candidate: Book = {
    ...book,
    title: typeof book.title === 'string' ? book.title.trim() : book.title,
    author: typeof book.author === 'string' ? book.author.trim() : book.author,
    genre: typeof book.genre === 'string' && book.genre.trim().length > 0 ? book.genre.trim() : undefined,
    currentPage: book.status === 'finished' ? book.totalPages : book.currentPage,
    status: book.currentPage === book.totalPages ? 'finished' : book.currentPage > 0 && book.status === 'want-to-read' ? 'reading' : book.status,
  };
  return isBook(candidate) ? candidate : null;
}

export function reducer(state: AppState, action: AppAction, now = new Date()): AppState {
  switch (action.type) {
    case 'book/add': {
      const book = normalizedBook(action.book);
      return book && !state.books.some(item => item.id === book.id) ? { ...state, books: [...state.books, book] } : state;
    }
    case 'book/update': {
      const original = state.books.find(book => book.id === action.id);
      if (!original) return state;
      const merged = { ...original, ...action.updates, id: original.id };
      // A page correction can reopen a finished book; an explicit status choice takes precedence.
      if (action.updates.currentPage !== undefined && action.updates.status === undefined && merged.currentPage < merged.totalPages && merged.status === 'finished') merged.status = 'reading';
      const updated = normalizedBook(merged);
      return updated ? { ...state, books: state.books.map(book => book.id === action.id ? updated : book) } : state;
    }
    case 'book/delete':
      return state.books.some(book => book.id === action.id)
        ? { ...state, books: state.books.filter(book => book.id !== action.id), sessions: state.sessions.filter(session => session.bookId !== action.id) }
        : state;
    case 'book/addNote': {
      const book = state.books.find(b => b.id === action.bookId);
      if (!book || !isBookNote(action.note)) return state;
      const existing = book.notes ?? [];
      if (existing.some(n => n.id === action.note.id)) return state;
      return {
        ...state,
        books: state.books.map(b => b.id === action.bookId ? { ...b, notes: [...existing, action.note] } : b),
      };
    }
    case 'book/deleteNote': {
      const book = state.books.find(b => b.id === action.bookId);
      if (!book || !book.notes) return state;
      return {
        ...state,
        books: state.books.map(b => b.id === action.bookId ? { ...b, notes: b.notes?.filter(n => n.id !== action.noteId) } : b),
      };
    }
    case 'task/add': {
      const task = { ...action.task, title: typeof action.task.title === 'string' ? action.task.title.trim() : action.task.title };
      return isTask(task) && !state.tasks.some(item => item.id === task.id)
        ? { ...state, tasks: [...state.tasks, normalizeTask({ ...task, dueDate: taskDate(task.due, now), completedDate: task.completed ? todayKey(now) : undefined }, now)] } : state;
    }
    case 'task/update': {
      const original = state.tasks.find(task => task.id === action.id);
      if (!original) return state;
      const task = { ...original, ...action.updates, id: original.id };
      if (typeof task.title === 'string') task.title = task.title.trim();
      if (!isTask(task)) return state;
      if (action.updates.due !== undefined) task.dueDate = taskDate(action.updates.due, now);
      if (action.updates.completed !== undefined && action.updates.completed !== original.completed) task.completedDate = task.completed ? todayKey(now) : undefined;
      const updated = normalizeTask(task, now);
      return { ...state, tasks: state.tasks.map(item => item.id === action.id ? updated : item) };
    }
    case 'task/delete':
      return state.tasks.some(task => task.id === action.id) ? { ...state, tasks: state.tasks.filter(task => task.id !== action.id) } : state;
    case 'task/toggle':
      return state.tasks.some(task => task.id === action.id) ? { ...state, tasks: state.tasks.map(task => task.id === action.id ? normalizeTask({ ...task, completed: !task.completed, completedDate: !task.completed ? todayKey(now) : undefined }, now) : task) } : state;
    case 'reading/log': {
      const book = state.books.find(item => item.id === action.bookId);
      const date = action.date ?? todayKey();
      if (!book || !integer(action.currentPage, 0, book.totalPages) || !isDayKey(date)) return state;
      if (action.currentPage === book.currentPage) return state;
      const pages = action.currentPage - book.currentPage;
      let id = `${book.id}-${date}-${action.currentPage}`;
      let suffix = 1;
      while (state.sessions.some(session => session.id === id)) id = `${book.id}-${date}-${action.currentPage}-${suffix++}`;
      return {
        ...state,
        books: state.books.map(item => item.id === book.id ? { ...item, currentPage: action.currentPage, status: action.currentPage === book.totalPages ? 'finished' : 'reading' } : item),
        sessions: pages > 0 ? [...state.sessions, { id, bookId: book.id, pages, date }] : state.sessions,
      };
    }
    case 'goal/set':
      return integer(action.dailyGoal, 1, 1000) && action.dailyGoal !== state.dailyGoal ? { ...state, dailyGoal: action.dailyGoal } : state;
    case 'day/rollover': {
      if (action.date === undefined) return rolloverTasks(state, now);
      if (!isDayKey(action.date)) return state;
      const [year, month, day] = action.date.split('-').map(Number);
      return rolloverTasks(state, new Date(year, month - 1, day, 12));
    }
    case 'state/import':
      return isAppState(action.state) ? rolloverTasks(action.state, now) : state;
    case 'state/reset':
      return freshState();
    default:
      return state;
  }
}

export function isAppState(value: unknown): value is AppState {
  if (!object(value) || !integer(value.dailyGoal, 1, 1000)
    || !Array.isArray(value.books) || !value.books.every(isBook) || !uniqueIds(value.books)
    || !Array.isArray(value.tasks) || !value.tasks.every(isTask) || !uniqueIds(value.tasks)
    || !Array.isArray(value.sessions)) return false;
  const bookIds = new Set(value.books.map(book => book.id));
  return value.sessions.every(session => object(session) && text(session.id, 300)
    && typeof session.bookId === 'string' && bookIds.has(session.bookId)
    && integer(session.pages, 1, 100000) && isDayKey(session.date))
    && uniqueIds(value.sessions);
}

export type StoredStateResult = { ok: true; state: AppState | null } | { ok: false; error: string };

export function serializeState(state: AppState): string {
  return JSON.stringify({ version: 2, state });
}

export function parseStoredState(raw: string | null, now = new Date()): StoredStateResult {
  if (raw === null) return { ok: true, state: null };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (object(parsed) && 'version' in parsed && parsed.version !== 1 && parsed.version !== 2) return { ok: false, error: 'This saved data uses an unsupported version. Your saved data has been preserved.' };
    // Also accept the validated, unwrapped shape from early local builds.
    const candidate = object(parsed) && 'version' in parsed ? parsed.state : parsed;
    if (!isAppState(candidate)) return { ok: false, error: 'Saved data is incomplete or invalid. Your saved data has been preserved.' };
    const migrated = object(parsed) && parsed.version === 2 ? candidate : {
      ...candidate,
      books: candidate.books.filter(book => !legacyBookIds.has(book.id)),
      tasks: candidate.tasks.filter(task => !legacyTaskIds.has(task.id)),
      sessions: candidate.sessions.filter(session => !legacyBookIds.has(session.bookId)),
    };
    return { ok: true, state: rolloverTasks(migrated, now) };
  } catch {
    return { ok: false, error: 'Saved data could not be read. Your saved data has been preserved.' };
  }
}

function offsetDay(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + offset, 12);
}

export function selectStats(state: AppState, now = new Date()) {
  const totals = new Map<string, number>();
  for (const session of state.sessions) totals.set(session.date, (totals.get(session.date) ?? 0) + session.pages);
  const today = todayKey(now);
  const week = Array.from({ length: 7 }, (_, index) => {
    const day = offsetDay(now, index - 6);
    const date = todayKey(day);
    return { date, label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day.getDay()], pages: totals.get(date) ?? 0 };
  });
  let readingStreak = 0;
  let offset = totals.has(today) ? 0 : -1;
  while (totals.has(todayKey(offsetDay(now, offset--)))) readingStreak++;
  const pagesToday = totals.get(today) ?? 0;
  return {
    pagesToday,
    pagesThisWeek: week.reduce((sum, day) => sum + day.pages, 0),
    totalPagesRead: state.sessions.reduce((sum, session) => sum + session.pages, 0),
    booksFinished: state.books.filter(book => book.status === 'finished').length,
    booksReading: state.books.filter(book => book.status === 'reading').length,
    readingStreak,
    completedTasks: state.tasks.filter(task => task.completed).length,
    totalTasks: state.tasks.length,
    goalProgress: Math.min(1, pagesToday / state.dailyGoal),
    week,
  };
}
