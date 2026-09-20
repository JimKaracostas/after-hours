import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { BookOpen, Check, Pencil, Plus, Quote, Trash2 } from 'lucide-react-native';
import { Book, todayKey } from '../model';
import {
  Body,
  Button,
  Chips,
  colors,
  Cover,
  Field,
  fonts,
  Heading,
  Label,
  Progress,
  Sheet,
  StarRating,
  TextLink,
} from '../ui';
import { BookSearch } from '../BookSearch';
import { CommonProps, integer, newId } from './types';

export function BookDialog({ book, dispatch, onClose }: CommonProps & { book?: Book }) {
  const [editing, setEditing] = useState(!book);
  const [detailsReady, setDetailsReady] = useState(Boolean(book));
  const [fromCatalog, setFromCatalog] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(book?.title ?? '');
  const [author, setAuthor] = useState(book?.author ?? '');
  const [total, setTotal] = useState(String(book?.totalPages ?? ''));
  const [page, setPage] = useState(String(book?.currentPage ?? 0));
  const [cover, setCover] = useState(book?.cover ?? '');
  const [status, setStatus] = useState<Book['status']>(book?.status ?? 'want-to-read');
  const [rating, setRating] = useState<number>(book?.rating ?? 0);
  const [genre, setGenre] = useState(book?.genre ?? '');
  const [error, setError] = useState('');

  // Commonplace quote / note state
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notePage, setNotePage] = useState(book ? String(book.currentPage) : '');

  function saveBook() {
    const totalPages = integer(total);
    const currentPage = status === 'finished' ? totalPages : status === 'want-to-read' ? 0 : integer(page);
    if (!title.trim() || !author.trim()) return setError('Add a title and an author to save this book.');
    if (!Number.isSafeInteger(totalPages) || totalPages < 1 || totalPages > 100000)
      return setError('Total pages must be a whole number between 1 and 100,000.');
    if (!Number.isSafeInteger(currentPage) || currentPage < 0 || currentPage > totalPages)
      return setError(`Current page must be a whole number from 0 to ${totalPages}.`);
    if (cover.trim() && !/^https:\/\/[^\s]+$/i.test(cover.trim()))
      return setError('Use an HTTPS image link, or leave the cover blank.');
    const values = {
      title: title.trim(),
      author: author.trim(),
      totalPages,
      currentPage,
      status,
      cover: cover.trim(),
      rating: rating > 0 ? rating : undefined,
      genre: genre.trim() || undefined,
    };
    dispatch(
      book
        ? { type: 'book/update', id: book.id, updates: values }
        : { type: 'book/add', book: { ...values, id: newId() } }
    );
    onClose();
  }

  function logProgress(targetPage?: number) {
    if (!book) return;
    const finalPage = targetPage !== undefined ? targetPage : integer(page);
    if (!Number.isSafeInteger(finalPage) || finalPage < 0 || finalPage > book.totalPages)
      return setError(`Enter a whole page number from 0 to ${book.totalPages}.`);
    dispatch({ type: 'reading/log', bookId: book.id, currentPage: finalPage });
    onClose();
  }

  function handleAddNote() {
    if (!book || !noteText.trim()) return;
    const p = notePage.trim() ? integer(notePage) : undefined;
    dispatch({
      type: 'book/addNote',
      bookId: book.id,
      note: {
        id: newId(),
        text: noteText.trim(),
        page: Number.isSafeInteger(p) ? p : undefined,
        createdAt: todayKey(),
      },
    });
    setNoteText('');
    setShowNoteInput(false);
  }

  return (
    <Sheet title={editing ? (book ? 'Edit your book' : 'A new chapter') : 'Between the pages'} onClose={onClose}>
      {!book && !detailsReady ? (
        <BookSearch
          onManual={() => setDetailsReady(true)}
          onSelect={result => {
            setTitle(result.title);
            setAuthor(result.author);
            setTotal(result.totalPages ? String(result.totalPages) : '');
            setCover(result.cover);
            setFromCatalog(true);
            setDetailsReady(true);
          }}
        />
      ) : !editing && book ? (
        <>
          <View className="flex-row items-center gap-6">
            <Cover book={book} width={100} />
            <View style={{ flex: 1 }}>
              <Label color={colors.amber}>
                {book.status === 'reading' ? 'CURRENTLY READING' : book.status === 'finished' ? 'FINISHED' : 'WANT TO READ'}
              </Label>
              <Heading size={26} style={{ marginTop: 12 }}>
                {book.title}
              </Heading>
              <Body muted style={{ marginTop: 7, fontSize: 12 }}>
                {book.author}
              </Body>
              <View className="flex-row items-center gap-3" style={{ marginTop: 10 }}>
                <Body muted style={{ fontSize: 12 }}>
                  {book.totalPages} pages
                </Body>
                {book.genre && (
                  <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, backgroundColor: colors.raised }}>
                    <Text style={{ fontSize: 10, color: colors.amber, fontFamily: fonts.medium }}>{book.genre}</Text>
                  </View>
                )}
              </View>
              {book.rating !== undefined && book.rating > 0 && (
                <View style={{ marginTop: 8 }}>
                  <StarRating rating={book.rating} readonly size={16} />
                </View>
              )}
            </View>
          </View>

          <View>
            <Progress value={book.currentPage / book.totalPages} />
            <Body muted style={{ marginTop: 9, fontSize: 12 }}>
              Page {book.currentPage} of {book.totalPages} · {Math.round((book.currentPage / book.totalPages) * 100)}% complete
            </Body>
          </View>

          {book.status === 'finished' ? (
            <Body style={{ color: colors.sage }}>Another world, well explored. This book is on your finished shelf.</Body>
          ) : (
            <>
              {/* Quick Jump Buttons */}
              <View style={{ gap: 8 }}>
                <Label>QUICK LOG PAGES</Label>
                <View className="flex-row gap-2">
                  {[5, 10, 20].map(inc => {
                    const nextP = Math.min(book.totalPages, book.currentPage + inc);
                    const disabled = book.currentPage >= book.totalPages;
                    return (
                      <Pressable
                        key={inc}
                        accessibilityRole="button"
                        disabled={disabled}
                        onPress={() => {
                          setPage(String(nextP));
                          logProgress(nextP);
                        }}
                        style={({ pressed }) => ({
                          flex: 1,
                          paddingVertical: 10,
                          borderRadius: 10,
                          backgroundColor: colors.raised,
                          borderWidth: 1,
                          borderColor: colors.line,
                          alignItems: 'center',
                          opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
                        })}
                      >
                        <Text style={{ color: colors.amber, fontFamily: fonts.bold, fontSize: 13 }}>
                          +{inc} pages
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <Field
                label="What page are you on?"
                value={page}
                onChangeText={setPage}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={6}
                onSubmitEditing={() => logProgress()}
              />
              <Body muted style={{ fontSize: 12 }}>
                {integer(page) > book.currentPage
                  ? `${integer(page) - book.currentPage} new pages will count toward today’s reading goal.`
                  : integer(page) < book.currentPage
                  ? 'This corrects your place. Previously logged reading stays in your history.'
                  : 'Every page is a little time well spent.'}
              </Body>
              {Boolean(error) && (
                <Body accessibilityRole="alert" style={{ color: '#ffb6a9', fontSize: 12 }}>
                  {error}
                </Body>
              )}
              <Button
                title={integer(page) === book.totalPages ? 'Finish book & save pages' : 'Save progress'}
                onPress={() => logProgress()}
                icon={Check}
                disabled={page === String(book.currentPage)}
              />
              {book.status === 'want-to-read' && (
                <Button
                  title="Start reading"
                  secondary
                  icon={BookOpen}
                  onPress={() => {
                    dispatch({ type: 'book/update', id: book.id, updates: { status: 'reading' } });
                    onClose();
                  }}
                />
              )}
            </>
          )}

          {/* Commonplace Notes & Quotes Section */}
          <View style={{ borderTopWidth: 1, borderColor: colors.line, paddingTop: 18, marginTop: 10 }}>
            <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
              <View className="flex-row items-center gap-2">
                <Quote size={15} color={colors.amber} />
                <Label>NOTES & QUOTES</Label>
              </View>
              {!showNoteInput && (
                <TextLink
                  title="Add passage"
                  icon={Plus}
                  onPress={() => setShowNoteInput(true)}
                />
              )}
            </View>

            {showNoteInput && (
              <View style={{ gap: 10, padding: 14, backgroundColor: '#181b18', borderRadius: 14, borderWidth: 1, borderColor: colors.line, marginBottom: 14 }}>
                <TextInput
                  placeholder="Capture a favorite quote or personal reflection…"
                  placeholderTextColor="#7a8276"
                  multiline
                  value={noteText}
                  onChangeText={setNoteText}
                  style={{
                    color: colors.text,
                    fontFamily: fonts.body,
                    fontSize: 13,
                    minHeight: 60,
                    lineHeight: 19,
                  }}
                />
                <View className="flex-row items-center gap-3">
                  <TextInput
                    placeholder="Page (opt)"
                    placeholderTextColor="#7a8276"
                    value={notePage}
                    onChangeText={setNotePage}
                    keyboardType="number-pad"
                    style={{
                      width: 90,
                      color: colors.text,
                      fontSize: 12,
                      padding: 6,
                      backgroundColor: colors.bg,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: colors.line,
                    }}
                  />
                  <View style={{ flex: 1 }} />
                  <Pressable onPress={() => setShowNoteInput(false)} style={{ padding: 6 }}>
                    <Body muted style={{ fontSize: 12 }}>Cancel</Body>
                  </Pressable>
                  <Button title="Save note" small onPress={handleAddNote} disabled={!noteText.trim()} />
                </View>
              </View>
            )}

            {book.notes && book.notes.length > 0 ? (
              <View style={{ gap: 10 }}>
                {book.notes.map(note => (
                  <View
                    key={note.id}
                    style={{
                      padding: 12,
                      backgroundColor: '#181b18',
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.line,
                    }}
                  >
                    <Body style={{ fontFamily: fonts.serifItalic, fontSize: 13, color: colors.text }}>
                      "{note.text}"
                    </Body>
                    <View className="flex-row items-center justify-between" style={{ marginTop: 8 }}>
                      <Body muted style={{ fontSize: 10 }}>
                        {note.page ? `Page ${note.page} · ` : ''}{note.createdAt}
                      </Body>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel="Delete note"
                        onPress={() => dispatch({ type: 'book/deleteNote', bookId: book.id, noteId: note.id })}
                        style={{ padding: 4 }}
                      >
                        <Trash2 size={13} color={colors.muted} />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              !showNoteInput && (
                <Body muted style={{ fontSize: 11, fontStyle: 'italic' }}>
                  No quotes saved yet. Tap "Add passage" to save memorable excerpts.
                </Body>
              )
            )}
          </View>

          <View style={{ marginTop: 10 }}>
            <TextLink
              title="Edit book details"
              icon={Pencil}
              onPress={() => {
                setEditing(true);
                setError('');
              }}
            />
          </View>
        </>
      ) : (
        <>
          <Body muted>
            {book ? 'Keep your shelf just the way you like it.' : 'Something you can’t wait to read, or an old favorite.'}
          </Body>
          {fromCatalog && (
            <Body style={{ color: colors.amber, fontSize: 12 }}>
              Details from Open Library. Page counts vary by edition—check the total against your copy before saving.
            </Body>
          )}
          <Field label="Book title" placeholder="e.g. The Midnight Library" value={title} onChangeText={setTitle} maxLength={300} autoFocus />
          <Field label="Author" placeholder="Who wrote it?" value={author} onChangeText={setAuthor} maxLength={200} />
          <Field label="Total pages" placeholder="e.g. 304" value={total} onChangeText={setTotal} keyboardType="number-pad" inputMode="numeric" maxLength={6} />
          <Field label="Genre / Category (optional)" placeholder="e.g. Philosophy, Sci-Fi, Fiction" value={genre} onChangeText={setGenre} maxLength={60} />
          
          <View className="gap-2">
            <Body style={{ fontSize: 12 }}>Rating</Body>
            <StarRating rating={rating} onChange={setRating} size={22} />
          </View>

          <View className="gap-2">
            <Body style={{ fontSize: 12 }}>On your shelf</Body>
            <Chips
              value={status}
              onChange={setStatus}
              options={[
                { value: 'want-to-read', label: 'Want to read' },
                { value: 'reading', label: 'Reading' },
                { value: 'finished', label: 'Finished' },
              ]}
            />
          </View>
          {status === 'reading' && (
            <Field label="Current page" value={page} onChangeText={setPage} keyboardType="number-pad" inputMode="numeric" maxLength={6} />
          )}
          <Field label="Cover image link (optional)" placeholder="https://…" value={cover} onChangeText={setCover} autoCapitalize="none" keyboardType="url" maxLength={4096} />
          {book && <Body muted style={{ fontSize: 11 }}>Edits update your shelf. Use “Save progress” to count newly read pages toward your daily goal.</Body>}
          {Boolean(error) && (
            <Body accessibilityRole="alert" style={{ color: '#ffb6a9', fontSize: 12 }}>
              {error}
            </Body>
          )}
          <Button title={book ? 'Save changes' : 'Add to bookshelf'} onPress={saveBook} icon={book ? Check : Plus} />
          {book &&
            (confirmDelete ? (
              <View className="gap-3">
                <Body style={{ fontSize: 12 }}>Remove “{book.title}” and its reading history from this device?</Body>
                <Button
                  title="Remove this book"
                  danger
                  icon={Trash2}
                  onPress={() => {
                    dispatch({ type: 'book/delete', id: book.id });
                    onClose();
                  }}
                />
                <Button title="Keep book" secondary onPress={() => setConfirmDelete(false)} />
              </View>
            ) : (
              <TextLink title="Remove from bookshelf" icon={Trash2} onPress={() => setConfirmDelete(true)} />
            ))}
        </>
      )}
    </Sheet>
  );
}
