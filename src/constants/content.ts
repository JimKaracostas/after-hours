export interface QuoteItem {
  text: string;
  author: string;
}

export interface RitualItem {
  icon: string;
  title: string;
  category: 'Personal' | 'Reading' | 'Work';
}

export const EVENING_QUOTES: QuoteItem[] = [
  { text: 'A reader lives a thousand lives before he dies. The man who never reads lives only one.', author: 'George R.R. Martin' },
  { text: 'There is no friend as loyal as a book.', author: 'Ernest Hemingway' },
  { text: 'The silence of the evening is the canvas on which the mind paints its truest thoughts.', author: 'Virginia Woolf' },
  { text: 'I have always imagined that Paradise will be a kind of library.', author: 'Jorge Luis Borges' },
  { text: 'You have power over your mind - not outside events. Realize this, and you will find stillness.', author: 'Marcus Aurelius' },
];

export const EVENING_RITUALS: RitualItem[] = [
  { icon: '🍵', title: 'Brew herbal tea & settle in', category: 'Personal' },
  { icon: '📱', title: 'Screen off 30m before sleep', category: 'Personal' },
  { icon: '📖', title: 'Read 20 quiet pages in bed', category: 'Reading' },
  { icon: '🕯️', title: 'Dim bedroom lights & stretch', category: 'Personal' },
  { icon: '✨', title: 'Note 1 thing you are grateful for', category: 'Personal' },
];
