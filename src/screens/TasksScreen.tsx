import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { Check, Plus, Search, Sparkles, X } from 'lucide-react-native';
import { Task } from '../model';
import {
  Body,
  Button,
  Card,
  Chips,
  colors,
  Empty,
  fonts,
  Heading,
  IconButton,
  Label,
  Progress,
  TextLink,
} from '../ui';
import { TaskRow } from '../components/tasks/TaskRow';
import { EVENING_RITUALS } from '../constants/content';
import { ScreenTitle } from './ScreenTitle';
import { ScreenProps } from './types';

export function TasksScreen({ state, compact, onTask, onToggleTask, onAddPresetTask }: ScreenProps) {
  const [filter, setFilter] = useState<'today' | 'all' | 'completed'>('today');
  const [query, setQuery] = useState('');
  const [showRituals, setShowRituals] = useState(false);

  const tasks = state.tasks.filter(
    task =>
      (filter === 'all' || (filter === 'completed' ? task.completed : task.due === 'today')) &&
      task.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())
  );
  const groups: { title: string; data: Task[] }[] =
    filter === 'all'
      ? [
          { title: 'Today', data: tasks.filter(t => t.due === 'today') },
          { title: 'Tomorrow', data: tasks.filter(t => t.due === 'tomorrow') },
          { title: 'Someday', data: tasks.filter(t => t.due === 'someday') },
        ]
      : [{ title: filter === 'completed' ? 'Little victories' : 'Make a little space', data: tasks }];
  const today = state.tasks.filter(t => t.due === 'today');
  const done = today.filter(t => t.completed).length;
  const allTodayDone = today.length > 0 && done === today.length;

  return (
    <View>
      <ScreenTitle
        title={compact ? "To-Do" : "A clearer mind"}
        subtitle="One thing at a time."
        compact={compact}
        action={
          <View className="flex-row items-center gap-2">
            <Button title="Add to-do" icon={Plus} onPress={() => onTask()} />
          </View>
        }
      />

      {state.tasks.length > 0 && <>
      {/* Today's Pace Card */}
      <Card style={{ padding: 24, marginBottom: 20 }}>
        <View className="flex-row justify-between items-center">
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Label color={colors.amber}>TODAY, AT YOUR PACE</Label>
            <Heading size={compact ? 23 : 25} style={{ marginTop: 10, fontFamily: compact ? fonts.medium : fonts.serif }}>
              {today.length === 0 ? 'All clear for today.' : allTodayDone
                ? 'That’s everything for today.'
                : `${today.length - done} little ${today.length - done === 1 ? 'thing' : 'things'} to go.`}
            </Heading>
            {allTodayDone && (
              <Body style={{ color: colors.sage, fontSize: 12, marginTop: 4 }}>
                All clear for tonight. Time to put your feet up and relax.
              </Body>
            )}
          </View>
          <View
            className="items-center justify-center rounded-full"
            style={{
              width: 55,
              height: 55,
              borderWidth: 2,
              borderColor: allTodayDone ? colors.sage : colors.amber,
              backgroundColor: allTodayDone ? '#242c22' : 'transparent',
            }}
          >
            {allTodayDone ? (
              <Check size={22} color={colors.sage} strokeWidth={2.5} />
            ) : (
              <Body style={{ color: colors.amber, fontSize: 13 }}>
                {done}/{today.length}
              </Body>
            )}
          </View>
        </View>
        <View style={{ marginTop: 20 }}>
          <Progress value={today.length ? done / today.length : 0} />
        </View>
      </Card>

      </>}
      {state.tasks.length > 0 && <>
      {/* Chips Filter */}
      <Chips
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'today', label: 'Today', count: today.length },
          { value: 'all', label: 'All to-dos', count: state.tasks.length },
          { value: 'completed', label: 'Completed', count: state.tasks.filter(t => t.completed).length },
        ]}
      />

      {/* Search Input */}
      <View className="flex-row items-center gap-3" style={{ marginTop: 22, borderBottomWidth: 1, borderColor: colors.line }}>
        <Search size={17} color={colors.muted} />
        <TextInput
          accessibilityLabel="Search to-dos"
          placeholder="Find something on your list…"
          placeholderTextColor="#939b8e"
          value={query}
          onChangeText={setQuery}
          style={{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 16, paddingVertical: 16 }}
        />
        {query.length > 0 && <IconButton icon={X} label="Clear task search" onPress={() => setQuery('')} />}
      </View>

      </>}
      {/* Grouped Tasks */}
      {groups
        .filter(group => group.data.length > 0)
        .map(group => (
          <View key={group.title} style={{ marginTop: 28 }}>
            <Label>{group.title.toUpperCase()}</Label>
            <Card style={{ marginTop: 12, paddingHorizontal: 22 }}>
              {[...group.data]
                .sort((a, b) => Number(a.completed) - Number(b.completed))
                .map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    onToggle={() => onToggleTask(task.id)}
                    onEdit={() => onTask(task)}
                    last={i === group.data.length - 1}
                  />
                ))}
            </Card>
          </View>
        ))}

      {!tasks.length && (
        <Empty
          title={query ? 'Nothing by that name' : filter === 'completed' ? 'Small wins are on their way' : 'Room to breathe'}
          description={
            query
              ? 'Try another search.'
              : filter === 'completed'
              ? 'Check off a to-do and it will be waiting here.'
              : 'Your list is clear. Add a thought, a plan, or a little thing to do.'
          }
          action={<Button title="Add a to-do" onPress={() => onTask()} icon={Plus} />}
        />
      )}

      {/* Evening Wind-Down Rituals Quick-Add Banner */}
      <View
        style={{
          padding: 16,
          backgroundColor: '#191c19',
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.line,
          marginBottom: 20,
        }}
      >
        <View className="flex-row items-center justify-between" style={{ marginBottom: showRituals ? 12 : 0 }}>
          <View className="flex-row items-center gap-2">
            <Sparkles size={16} color={colors.amber} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text }}>
              Evening rituals
            </Text>
          </View>
          <TextLink
            title={showRituals ? 'Hide' : 'Explore'}
            onPress={() => setShowRituals(!showRituals)}
          />
        </View>

        {showRituals && (
          <View style={{ gap: 8, marginTop: 4 }}>
            <Body muted style={{ fontSize: 11 }}>
              Tap any mindful habit to add it directly to today's wind-down:
            </Body>
            <View className="flex-row flex-wrap gap-2">
              {EVENING_RITUALS.map(ritual => (
                <Pressable
                  key={ritual.title}
                  accessibilityRole="button"
                  accessibilityLabel={`Add ritual ${ritual.title}`}
                  onPress={() => onAddPresetTask?.(ritual.title, ritual.category)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingVertical: 7,
                    paddingHorizontal: 12,
                    borderRadius: 12,
                    backgroundColor: colors.panel,
                    borderWidth: 1,
                    borderColor: colors.line,
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text style={{ fontSize: 12 }}>{ritual.icon}</Text>
                  <Text style={{ color: colors.amber, fontSize: 11, fontFamily: fonts.medium }}>
                    + {ritual.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={{ marginTop: 32 }}>
        <Body muted style={{ fontFamily: fonts.serifItalic, textAlign: 'center', fontSize: 14 }}>
          You don’t have to do it all. Just the next small thing.
        </Body>
      </View>
    </View>
  );
}
