export type SoundMode = 'none' | 'rain' | 'fireplace' | 'crickets' | 'brown';

export interface SoundOption {
  id: SoundMode;
  label: string;
  description: string;
  iconName: string;
}

export const SOUND_OPTIONS: SoundOption[] = [
  { id: 'none', label: 'Silence', description: 'Quiet evening', iconName: 'VolumeX' },
  { id: 'rain', label: 'Gentle Rain', description: 'Raindrops on the windowpane', iconName: 'CloudRain' },
  { id: 'fireplace', label: 'Hearth Fire', description: 'Warm crackling embers', iconName: 'Flame' },
  { id: 'crickets', label: 'Night Breeze', description: 'Crickets & soft evening wind', iconName: 'Wind' },
  { id: 'brown', label: 'Deep Focus', description: 'Soothing brown noise blanket', iconName: 'Radio' },
];

