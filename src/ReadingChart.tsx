import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Flame, Sparkles } from 'lucide-react-native';
import { Card, colors, fonts, Heading, Label } from './ui';

export interface ReadingChartProps {
  week: { date: string; label: string; pages: number }[];
  dailyGoal: number;
  streak: number;
  compact?: boolean;
}

export function ReadingChart({ week, dailyGoal, streak, compact = false }: ReadingChartProps) {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const totalWeekPages = week.reduce((sum, d) => sum + d.pages, 0);
  const maxPages = Math.max(dailyGoal * 1.25, ...week.map(d => d.pages), 10);
  const chartHeight = compact ? 100 : 120;
  const todayIndex = 6; // last item in 7-day offset array is today

  return (
    <Card style={{ padding: compact ? 20 : 26, marginTop: 20 }}>
      {/* Header */}
      <View className="flex-row items-center justify-between" style={{ marginBottom: 18 }}>
        <View>
          <View className="flex-row items-center gap-2">
            <Label color={colors.amber}>YOUR 7-DAY MOMENTUM</Label>
            {totalWeekPages > 0 && <Sparkles size={13} color={colors.amber} />}
          </View>
          <Heading size={compact ? 20 : 23} style={{ marginTop: 4 }}>
            {totalWeekPages} pages this week
          </Heading>
        </View>

        {streak > 0 && (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: '#272218',
              borderColor: '#614822',
              borderWidth: 1,
              borderRadius: 20,
              paddingVertical: 6,
              paddingHorizontal: 12,
            }}
          >
            <Flame size={15} color={colors.amber} />
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.amber }}>
              {streak} day streak
            </Text>
          </View>
        )}
      </View>

      {/* Selected day feedback pill */}
      <View style={{ minHeight: 22, marginBottom: 8, justifyContent: 'center' }}>
        {selectedDay !== null ? (
          <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: colors.amber }}>
            {week[selectedDay].label}: {week[selectedDay].pages} pages read{' '}
            {week[selectedDay].pages >= dailyGoal ? '· Goal reached! ★' : ''}
          </Text>
        ) : (
          <Text style={{ fontFamily: fonts.body, fontSize: 11, color: colors.muted }}>
            Daily goal: {dailyGoal} pages · Tap a bar to view details
          </Text>
        )}
      </View>

      {/* Bars container */}
      <View
        style={{
          height: chartHeight,
          flexDirection: 'row',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          borderBottomWidth: 1,
          borderBottomColor: colors.line,
          paddingBottom: 6,
          position: 'relative',
        }}
      >
        {/* Subtle Goal Line */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: (dailyGoal / maxPages) * (chartHeight - 20) + 6,
            borderBottomWidth: 1,
            borderBottomColor: '#453a29',
            borderStyle: 'dashed',
            zIndex: 1,
            flexDirection: 'row',
            justifyContent: 'flex-end',
          }}
        >
          <Text style={{ fontSize: 9, color: '#7a684b', fontFamily: fonts.body, paddingBottom: 2, paddingRight: 4 }}>
            goal
          </Text>
        </View>

        {week.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isSelected = selectedDay === idx;
          const fillRatio = Math.min(1, day.pages / maxPages);
          const barHeight = Math.max(4, fillRatio * (chartHeight - 24));
          const hitGoal = day.pages >= dailyGoal;

          return (
            <Pressable
              key={day.date}
              accessibilityRole="button"
              accessibilityLabel={`${day.label}: ${day.pages} pages`}
              onPress={() => setSelectedDay(isSelected ? null : idx)}
              style={({ pressed }) => ({
                flex: 1,
                height: '100%',
                alignItems: 'center',
                justifyContent: 'flex-end',
                paddingHorizontal: 4,
                opacity: pressed ? 0.7 : 1,
                zIndex: 2,
              })}
            >
              {/* Pages count bubble on hover / selection */}
              {day.pages > 0 && (
                <Text
                  style={{
                    fontSize: 9,
                    fontFamily: fonts.medium,
                    color: hitGoal ? colors.amber : colors.muted,
                    marginBottom: 4,
                    opacity: isSelected || day.pages > 0 ? 1 : 0.6,
                  }}
                >
                  {day.pages}
                </Text>
              )}

              {/* Bar */}
              <View
                style={{
                  width: compact ? 18 : 26,
                  height: barHeight,
                  backgroundColor: hitGoal ? colors.amber : day.pages > 0 ? '#8e7751' : colors.line,
                  borderRadius: 6,
                  borderWidth: isSelected || isToday ? 1 : 0,
                  borderColor: isToday ? '#ffd599' : colors.text,
                }}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Day Labels below bars */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          paddingTop: 10,
        }}
      >
        {week.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isSelected = selectedDay === idx;
          return (
            <Pressable
              key={day.date}
              onPress={() => setSelectedDay(isSelected ? null : idx)}
              style={{ flex: 1, alignItems: 'center' }}
            >
              <Text
                style={{
                  fontSize: 10,
                  fontFamily: isToday ? fonts.bold : fonts.medium,
                  color: isToday ? colors.amber : isSelected ? colors.text : colors.muted,
                }}
              >
                {day.label}
              </Text>
              {isToday && (
                <View
                  style={{
                    width: 3,
                    height: 3,
                    borderRadius: 1.5,
                    backgroundColor: colors.amber,
                    marginTop: 3,
                  }}
                />
              )}
            </Pressable>
          );
        })}
      </View>
    </Card>
  );
}
