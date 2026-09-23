import { useState } from 'react';
import { Share, Platform, TextInput, View } from 'react-native';
import { Check, Download, Upload } from 'lucide-react-native';
import { AppState, isAppState } from '../model';
import { Body, Button, Chips, colors, Field, Label, Sheet } from '../ui';
import { CommonProps, integer } from './types';

export function GoalDialog({
  dailyGoal,
  state,
  dispatch,
  onClose,
}: CommonProps & { dailyGoal: number; state?: AppState }) {
  const [goal, setGoal] = useState(String(dailyGoal));
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importJson, setImportJson] = useState('');

  function save() {
    const value = integer(goal);
    if (!Number.isSafeInteger(value) || value < 1 || value > 1000)
      return setError('Choose a whole number from 1 to 1,000 pages.');
    dispatch({ type: 'goal/set', dailyGoal: value });
    onClose();
  }

  function handleExport() {
    if (!state) return;
    const json = JSON.stringify(state, null, 2);
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard
        .writeText(json)
        .then(() => {
          setInfoMessage('Library backup copied to clipboard as JSON!');
        })
        .catch(() => {
          setError('Could not copy your backup. Please allow clipboard access and try again.');
        });
    } else {
      Share.share({ message: json, title: 'After Hours backup' }).catch(() => {
        setError('Could not share your backup. Please try again.');
      });
    }
  }

  function handleImport() {
    try {
      const parsed = JSON.parse(importJson);
      if (!isAppState(parsed)) {
        setError('This backup is incomplete or invalid. Your current library has not changed.');
        return;
      }
      dispatch({ type: 'state/import', state: parsed });
      setInfoMessage('Library successfully restored!');
      setShowImport(false);
      onClose();
    } catch {
      setError('Invalid JSON format. Please check the backup data.');
    }
  }

  return (
    <Sheet
      title="Reading Rhythm & Settings"
      subtitle="A small daily goal. A gentle nudge to make time for yourself."
      onClose={onClose}
    >
      <Field
        label="Pages per day"
        value={goal}
        onChangeText={setGoal}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={4}
        autoFocus
        onSubmitEditing={save}
      />
      <Chips
        value={goal}
        onChange={setGoal}
        options={[
          { value: '10', label: '10 pages' },
          { value: '20', label: '20 pages' },
          { value: '30', label: '30 pages' },
          { value: '50', label: '50 pages' },
        ]}
      />
      {Boolean(error) && (
        <Body accessibilityRole="alert" style={{ color: '#ffb6a9', fontSize: 12 }}>
          {error}
        </Body>
      )}
      {Boolean(infoMessage) && (
        <Body style={{ color: colors.sage, fontSize: 12 }}>
          {infoMessage}
        </Body>
      )}
      <Button title="Save reading goal" icon={Check} onPress={save} />

      {/* Library Backup & Restore */}
      <View style={{ borderTopWidth: 1, borderColor: colors.line, paddingTop: 18, gap: 10 }}>
        <Label>DATA & BACKUPS</Label>
        <View className="flex-row flex-wrap gap-2">
          <Button title="Export JSON" secondary icon={Download} small onPress={handleExport} />
          <Button title="Import JSON" secondary icon={Upload} small onPress={() => setShowImport(!showImport)} />
        </View>

        {showImport && (
          <View
            style={{
              gap: 8,
              padding: 12,
              backgroundColor: colors.bg,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.line,
            }}
          >
            <Body style={{ fontSize: 11 }}>Paste your backup. Restoring replaces your current library:</Body>
            <TextInput
              multiline
              value={importJson}
              onChangeText={setImportJson}
              placeholder='{"books": [...], ...}'
              placeholderTextColor="#7e8579"
              style={{
                color: colors.text,
                fontSize: 16,
                minHeight: 60,
                borderWidth: 1,
                borderColor: colors.line,
                borderRadius: 8,
                padding: 8,
              }}
            />
            <Button title="Restore from JSON" small icon={Check} onPress={handleImport} />
          </View>
        )}


      </View>
    </Sheet>
  );
}
