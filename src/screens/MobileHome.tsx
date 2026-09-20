import React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { ArrowUpRight, BookOpen, ChevronRight, Flame, Plus, Play } from 'lucide-react-native';
import { selectStats } from '../model';
import { Body, Button, Card, colors, Cover, fonts, Heading, IconButton, Label, Progress, TextLink } from '../ui';
import { TaskRow } from '../components/tasks/TaskRow';
import { ReadingChart } from '../ReadingChart';
import { ScreenProps } from './types';

export function MobileHome({ state, onBook, onTask, onTab, onToggleTask, onGoal, onFocusSession }: ScreenProps) {
  const stats = selectStats(state);
  const current = state.books.find(b => b.status === 'reading');
  const tasks = state.tasks.filter(t => t.due === 'today');
  const next = state.books.filter(b => b.id !== current?.id && b.status !== 'finished');
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  return <View style={{ gap: 26 }}>
    <View style={{ gap: 7 }}>
      <Body muted style={{ fontSize: 13 }}>{date}</Body>
      <Heading size={36} style={{ fontFamily: fonts.bold, letterSpacing: -1.6, lineHeight: 41 }}>Your time starts here.</Heading>
      <Body muted style={{ fontSize: 15 }}>A good book. A little headspace.</Body>
    </View>
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <Heading size={21} style={{ fontFamily: fonts.bold }}>Continue reading</Heading>
        <IconButton icon={Plus} label="Add a book" onPress={() => onBook()} />
      </View>
      <Card style={{ padding: 20, borderRadius: 26 }}>
        {current ? <>
          <Pressable accessibilityRole="button" accessibilityLabel={`Open ${current.title}`} onPress={() => onBook(current)} style={({pressed}) => ({ flexDirection: 'row', gap: 18, opacity: pressed ? 0.7 : 1 })}>
            <Cover book={current} width={88}/>
            <View style={{ flex: 1, justifyContent: 'center', gap: 8 }}>
              <Label color={colors.amber}>IN PROGRESS</Label>
              <Heading size={23} style={{ fontFamily: fonts.bold, lineHeight: 28 }}>{current.title}</Heading>
              <Body muted style={{ fontSize: 13 }}>{current.author}</Body>
              <Progress value={current.currentPage/current.totalPages}/>
              <Body muted style={{ fontSize: 12 }}>Page {current.currentPage} of {current.totalPages}</Body>
            </View>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
            <View style={{ flex: 1 }}><Button title="Read now" icon={Play} onPress={() => onFocusSession?.(current)}/></View>
            <IconButton icon={Plus} label="Update reading progress" onPress={() => onBook(current)} active/>
          </View>
        </> : <View style={{ alignItems: 'center', paddingVertical: 15, gap: 12 }}>
          <View style={{ width: 64, height: 64, borderRadius: 21, backgroundColor: '#353027', alignItems: 'center', justifyContent: 'center', marginBottom: 3 }}><BookOpen size={29} strokeWidth={1.4} color={colors.amber}/></View>
          <Heading size={24} style={{ fontFamily: fonts.bold }}>Meet your next chapter.</Heading>
          <Body muted style={{ textAlign: 'center', fontSize: 15, maxWidth: 250 }}>Find a book you love and make a little time for it.</Body>
          <View style={{ alignSelf: 'stretch', marginTop: 9 }}><Button title="Find your first book" icon={Plus} onPress={() => onBook()}/></View>
        </View>}
      </Card>
    </View>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <Pressable accessibilityRole="button" accessibilityLabel="Change daily reading goal" onPress={onGoal} style={{ flex: 1 }}>
        <Card style={{ padding: 18, gap: 10, minHeight: 155, borderRadius: 23 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><BookOpen size={19} color={colors.amber}/><ArrowUpRight size={15} color={colors.muted}/></View>
          <Heading size={30} style={{ fontFamily: fonts.bold }}>{stats.pagesToday}<Body muted style={{ fontSize: 13 }}> / {state.dailyGoal}</Body></Heading>
          <Body muted style={{ fontSize: 12 }}>Pages today</Body>
          <Progress value={stats.goalProgress} height={3}/>
        </Card>
      </Pressable>
      <Card style={{ flex: 1, padding: 18, gap: 10, minHeight: 155, borderRadius: 23 }}>
        <Flame size={19} color={colors.amber}/>
        <Heading size={30} style={{ fontFamily: fonts.bold }}>{stats.readingStreak}<Body muted style={{ fontSize: 13 }}> {stats.readingStreak === 1 ? 'day' : 'days'}</Body></Heading>
        <Body muted style={{ fontSize: 12 }}>Reading streak</Body>
        <Body style={{ fontSize: 11, color: colors.sage }}>{stats.readingStreak ? 'Keep your rhythm going.' : 'Start with a single page.'}</Body>
      </Card>
    </View>
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}><Heading size={21} style={{ fontFamily: fonts.bold }}>Today, gently.</Heading><TextLink title="See all" onPress={() => onTab('tasks')} icon={ChevronRight}/></View>
      <Card style={{ paddingHorizontal: 18, paddingVertical: 6, borderRadius: 24 }}>
        {tasks.length ? [...tasks].sort((a,b) => Number(a.completed)-Number(b.completed)).slice(0,3).map((task,i) => <TaskRow key={task.id} task={task} onToggle={() => onToggleTask(task.id)} onEdit={() => onTask(task)} last={i===Math.min(tasks.length,3)-1}/>) : <View style={{ paddingVertical: 16, gap: 4 }}><Body style={{ fontFamily: fonts.medium }}>A little room to breathe.</Body><Body muted style={{ fontSize: 13 }}>Your list is clear. Add whatever is on your mind.</Body></View>}
        <TextLink title="Add a to-do" onPress={() => onTask()} icon={Plus}/>
      </Card>
    </View>
    {next.length > 0 && <View><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}><Heading size={21} style={{ fontFamily: fonts.bold }}>Up next</Heading><TextLink title="Library" onPress={() => onTab('books')} icon={ChevronRight}/></View><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 18 }}>{next.map(book => <Pressable key={book.id} accessibilityRole="button" accessibilityLabel={`Open ${book.title}`} onPress={() => onBook(book)} style={{ width: 110, gap: 8 }}><Cover book={book} width={110}/><Body numberOfLines={2} style={{ fontFamily: fonts.medium, fontSize: 13, lineHeight: 18 }}>{book.title}</Body><Body muted numberOfLines={1} style={{ fontSize: 11 }}>{book.author}</Body></Pressable>)}</ScrollView></View>}
    {state.sessions.length > 0 && <ReadingChart week={stats.week} dailyGoal={state.dailyGoal} streak={stats.readingStreak} compact/>}
    <Body muted style={{ textAlign: 'center', fontSize: 12, paddingVertical: 5 }}>A softer end to a busy day.</Body>
  </View>;
}
