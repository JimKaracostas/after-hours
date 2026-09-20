import React from 'react';
import { Pressable, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Task } from '../../model';
import { Body, colors } from '../ui';

export function TaskRow({
  task,
  onToggle,
  onEdit,
  last = false,
}: {
  task: Task;
  onToggle: () => void;
  onEdit: () => void;
  last?: boolean;
}) {
  return (
    <View
      className="flex-row items-center"
      style={{ minHeight: 73, borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.line }}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={`Complete ${task.title}`}
        accessibilityState={{ checked: task.completed }}
        aria-checked={task.completed}
        onPress={onToggle}
        style={{ width: 43, minHeight: 52, justifyContent: 'center' }}
      >
        <View
          style={{
            width: 21,
            height: 21,
            borderRadius: 7,
            borderWidth: 1,
            borderColor: task.completed ? colors.sage : '#60695b',
            backgroundColor: task.completed ? colors.sage : 'transparent',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {task.completed && <Check size={13} color={colors.bg} strokeWidth={2.5} />}
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Edit task ${task.title}`}
        onPress={onEdit}
        style={{ flex: 1, paddingVertical: 16 }}
      >
        <Body
          style={{
            fontSize: 13,
            lineHeight: 19,
            color: task.completed ? colors.muted : colors.text,
            textDecorationLine: task.completed ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </Body>
        <Body muted style={{ fontSize: 10, lineHeight: 17, marginTop: 3 }}>
          {task.category}
          {task.due === 'tomorrow' ? ' · Tomorrow' : task.due === 'someday' ? ' · Someday' : ''}
        </Body>
      </Pressable>
    </View>
  );
}
