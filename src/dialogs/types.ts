import { AppAction } from '../model';

export type CommonProps = {
  dispatch: (action: AppAction) => void;
  onClose: () => void;
};

export const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const integer = (input: string) => (/^\d+$/.test(input.trim()) ? Number(input.trim()) : NaN);
