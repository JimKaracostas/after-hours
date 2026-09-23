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

const knownThumbnailUpgrades: Record<string, string> = {
  // Family of Liars default work cover 12728811 is 70x106; edition cover 13314081 is 327x500
  '12728811': '13314081',
};

function normalizeCoverUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  for (const [lowResId, highResId] of Object.entries(knownThumbnailUpgrades)) {
    if (url.includes(`/id/${lowResId}-`)) {
      return url.replace(`/id/${lowResId}-`, `/id/${highResId}-`);
    }
  }
  return url;
}

export function Cover({ book, width = 92 }: { book: Book; width?: number }) {
  const [failed, setFailed] = useState(false);
  const normalizedInitial = normalizeCoverUrl(book.cover);
  const [activeCover, setActiveCover] = useState(normalizedInitial);
  const source = activeCover ? { uri: activeCover } : coverAssets[book.id];

  useEffect(() => {
    setFailed(false);
    const normalized = normalizeCoverUrl(book.cover);
    setActiveCover(normalized);

    // If an image URL is from Open Library, check if it's a tiny low-res scan and upgrade to full resolution
    if (normalized && normalized.startsWith('http') && normalized.includes('covers.openlibrary.org')) {
      Image.getSize(
        normalized,
        (w, h) => {
          if (w < 150 || h < 250) {
            const query = encodeURIComponent(`${book.title} ${book.author || ''}`.trim());
            fetch(`https://openlibrary.org/search.json?q=${query}&limit=1&fields=key,cover_i,cover_height,cover_width`)
              .then(r => r.json())
              .then(async data => {
                const doc = data?.docs?.[0];
                if (!doc?.key) return;
                const edRes = await fetch(`https://openlibrary.org${doc.key}/editions.json?limit=8`);
                if (edRes.ok) {
                  const edData = await edRes.json();
                  for (const entry of (edData.entries || [])) {
                    const coverId = (entry.covers || []).find((c: number) => c > 0);
                    if (coverId && !normalized.includes(String(coverId))) {
                      setActiveCover(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg?default=false`);
                      return;
                    }
                  }
                }
              })
              .catch(() => {});
          }
        },
        () => {}
      );
    }
  }, [book.cover, book.id, book.title, book.author]);

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
