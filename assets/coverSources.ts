import type { ImageSourcePropType } from 'react-native';

/** Verified sample-book cover artwork. See SOURCES.md for original URLs. */
export const coverSources: Record<string, ImageSourcePropType> = {
  'atomic-habits': require('./covers/atomic-habits.jpg'),
  'creative-act': require('./covers/creative-act.jpg'),
  'midnight-library': require('./covers/midnight-library.jpg'),
  tomorrow: require('./covers/tomorrow.jpg'),
  'deep-work': require('./covers/deep-work.jpg'),
  'psalm-wild-built': require('./covers/psalm-wild-built.jpg'),
};
