import React from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Flame,
  ListChecks,
  Play,
  Plus,
  SlidersHorizontal,
} from 'lucide-react-native';
import { selectStats } from '../model';
import {
  Body,
  Button,
  Card,
  colors,
  Cover,
  Empty,
  fonts,
  Heading,
  Label,
  Progress,
  QuoteCard,
  StarRating,
  TextLink,
} from '../ui';
import { ReadingChart } from '../ReadingChart';
import { TaskRow } from '../components/tasks/TaskRow';
import { EVENING_QUOTES } from '../constants/content';
import { ScreenProps, statusLabels } from './types';

export function HomeScreen(props: ScreenProps) {
  const { state, compact, onTab, onBook, onTask, onToggleTask, onGoal, onFocusSession, onQuickBump } = props;
  const stats = selectStats(state);
  const current = state.books.find(book => book.status === 'reading');
  const tasks = state.tasks.filter(task => task.due === 'today');
  const nightstand = state.books.filter(book => book.id !== current?.id && book.status !== 'finished').slice(0, 3);
  const quote = EVENING_QUOTES[Math.abs(new Date().getDate()) % EVENING_QUOTES.length];

  return (
    <View>
      <View style={{ marginBottom: 34 }}>
        <Label color={colors.amber}>SLOW DOWN. SETTLE IN.</Label>
        <Heading size={compact ? 39 : 49} style={{ marginTop: 13 }}>
          A little time,{compact ? '\n' : ' '}just for you.
        </Heading>
        <Body muted style={{ marginTop: 12, fontSize: 14 }}>
          Good books. A clearer mind. Your own kind of evening.
        </Body>
      </View>

      <View style={{ flexDirection: compact ? 'column' : 'row', gap: 20 }}>
        {/* Currently Reading Card */}
        <Card style={{ flex: compact ? undefined : 1.4, padding: compact ? 22 : 26 }}>
          <View className="flex-row justify-between items-center" style={{ marginBottom: 24 }}>
            <Label>CURRENTLY READING</Label>
            <BookOpen size={17} color={colors.muted} strokeWidth={1.4} />
          </View>

          {current ? (
            <View>
              <View className="flex-row" style={{ gap: compact ? 20 : 28 }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Open ${current.title}`}
                  onPress={() => onBook(current)}
                >
                  <Cover book={current} width={compact ? 100 : 124} />
                </Pressable>
                <View style={{ flex: 1, justifyContent: 'center', minWidth: 0 }}>
                  <Label color={colors.amber}>PICK UP WHERE YOU LEFT OFF</Label>
                  <Heading size={compact ? 23 : 28} style={{ marginTop: 12 }}>
                    {current.title}
                  </Heading>
                  <Body muted style={{ fontSize: 12, marginTop: 5 }}>
                    {current.author}
                  </Body>

                  <View style={{ marginTop: 20, marginBottom: 8 }}>
                    <Progress value={current.currentPage / current.totalPages} />
                  </View>
                  <View className="flex-row justify-between">
                    <Body muted style={{ fontSize: 10 }}>
                      Page {current.currentPage} of {current.totalPages}
                    </Body>
                    <Body style={{ fontSize: 10, color: colors.amber }}>
                      {Math.round((current.currentPage / current.totalPages) * 100)}%
                    </Body>
                  </View>
                </View>
              </View>

              {/* Quick Actions Bar */}
              <View
                style={{
                  marginTop: 20,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors.line,
                  flexDirection: compact ? 'column' : 'row',
                  alignItems: compact ? 'stretch' : 'center',
                  gap: 10,
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Button
                    title="Focus Session"
                    icon={Play}
                    small
                    onPress={() => onFocusSession?.(current)}
                  />
                  <Button
                    title="Update"
                    secondary
                    icon={Plus}
                    small
                    onPress={() => onBook(current)}
                  />
                </View>

                {/* Quick +5 / +10 page bump buttons */}
                {onQuickBump && (
                  <View className="flex-row items-center gap-2" style={{ marginLeft: compact ? 0 : 'auto' }}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Quick add 5 pages"
                      onPress={() => onQuickBump(current, 5)}
                      style={({ pressed }) => ({
                        paddingVertical: 7,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: colors.raised,
                        borderWidth: 1,
                        borderColor: colors.line,
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      <Text style={{ color: colors.amber, fontFamily: fonts.medium, fontSize: 11 }}>
                        +5 pgs
                      </Text>
                    </Pressable>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel="Quick add 10 pages"
                      onPress={() => onQuickBump(current, 10)}
                      style={({ pressed }) => ({
                        paddingVertical: 7,
                        paddingHorizontal: 12,
                        borderRadius: 8,
                        backgroundColor: colors.raised,
                        borderWidth: 1,
                        borderColor: colors.line,
                        opacity: pressed ? 0.6 : 1,
                      })}
                    >
                      <Text style={{ color: colors.amber, fontFamily: fonts.medium, fontSize: 11 }}>
                        +10 pgs
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <Empty
              title="Your next chapter"
              description="Choose a book from your shelf or add a new one to start reading."
              action={<Button title="Find a book" onPress={() => onTab('books')} />}
            />
          )}
        </Card>

        {/* On Your Mind Card */}
        <Card style={{ flex: compact ? undefined : 1, padding: compact ? 22 : 26 }}>
          <View className="flex-row items-center justify-between">
            <Label>ON YOUR MIND</Label>
            <TextLink title="View all" icon={ArrowUpRight} onPress={() => onTab('tasks')} />
          </View>
          <Heading size={23} style={{ marginBottom: 5 }}>
            A few things for today
          </Heading>
          {tasks.length ? (
            tasks.slice(0, 3).map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() => onToggleTask(task.id)}
                onEdit={() => onTask(task)}
                last={i === Math.min(tasks.length, 3) - 1}
              />
            ))
          ) : (
            <Body muted style={{ paddingVertical: 30 }}>
              A clear evening. Add something when it comes to mind.
            </Body>
          )}
          <TextLink title="Add a little to-do" icon={Plus} onPress={() => onTask()} />
        </Card>
      </View>

      {/* 3 Metric Cards */}
      <View style={{ flexDirection: compact ? 'column' : 'row', gap: 20, marginTop: 20 }}>
        <Card style={{ flex: 1, padding: 23 }}>
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <BookOpen size={16} color={colors.amber} />
              <Body muted style={{ fontSize: 12 }}>
                Your daily reading
              </Body>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Change daily reading goal"
              onPress={onGoal}
              style={{ padding: 6 }}
            >
              <SlidersHorizontal size={15} color={colors.muted} />
            </Pressable>
          </View>
          <View className="flex-row items-baseline" style={{ marginTop: 12, marginBottom: 14, gap: 7 }}>
            <Heading size={30}>{stats.pagesToday}</Heading>
            <Body muted style={{ fontSize: 12 }}>
              of {state.dailyGoal} pages
            </Body>
            <View style={{ flex: 1 }} />
            <Body style={{ color: colors.amber, fontSize: 10 }}>
              {stats.pagesToday >= state.dailyGoal ? 'Goal reached ★' : 'One page at a time'}
            </Body>
          </View>
          <Progress value={stats.goalProgress} />
        </Card>

        <Card style={{ flex: 0.8, padding: 23 }}>
          <View className="flex-row items-center gap-2">
            <Flame size={16} color={colors.amber} />
            <Body muted style={{ fontSize: 12 }}>
              Reading rhythm
            </Body>
          </View>
          <View className="flex-row items-baseline gap-2" style={{ marginTop: 17 }}>
            <Heading size={30}>{stats.readingStreak}</Heading>
            <Body muted style={{ fontSize: 12 }}>
              {stats.readingStreak === 1 ? 'day' : 'days'} in a row
            </Body>
          </View>
          <Body muted style={{ fontSize: 10, marginTop: 4 }}>
            {stats.readingStreak ? 'A small habit, a lovely ritual.' : 'Your next page starts a new streak.'}
          </Body>
        </Card>

        <Card style={{ flex: 0.8, padding: 23 }}>
          <View className="flex-row items-center gap-2">
            <ListChecks size={16} color={colors.amber} />
            <Body muted style={{ fontSize: 12 }}>
              A little lighter
            </Body>
          </View>
          <View className="flex-row items-baseline gap-2" style={{ marginTop: 17 }}>
            <Heading size={30}>
              {tasks.filter(task => task.completed).length}
              <Text style={{ fontSize: 19, color: colors.muted }}> / {tasks.length}</Text>
            </Heading>
            <Body muted style={{ fontSize: 12 }}>
              to-dos done
            </Body>
          </View>
          <Body muted style={{ fontSize: 10, marginTop: 4 }}>
            Make space for what matters.
          </Body>
        </Card>
      </View>

      {/* Interactive 7-Day Reading Chart */}
      <ReadingChart
        week={stats.week}
        dailyGoal={state.dailyGoal}
        streak={stats.readingStreak}
        compact={compact}
      />

      {/* On Your Nightstand */}
      <View style={{ marginTop: 36 }}>
        <View className="flex-row justify-between items-center" style={{ marginBottom: 14 }}>
          <Heading size={25}>On your nightstand</Heading>
          <TextLink title="Your bookshelf" icon={ArrowRight} onPress={() => onTab('books')} />
        </View>
        <View style={{ flexDirection: compact ? 'column' : 'row', gap: 18 }}>
          {nightstand.map(book => (
            <Pressable
              key={book.id}
              accessibilityRole="button"
              accessibilityLabel={`Open ${book.title}`}
              onPress={() => onBook(book)}
              style={({ pressed }) => ({ flex: compact ? undefined : 1, opacity: pressed ? 0.6 : 1 })}
            >
              <Card style={{ padding: 17, flexDirection: 'row', alignItems: 'center', gap: 16, height: 145 }}>
                <Cover book={book} width={68} />
                <View style={{ flex: 1 }}>
                  <Body style={{ fontFamily: fonts.medium, fontSize: 12, lineHeight: 18 }}>
                    {book.title}
                  </Body>
                  <Body muted style={{ fontSize: 10, lineHeight: 16, marginTop: 5 }}>
                    {book.author}
                  </Body>
                  <View className="flex-row items-center gap-2" style={{ marginTop: 10 }}>
                    <Body style={{ color: book.status === 'reading' ? colors.amber : colors.muted, fontSize: 9 }}>
                      {statusLabels[book.status]}
                    </Body>
                    {book.rating !== undefined && book.rating > 0 && (
                      <StarRating rating={book.rating} readonly size={11} />
                    )}
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
        {nightstand.length === 0 && <Body muted>Your shelf has room for something good.</Body>}
      </View>

      {/* Literary Evening Quote Card */}
      <View style={{ marginTop: 32 }}>
        <QuoteCard quote={quote.text} author={quote.author} />
      </View>

      <View style={{ marginTop: 24, paddingTop: 20, borderTopWidth: 1, borderColor: colors.line, alignItems: 'center' }}>
        <Body muted style={{ fontFamily: fonts.serifItalic, fontSize: 14, textAlign: 'center' }}>
          There’s no rush. This part of the day belongs to you.
        </Body>
      </View>
    </View>
  );
}
