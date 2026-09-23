import { useEffect, useRef, useState } from 'react';
import { AppState as NativeAppState, ScrollView, useWindowDimensions, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { Book, Task } from './src/model';
import { useStore } from './src/useStore';
import { BookDialog, GoalDialog, TaskDialog } from './src/dialogs';
import { BooksScreen, HomeScreen, ScreenProps, Tab, TasksScreen } from './src/screens';
import { Body, Button, colors, Loading, Sheet } from './src/ui';
import { SoundDialog } from './src/SoundDialog';
import { FocusTimer } from './src/FocusTimer';
import { useAmbientAudio } from './src/ambientAudio';
import { MobileHome } from './src/screens/MobileHome';
import { MobileNav, Sidebar, TopBar } from './src/components/navigation';

type Dialog =
  | { kind: 'book'; book?: Book }
  | { kind: 'task'; task?: Task }
  | { kind: 'goal' }
  | { kind: 'sound' }
  | { kind: 'focus'; book?: Book }
  | { kind: 'reset' }
  | null;

export default function App() {
  return (
    <SafeAreaProvider style={{ flex: 1, height: '100%' }}>
      <AfterHours />
    </SafeAreaProvider>
  );
}

function AfterHours() {
  const { width } = useWindowDimensions();
  const mobileNav = width < 780;
  const compact = width < 1150;
  const [tab, setTab] = useState<Tab>('home');
  const [dialog, setDialog] = useState<Dialog>(null);
  const [now, setNow] = useState(new Date());
  const scroll = useRef<ScrollView>(null);
  const store = useStore();
  const { mode: audioMode, isPlaying } = useAmbientAudio();

  useEffect(() => {
    const refreshDay = () => {
      setNow(new Date());
      store.dispatch({ type: 'day/rollover' });
    };
    const timer = setInterval(refreshDay, 60000);
    const subscription = NativeAppState.addEventListener('change', status => {
      if (status === 'active') refreshDay();
    });
    return () => {
      clearInterval(timer);
      subscription.remove();
    };
  }, [store.dispatch]);

  function navigate(next: Tab) {
    setTab(next);
    scroll.current?.scrollTo({ y: 0, animated: false });
  }

  if (!store.ready) return <Loading />;

  const screenProps: ScreenProps = {
    state: store.state,
    compact,
    onTab: navigate,
    onBook: book => setDialog({ kind: 'book', book }),
    onTask: task => setDialog({ kind: 'task', task }),
    onToggleTask: id => store.dispatch({ type: 'task/toggle', id }),
    onGoal: () => setDialog({ kind: 'goal' }),
    onFocusSession: book => setDialog({ kind: 'focus', book }),
    onQuickBump: (book, pages) =>
      store.dispatch({
        type: 'reading/log',
        bookId: book.id,
        currentPage: Math.min(book.totalPages, book.currentPage + pages),
      }),
    onAddPresetTask: (title, category) =>
      store.dispatch({
        type: 'task/add',
        task: {
          id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
          title,
          completed: false,
          due: 'today',
          category,
        },
      }),
  };

  const today = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <SafeAreaView edges={mobileNav ? ['top', 'bottom'] : []} style={{ flex: 1, height: '100%', backgroundColor: colors.bg }}>
      <View style={{ flex: 1, flexDirection: 'row', height: '100%', minHeight: 0 }}>
        {/* Desktop Sidebar */}
        {!mobileNav && (
          <Sidebar
            width={width}
            currentTab={tab}
            onNavigate={navigate}
            isPlaying={isPlaying}
            audioMode={audioMode}
            onOpenSound={() => setDialog({ kind: 'sound' })}
            onOpenGoal={() => setDialog({ kind: 'goal' })}
          />
        )}

        {/* Main Content Area */}
        <View style={{ flex: 1, minWidth: 0, height: '100%' }}>
          <ScrollView
            ref={scroll}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}
            style={{ flex: 1, height: '100%' }}
            contentContainerStyle={{
              paddingHorizontal: mobileNav ? 20 : width > 1350 ? 48 : 32,
              paddingTop: mobileNav ? 8 : 28,
              paddingBottom: mobileNav ? 96 : 35,
              width: '100%',
              maxWidth: 1280,
              alignSelf: 'center',
            }}
          >
            {/* Header Top Bar */}
            <TopBar
              mobileNav={mobileNav}
              today={today}
              isPlaying={isPlaying}
              audioMode={audioMode}
              onOpenSound={() => setDialog({ kind: 'sound' })}
              onOpenSettings={() => setDialog({ kind: 'goal' })}
            />

            {store.storageError && (
              <View
                accessibilityRole="alert"
                style={{ padding: 18, borderWidth: 1, borderColor: '#9d7058', borderRadius: 12, marginBottom: 22, gap: 12 }}
              >
                <Body style={{ color: '#ffcfb0', fontSize: 12 }}>{store.storageError}</Body>
                <Button title="Retry" secondary onPress={store.retryStorage} />
                {store.storageBlocked && <Button title="Reset local data…" secondary onPress={() => setDialog({ kind: 'reset' })} />}
              </View>
            )}

            <View style={{ pointerEvents: store.storageBlocked ? 'none' : 'auto', opacity: store.storageBlocked ? 0.45 : 1 }}>
              {tab === 'home' ? (
                mobileNav ? <MobileHome {...screenProps} /> : <HomeScreen {...screenProps} />
              ) : tab === 'books' ? (
                <BooksScreen {...screenProps} />
              ) : (
                <TasksScreen {...screenProps} />
              )}
            </View>

            {!mobileNav && <View className="flex-row justify-between" style={{ marginTop: 34 }}>
              <Body muted style={{ fontSize: 9 }}>
                A little space for your everyday.
              </Body>
              <Body muted style={{ fontSize: 9 }}>
                Saved on this device
              </Body>
            </View>}
          </ScrollView>
        </View>
      </View>

      {/* Mobile Bottom Navigation Bar */}
      {mobileNav && <MobileNav currentTab={tab} onNavigate={navigate} />}

      {/* Dialogs & Modals */}
      {dialog?.kind === 'book' && <BookDialog book={dialog.book} dispatch={store.dispatch} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'task' && <TaskDialog task={dialog.task} dispatch={store.dispatch} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'goal' && (
        <GoalDialog dailyGoal={store.state.dailyGoal} state={store.state} dispatch={store.dispatch} onClose={() => setDialog(null)} />
      )}
      {dialog?.kind === 'sound' && <SoundDialog onClose={() => setDialog(null)} />}
      {dialog?.kind === 'focus' && (
        <FocusTimer
          book={dialog.book}
          onClose={() => setDialog(null)}
          onLogProgress={(bookId, newPage) => store.dispatch({ type: 'reading/log', bookId, currentPage: newPage })}
        />
      )}
      {dialog?.kind === 'reset' && (
        <Sheet
          title="Reset local data?"
          onClose={() => setDialog(null)}
          subtitle="This removes the saved books, tasks, and reading history on this device. It cannot be undone."
        >
          <Button
            title="Reset and start again"
            danger
            onPress={() => {
              store.resetStorage();
              setDialog(null);
            }}
          />
          <Button title="Keep my data" secondary onPress={() => setDialog(null)} />
        </Sheet>
      )}
    </SafeAreaView>
  );
}
