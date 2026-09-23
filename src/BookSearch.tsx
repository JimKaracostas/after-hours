import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { ArrowRight, Pencil, Search } from 'lucide-react-native';
import { CatalogBook, searchBooks } from './catalog';
import { Body, Button, colors, Cover, Field, Label, TextLink } from './ui';

export function BookSearch({ onSelect, onManual }: { onSelect: (book: CatalogBook) => void; onManual: () => void }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<CatalogBook[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  async function search() {
    if (query.trim().length < 2 || loading) return;
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    let timedOut = false;
    const timeout = setTimeout(() => { timedOut = true; request.abort(); }, 15000);
    setLoading(true); setError(''); setResults([]); setSearched(false);
    try { const found = await searchBooks(query, request.signal); if (!request.signal.aborted) { setResults(found); setSearched(true); } }
    catch (reason) { if (!request.signal.aborted || timedOut) setError(timedOut ? 'The catalog took too long to respond. Try again, or add your book manually.' : reason instanceof Error && !reason.message.includes('fetch') ? reason.message : 'Could not reach the book catalog. Check your connection, or add your book manually.'); }
    finally { clearTimeout(timeout); if (controller.current === request) setLoading(false); }
  }
  return <View className="gap-4"><Body muted>Find your book in Open Library’s live catalog, then check the details against your copy.</Body><Field label="Search the book catalog" placeholder="Title, author, or ISBN" value={query} onChangeText={setQuery} autoFocus onSubmitEditing={search} returnKeyType="search" maxLength={200} /><Button title={loading ? 'Searching…' : 'Search books'} icon={Search} onPress={search} disabled={query.trim().length < 2 || loading} />{loading && <ActivityIndicator color={colors.amber} />}{Boolean(error) && <Body accessibilityRole="alert" style={{ color: '#ffb6a9', fontSize: 12 }}>{error}</Body>}
    {searched && <Label>{results.length ? 'FROM OPEN LIBRARY' : 'NO MATCHES FOUND'}</Label>}
    {searched && !results.length && <Body muted>Try a different title or author, or enter the details yourself.</Body>}
    {results.map(book => <Pressable key={book.key} accessibilityRole="button" accessibilityLabel={`Choose ${book.title} by ${book.author || 'unknown author'}`} onPress={() => onSelect(book)} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderColor: colors.line, paddingBottom: 14, opacity: pressed ? 0.6 : 1 })}><Cover book={{ id: book.key, title: book.title, author: book.author, cover: book.cover, totalPages: book.totalPages || 1, currentPage: 0, status: 'want-to-read' }} width={48} /><View style={{ flex: 1 }}><Body style={{ fontSize: 13 }}>{book.title}</Body><Body muted style={{ fontSize: 11 }}>{book.author || 'Author not listed'}</Body>{Boolean(book.year) && <Body muted style={{ fontSize: 10 }}>First published {book.year}</Body>}</View><ArrowRight size={17} color={colors.amber} /></Pressable>)}
    <TextLink title="Enter details myself" icon={Pencil} onPress={onManual} /><Body muted style={{ fontSize: 10 }}>Search requires an internet connection. Only the search you submit is sent to Open Library.</Body>
  </View>;
}
