import { AppState, Book, Task } from '../model';

export type Tab = 'home' | 'books' | 'tasks';

export type ScreenProps = {
  state: AppState;
  compact: boolean;
  onTab: (tab: Tab) => void;
  onBook: (book?: Book) => void;
  onTask: (task?: Task) => void;
  onToggleTask: (id: string) => void;
  onGoal: () => void;
  onFocusSession?: (book?: Book) => void;
  onQuickBump?: (book: Book, pages: number) => void;
  onAddPresetTask?: (title: string, category: Task['category']) => void;
};

export const statusLabels: Record<Book['status'], string> = {
  reading: 'Currently reading',
  'want-to-read': 'Want to read',
  finished: 'Finished',
};
