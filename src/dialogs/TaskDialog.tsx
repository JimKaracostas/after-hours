import { useState } from 'react';
import { View } from 'react-native';
import { Check, Plus, Trash2 } from 'lucide-react-native';
import { Task } from '../model';
import { Body, Button, Chips, Field, Label, Sheet, TextLink } from '../ui';
import { CommonProps, newId } from './types';

export function TaskDialog({ task, dispatch, onClose }: CommonProps & { task?: Task }) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [due, setDue] = useState<Task['due']>(task?.due ?? 'today');
  const [category, setCategory] = useState<Task['category']>(task?.category ?? 'Personal');
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  function saveTask() {
    if (!title.trim()) return setError('Write a little something to add to your list.');
    const values = { title: title.trim(), due, category };
    dispatch(
      task
        ? { type: 'task/update', id: task.id, updates: values }
        : { type: 'task/add', task: { ...values, id: newId(), completed: false } }
    );
    onClose();
  }

  return (
    <Sheet
      title={task ? 'A little adjustment' : 'One less thing on your mind'}
      onClose={onClose}
      subtitle="Big plans or small reminders. There’s room for both."
    >
      <Field
        label="What would you like to do?"
        placeholder="e.g. Read a chapter before bed"
        value={title}
        onChangeText={setTitle}
        autoFocus
        maxLength={500}
        onSubmitEditing={saveTask}
      />
      <View className="gap-3">
        <Label>WHENEVER YOU’RE READY</Label>
        <Chips
          value={due}
          onChange={setDue}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'tomorrow', label: 'Tomorrow' },
            { value: 'someday', label: 'Someday' },
          ]}
        />
      </View>
      <View className="gap-3">
        <Label>A LITTLE CATEGORY</Label>
        <Chips
          value={category}
          onChange={setCategory}
          options={[
            { value: 'Personal', label: 'Personal' },
            { value: 'Reading', label: 'Reading' },
            { value: 'Work', label: 'Work' },
          ]}
        />
      </View>
      {Boolean(error) && (
        <Body accessibilityRole="alert" style={{ color: '#ffb6a9', fontSize: 12 }}>
          {error}
        </Body>
      )}
      <Button title={task ? 'Save changes' : 'Add to my list'} onPress={saveTask} icon={task ? Check : Plus} />
      {task &&
        (confirmDelete ? (
          <View className="gap-3">
            <Body>Remove this to-do from your list?</Body>
            <Button
              title="Remove to-do"
              danger
              icon={Trash2}
              onPress={() => {
                dispatch({ type: 'task/delete', id: task.id });
                onClose();
              }}
            />
            <Button title="Keep to-do" secondary onPress={() => setConfirmDelete(false)} />
          </View>
        ) : (
          <TextLink title="Remove to-do" icon={Trash2} onPress={() => setConfirmDelete(true)} />
        ))}
    </Sheet>
  );
}
