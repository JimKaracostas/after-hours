import React, { useEffect, useRef, useState } from 'react';
import { AppState, Pressable, Text, TextInput, View } from 'react-native';
import { Check, CloudRain, Flame, Pause, Play, Radio, RotateCcw, Volume2, VolumeX, Wind, X } from 'lucide-react-native';
import { Book } from './model';
import { Body, Button, colors, fonts, Heading, Label, Sheet } from './ui';
import { SoundMode, SOUND_OPTIONS, useAmbientAudio } from './ambientAudio';

export interface FocusTimerProps {
  book?: Book;
  onClose: () => void;
  onLogProgress: (bookId: string, newPage: number) => void;
}

const PRESET_DURATIONS = [
  { label: '15m', seconds: 15 * 60 },
  { label: '25m', seconds: 25 * 60 },
  { label: '30m', seconds: 30 * 60 },
  { label: '45m', seconds: 45 * 60 },
  { label: 'Open', seconds: 0 },
];

export function FocusTimer({ book, onClose, onLogProgress }: FocusTimerProps) {
  const [selectedDuration, setSelectedDuration] = useState(25 * 60);
  const [secondsRemaining, setSecondsRemaining] = useState(25 * 60);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showLogPrompt, setShowLogPrompt] = useState(false);
  const [endingPage, setEndingPage] = useState(book ? String(book.currentPage) : '');
  const [error, setError] = useState('');

  const { mode: currentSound, setMode: setSoundMode, volume, setVolume } = useAmbientAudio();

  const elapsedRef = useRef(0);
  const [clockEpoch, setClockEpoch] = useState(0);
  useEffect(() => {
    if (!isRunning) return;
    const base = elapsedRef.current;
    const started = Date.now();
    const update = () => {
      const elapsed = base + Math.floor((Date.now() - started) / 1000);
      const actual = selectedDuration ? Math.min(elapsed, selectedDuration) : elapsed;
      elapsedRef.current = actual;
      setSecondsElapsed(actual);
      if (selectedDuration > 0) {
        setSecondsRemaining(Math.max(0, selectedDuration - elapsed));
        if (elapsed >= selectedDuration) { setIsRunning(false); setShowLogPrompt(true); }
      }
    };
    const timer = setInterval(update, 500);
    const listener = AppState.addEventListener('change', state => { if (state === 'active') update(); });
    return () => { clearInterval(timer); listener.remove(); };
  }, [isRunning, selectedDuration, clockEpoch]);

  function handleSelectDuration(secs: number) {
    setIsRunning(false);
    setSelectedDuration(secs);
    setSecondsRemaining(secs);
    setSecondsElapsed(0);
    elapsedRef.current = 0;
    setClockEpoch(value => value + 1);
  }

  function handleReset() {
    setIsRunning(false);
    setSecondsRemaining(selectedDuration);
    setSecondsElapsed(0);
    elapsedRef.current = 0;
    setClockEpoch(value => value + 1);
  }

  function formatTime(totalSeconds: number) {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  function handleFinishSession() {
    setIsRunning(false);
    if (!book) {
      onClose();
      return;
    }
    setShowLogPrompt(true);
  }

  function submitLog() {
    if (!book) {
      onClose();
      return;
    }
    const val = /^\d+$/.test(endingPage.trim()) ? Number(endingPage.trim()) : NaN;
    if (!Number.isSafeInteger(val) || val < 0 || val > book.totalPages) {
      setError(`Enter a page between 0 and ${book.totalPages}.`);
      return;
    }
    onLogProgress(book.id, val);
    onClose();
  }

  const displayTime = selectedDuration > 0 ? formatTime(secondsRemaining) : formatTime(secondsElapsed);

  return (
    <Sheet title="Focus session" onClose={onClose}>
          {/* Header */}
          <View className="flex-row items-center justify-between" style={{ marginBottom: 20 }}>
            <View>
              <Label color={colors.amber}>EVENING FOCUS SESSION</Label>
              <Heading size={22} style={{ marginTop: 4 }}>
                {book ? book.title : 'Slow Reading'}
              </Heading>
              {book && (
                <Body muted style={{ fontSize: 11 }}>
                  by {book.author} · Currently on page {book.currentPage}
                </Body>
              )}
            </View>

          </View>

          {showLogPrompt ? (
            <View style={{ gap: 18 }}>
              <View className="items-center" style={{ paddingVertical: 12 }}>
                <Label color={colors.amber}>SESSION COMPLETE</Label>
                <Heading size={26} style={{ marginTop: 8 }}>
                  Time well spent.
                </Heading>
                <Body muted style={{ fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                  You read for {Math.max(1, Math.round(secondsElapsed / 60))} minutes. What page did you finish on?
                </Body>
              </View>

              {book && (
                <View style={{ gap: 8 }}>
                  <Body style={{ fontSize: 13, fontFamily: fonts.medium }}>Page reached</Body>
                  <TextInput
                    accessibilityLabel="Ending page"
                    value={endingPage}
                    onChangeText={setEndingPage}
                    keyboardType="number-pad"
                    inputMode="numeric"
                    autoFocus
                    placeholder={`e.g. ${book.currentPage + 15}`}
                    placeholderTextColor="#7e8579"
                    style={{
                      backgroundColor: colors.bg,
                      borderWidth: 1,
                      borderColor: colors.line,
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      color: colors.text,
                      fontSize: 16,
                      fontFamily: fonts.body,
                    }}
                  />
                  {Number(endingPage) > (book?.currentPage ?? 0) && (
                    <Body style={{ color: colors.amber, fontSize: 12 }}>
                      +{Number(endingPage) - (book?.currentPage ?? 0)} pages will be added to today's reading goal!
                    </Body>
                  )}
                  {Boolean(error) && <Body style={{ color: '#ffb6a9', fontSize: 12 }}>{error}</Body>}
                </View>
              )}

              <Button title="Save Reading & Finish" icon={Check} onPress={submitLog} />
              <Button title="Finish without logging" secondary onPress={onClose} />
            </View>
          ) : (
            <>
              {/* Presets */}
              <View className="flex-row justify-center flex-wrap gap-2" style={{ marginBottom: 24 }}>
                {PRESET_DURATIONS.map(preset => {
                  const active = selectedDuration === preset.seconds;
                  return (
                    <Pressable
                      key={preset.label}
                      accessibilityRole="button"
                      onPress={() => handleSelectDuration(preset.seconds)}
                      style={{
                        minHeight: 44,
                        justifyContent: 'center',
                        paddingVertical: 8,
                        paddingHorizontal: 16,
                        borderRadius: 20,
                        backgroundColor: active ? colors.amber : colors.raised,
                        borderWidth: 1,
                        borderColor: active ? colors.amber : colors.line,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: fonts.medium,
                          fontSize: 12,
                          color: active ? colors.dark : colors.muted,
                        }}
                      >
                        {preset.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Glowing Timer Circle */}
              <View
                style={{
                  alignSelf: 'center',
                  width: 200,
                  height: 200,
                  borderRadius: 100,
                  borderWidth: 2,
                  borderColor: isRunning ? colors.amber : colors.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isRunning ? '#1f241d' : '#171917',
                  shadowColor: colors.amber,
                  shadowOpacity: isRunning ? 0.3 : 0,
                  shadowRadius: 20,
                  elevation: isRunning ? 8 : 0,
                  marginBottom: 24,
                }}
              >
                <Heading size={42} style={{ letterSpacing: 1 }}>
                  {displayTime}
                </Heading>
                <Body muted style={{ fontSize: 11, marginTop: 4 }}>
                  {isRunning ? (selectedDuration > 0 ? 'Remaining' : 'Elapsed') : 'Paused'}
                </Body>
              </View>

              {/* Controls */}
              <View className="flex-row justify-center items-center gap-4" style={{ marginBottom: 24 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={isRunning ? 'Pause timer' : 'Start timer'}
                  onPress={() => setIsRunning(!isRunning)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: colors.amber,
                    paddingVertical: 14,
                    paddingHorizontal: 28,
                    borderRadius: 24,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  {isRunning ? <Pause size={18} color={colors.dark} /> : <Play size={18} color={colors.dark} />}
                  <Text style={{ fontFamily: fonts.bold, fontSize: 14, color: colors.dark }}>
                    {isRunning ? 'Pause' : 'Start Reading'}
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Reset timer"
                  onPress={handleReset}
                  style={({ pressed }) => ({
                    backgroundColor: colors.raised,
                    padding: 14,
                    borderRadius: 24,
                    borderWidth: 1,
                    borderColor: colors.line,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <RotateCcw size={18} color={colors.muted} />
                </Pressable>
              </View>

              {/* Ambient Soundscapes quick selector */}
              <View style={{ borderTopWidth: 1, borderColor: colors.line, paddingTop: 18, marginTop: 4 }}>
                <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
                  <Label>AMBIENT SOUNDSCAPE</Label>
                  <Body muted style={{ fontSize: 11 }}>
                    {currentSound === 'none' ? 'Muted' : SOUND_OPTIONS.find(s => s.id === currentSound)?.label}
                  </Body>
                </View>

                <View className="flex-row flex-wrap gap-2">
                  {SOUND_OPTIONS.map(opt => {
                    const active = currentSound === opt.id;
                    return (
                      <Pressable
                        key={opt.id}
                        accessibilityRole="button"
                        accessibilityLabel={opt.label}
                        onPress={() => setSoundMode(opt.id)}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 6,
                          minHeight: 44,
                          justifyContent: 'center',
                          paddingVertical: 6,
                          paddingHorizontal: 12,
                          borderRadius: 16,
                          backgroundColor: active ? '#2d2f26' : colors.bg,
                          borderWidth: 1,
                          borderColor: active ? colors.amber : colors.line,
                          opacity: pressed ? 0.7 : 1,
                        })}
                      >
                        <Text
                          style={{
                            fontSize: 11,
                            fontFamily: active ? fonts.medium : fonts.body,
                            color: active ? colors.amber : colors.muted,
                          }}
                        >
                          {opt.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Finish session button */}
              {secondsElapsed > 30 && (
                <View style={{ marginTop: 20 }}>
                  <Button title="Finish Reading & Log Pages" icon={Check} onPress={handleFinishSession} secondary />
                </View>
              )}
            </>
          )}
    </Sheet>
  );
}
