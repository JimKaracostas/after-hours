import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Moon, Settings2, Volume2 } from 'lucide-react-native';
import { Tab } from '../../screens/types';
import { Body, colors, fonts, Heading } from '../ui';
import { navigationItems } from './types';

export function Sidebar({
  width,
  currentTab,
  onNavigate,
  isPlaying,
  audioMode,
  onOpenSound,
  onOpenGoal,
}: {
  width: number;
  currentTab: Tab;
  onNavigate: (tab: Tab) => void;
  isPlaying: boolean;
  audioMode: string;
  onOpenSound: () => void;
  onOpenGoal: () => void;
}) {
  return (
    <View
      style={
        {
          width: width > 1350 ? 240 : 206,
          height: '100vh',
          maxHeight: '100vh',
          position: 'sticky',
          top: 0,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          paddingHorizontal: 23,
          paddingTop: 36,
          paddingBottom: 26,
          borderRightWidth: 1,
          borderRightColor: colors.line,
          backgroundColor: '#181b18',
          overflowY: 'auto',
        } as any
      }
    >
      <View>
        <View className="flex-row items-center gap-3">
          <Moon color={colors.amber} size={27} strokeWidth={1.4} />
          <Heading size={22}>after hours</Heading>
        </View>
        <Body muted style={{ fontSize: 10, paddingLeft: 40, marginTop: 8 }}>
          Your time, well spent.
        </Body>

        <View style={{ marginTop: 51, gap: 9 }}>
          {navigationItems.map(({ id, title, icon: Icon }) => (
            <Pressable
              key={id}
              accessibilityRole="tab"
              accessibilityState={{ selected: currentTab === id }}
              aria-selected={currentTab === id}
              accessibilityLabel={title}
              onPress={() => onNavigate(id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                paddingVertical: 15,
                paddingHorizontal: 16,
                borderRadius: 10,
                minHeight: 54,
                backgroundColor: currentTab === id ? '#2d3028' : 'transparent',
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <Icon size={20} strokeWidth={1.65} color={currentTab === id ? colors.amber : colors.muted} />
              <Text
                style={{
                  color: currentTab === id ? colors.amber : colors.muted,
                  fontFamily: currentTab === id ? fonts.bold : fonts.medium,
                  fontSize: 13,
                }}
              >
                {title}
              </Text>
              {currentTab === id && (
                <View style={{ marginLeft: 'auto', width: 4, height: 4, borderRadius: 2, backgroundColor: colors.amber }} />
              )}
            </Pressable>
          ))}
        </View>
      </View>

      <View style={{ marginTop: 24 }}>
        {/* Ambient Soundscape Quick Button in Sidebar */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Soundscapes"
          onPress={onOpenSound}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            padding: 12,
            borderRadius: 12,
            backgroundColor: isPlaying ? '#2d2f25' : colors.raised,
            borderWidth: 1,
            borderColor: isPlaying ? colors.amber : colors.line,
            marginBottom: 20,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Volume2 size={16} color={isPlaying ? colors.amber : colors.muted} />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.medium, fontSize: 11, color: isPlaying ? colors.amber : colors.text }}>
              {isPlaying ? 'Soundscape on' : 'Ambient sound'}
            </Text>
            <Text style={{ fontSize: 9, color: colors.muted }}>
              {isPlaying ? audioMode : 'Rain, fire & crickets'}
            </Text>
          </View>
        </Pressable>

        <View style={{ paddingHorizontal: 13, paddingBottom: 20 }}>
          <Moon size={21} color={colors.amber} strokeWidth={1.1} />
          <Body style={{ fontFamily: fonts.serifItalic, fontSize: 18, lineHeight: 26, marginTop: 17 }}>
            A softer end{`\n`}to a busy day.
          </Body>
          <Body muted style={{ fontSize: 10, marginTop: 12 }}>
            A few pages. A little space.
          </Body>
        </View>

        <View style={{ borderTopWidth: 1, borderTopColor: colors.line, paddingTop: 15 }}>
          <Pressable
            accessibilityRole="button"
            onPress={onOpenGoal}
            className="flex-row items-center gap-3"
            style={{ minHeight: 44, paddingHorizontal: 13 }}
          >
            <Settings2 size={17} color={colors.muted} />
            <Body muted style={{ fontSize: 12 }}>
              Your reading rhythm
            </Body>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
