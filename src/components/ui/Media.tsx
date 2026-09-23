import { useEffect, useState } from 'react';
import { Image, ImageSourcePropType, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { colors, fonts } from '../../theme/tokens';
import type { Book } from '../../model';
import { Body } from './Typography';

let coverAssets: Record<string, ImageSourcePropType> = {};

export function registerCovers(covers: Record<string, ImageSourcePropType>) {
  coverAssets = covers;
}

export function Cover({ book, width = 92 }: { book: Book; width?: number }) {
  const [failed, setFailed] = useState(false);
  const source = book.cover ? { uri: book.cover } : coverAssets[book.id];
  useEffect(() => setFailed(false), [book.cover, book.id]);

  const height = Math.round(width * 1.5);

  return (
    <View
      style={{
        width,
        height,
        borderRadius: 3,
        overflow: 'hidden',
        backgroundColor: book.color || colors.raised,
      }}
    >
      {source && !failed ? (
        <Image
          accessibilityLabel={`${book.title} book cover`}
          source={source}
          resizeMode="cover"
          onError={() => setFailed(true)}
          style={{
            width: '100%',
            height: '100%',
            // @ts-ignore - web high-contrast crisp interpolation
            imageRendering: '-webkit-optimize-contrast',
          }}
        />
      ) : (
        <View className="flex-1 items-center justify-center px-3 gap-3">
          <BookOpen size={24} color={colors.muted} />
          <Body style={{ textAlign: 'center', fontSize: 10, lineHeight: 15 }}>Cover unavailable</Body>
        </View>
      )}
    </View>
  );
}

export function QuoteCard({ quote, author }: { quote: string; author: string }) {
  return (
    <View
      style={{
        paddingVertical: 18,
        paddingHorizontal: 22,
        backgroundColor: '#181b18',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: colors.line,
        marginVertical: 12,
      }}
    >
      <Body style={{ fontFamily: fonts.serifItalic, fontSize: 14, lineHeight: 22, color: colors.text }}>
        "{quote}"
      </Body>
      <Body muted style={{ fontSize: 11, marginTop: 8, textAlign: 'right' }}>
        — {author}
      </Body>
    </View>
  );
}
