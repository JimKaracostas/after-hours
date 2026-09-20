import { House, LibraryBig, ListChecks, LucideIcon } from 'lucide-react-native';
import { Tab } from '../../screens/types';

export interface NavItemConfig {
  id: Tab;
  title: string;
  icon: LucideIcon;
}

export const navigationItems: NavItemConfig[] = [
  { id: 'home', title: 'Home', icon: House },
  { id: 'books', title: 'Books', icon: LibraryBig },
  { id: 'tasks', title: 'To-Do', icon: ListChecks },
];
