import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Plus, Sparkles } from 'lucide-react-native';
import { Task } from '../../model';
import { colors, fonts, Label } from '../ui';
import { EVENING_RITUALS } from '../../constants/content';

export function RitualsSection({
  onAddPresetTask,
}: {
  onAddPresetTask?: (title: string, category: Task['category']) => void;
}) {
  return (
    <View style={{ marginBottom: 20 }}>
      <View className="flex-row items-center gap-2" style={{ marginBottom: 12 }}>
        <Sparkles size={14} color={colors.amber} />
        <Label color={colors.amber}>EVENING WIND-DOWN RITUALS</Label>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 4 }}>
        {EVENING_RITUALS.map(ritual => (
          <Pressable
            key={ritual.title}
            accessibilityRole="button"
            accessibilityLabel={`Add ritual: ${ritual.title}`}
            onPress={() => onAddPresetTask?.(ritual.title, ritual.category)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingVertical: 9,
              paddingHorizontal: 14,
              borderRadius: 20,
              backgroundColor: colors.raised,
              borderWidth: 1,
              borderColor: colors.line,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 13 }}>{ritual.icon}</Text>
            <Text style={{ fontFamily: fonts.medium, fontSize: 12, color: colors.text }}>
              {ritual.title}
            </Text>
            <Plus size={13} color={colors.amber} />
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
