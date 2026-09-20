import React, { useMemo, useState } from 'react';
import { Pressable, TextInput, View } from 'react-native';
import { Check, Plus, Quote, Search, X } from 'lucide-react-native';
import { Book } from '../model';
import { Body, Button, Chips, colors, Cover, Empty, fonts, IconButton, Progress, StarRating } from '../ui';
import { ScreenTitle } from './ScreenTitle';
import { ScreenProps, statusLabels } from './types';

export function BooksScreen({ state, compact, onBook }: ScreenProps) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | Book['status']>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');

  // Extract all distinct genres from existing books
  const genres = useMemo(() => {
    const list = new Set<string>();
    state.books.forEach(b => {
      if (b.genre) list.add(b.genre);
    });
    return Array.from(list);
  }, [state.books]);

  const books = useMemo(() => {
    return state.books.filter(book => {
      const matchStatus = filter === 'all' || book.status === filter;
      const matchGenre = selectedGenre === 'all' || book.genre === selectedGenre;
      const matchSearch = `${book.title} ${book.author} ${book.genre ?? ''}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase());
      return matchStatus && matchGenre && matchSearch;
    });
  }, [state.books, filter, selectedGenre, query]);

  return (
    <View>
      <ScreenTitle
        title={compact ? "Library" : "Your bookshelf"}
        subtitle="A place for every chapter."
        compact={compact}
        action={<Button title="Add a book" icon={Plus} onPress={() => onBook()} />}
      />

      {state.books.length > 0 && <>
      {/* Search Input */}
      <View
        className="flex-row items-center gap-3 rounded-xl"
        style={{ borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 16, marginBottom: 20 }}
      >
        <Search size={18} color={colors.muted} />
        <TextInput
          accessibilityLabel="Search books"
          placeholder="Find a book, author, or genre…"
          placeholderTextColor="#939b8e"
          value={query}
          onChangeText={setQuery}
          style={{ color: colors.text, flex: 1, paddingVertical: 16, fontFamily: fonts.body, fontSize: 16 }}
        />
        {query.length > 0 && <IconButton icon={X} label="Clear book search" onPress={() => setQuery('')} />}
      </View>

      {/* Status Chips */}
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All books', count: state.books.length },
          { value: 'reading', label: 'Reading', count: state.books.filter(b => b.status === 'reading').length },
          { value: 'want-to-read', label: 'Want to read', count: state.books.filter(b => b.status === 'want-to-read').length },
          { value: 'finished', label: 'Finished', count: state.books.filter(b => b.status === 'finished').length },
        ]}
      />

      {/* Optional Genre Chips Filter */}
      {genres.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <Chips
            value={selectedGenre}
            onChange={setSelectedGenre}
            options={[
              { value: 'all', label: 'All genres' },
              ...genres.map(g => ({
                value: g,
                label: g,
                count: state.books.filter(b => b.genre === g).length,
              })),
            ]}
          />
        </View>
      )}

      </>}
      {/* Book Grid */}
      <View style={{ marginTop: 32, flexDirection: 'row', flexWrap: 'wrap', gap: compact ? '4%' : '3%' }}>
        {books.map(book => (
          <Pressable
            key={book.id}
            accessibilityRole="button"
            accessibilityLabel={`Open ${book.title}`}
            onPress={() => onBook(book)}
            style={({ pressed }) => ({ width: compact ? '48%' : '31.33%', marginBottom: 28, opacity: pressed ? 0.65 : 1 })}
          >
            <View
              style={{
                backgroundColor: colors.panel,
                borderRadius: 22,
                borderWidth: 1,
                borderColor: colors.line,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: compact ? 18 : 30,
              }}
            >
              <Cover book={book} width={compact ? 104 : 130} />
            </View>
            <Body numberOfLines={2} style={{ fontFamily: fonts.medium, fontSize: 14, lineHeight: 20, marginTop: 14 }}>
              {book.title}
            </Body>
            <Body muted numberOfLines={1} style={{ fontSize: 11, marginTop: 3 }}>
              {book.author}
            </Body>

            <View className="flex-row items-center justify-between" style={{ marginTop: 10 }}>
              <Body style={{ fontSize: 10, color: book.status === 'reading' ? colors.amber : book.status === 'finished' ? colors.sage : colors.muted }}>
                {statusLabels[book.status]}
              </Body>
              {book.status === 'reading' && (
                <Body muted style={{ fontSize: 10 }}>
                  {Math.round((book.currentPage / book.totalPages) * 100)}%
                </Body>
              )}
              {book.status === 'finished' && <Check size={13} color={colors.sage} />}
            </View>

            {book.rating !== undefined && book.rating > 0 && (
              <View style={{ marginTop: 4 }}>
                <StarRating rating={book.rating} readonly size={11} />
              </View>
            )}

            {book.notes && book.notes.length > 0 && (
              <View className="flex-row items-center gap-1" style={{ marginTop: 4 }}>
                <Quote size={11} color={colors.muted} />
                <Body muted style={{ fontSize: 10 }}>
                  {book.notes.length} {book.notes.length === 1 ? 'quote' : 'quotes'}
                </Body>
              </View>
            )}

            {book.status === 'reading' && (
              <View style={{ marginTop: 7 }}>
                <Progress value={book.currentPage / book.totalPages} height={3} />
              </View>
            )}
          </Pressable>
        ))}
      </View>

      {!books.length && (
        <Empty
          title={query ? 'No books found' : 'A little room on the shelf'}
          description={
            query
              ? 'Try a different title or author, or add this book to your collection.'
              : 'Add a book and make a little time for the next chapter.'
          }
          action={<Button title="Add a book" icon={Plus} onPress={() => onBook()} />}
        />
      )}
    </View>
  );
}

