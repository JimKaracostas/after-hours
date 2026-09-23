import { Pressable, Text, View } from 'react-native';
import { Moon, Settings2, Volume2 } from 'lucide-react-native';
import { Body, colors, fonts, Heading, IconButton, Label } from '../ui';

export function TopBar({
  mobileNav,
  today,
  isPlaying,
  audioMode,
  onOpenSound,
  onOpenSettings,
}: {
  mobileNav: boolean;
  today: string;
  isPlaying: boolean;
  audioMode: string;
  onOpenSound: () => void;
  onOpenSettings: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between" style={{ marginBottom: mobileNav ? 22 : 38 }}>
      {mobileNav ? (
        <View className="flex-row items-center gap-2">
          <Moon color={colors.amber} size={23} strokeWidth={1.4} />
          <Heading size={19} style={{ fontFamily: fonts.bold, letterSpacing: -0.6 }}>after hours</Heading>
        </View>
      ) : (
        <Label>YOUR PERSONAL WIND-DOWN</Label>
      )}

      <View className="flex-row items-center gap-3">
        {!mobileNav && <Body muted style={{ fontSize: 11 }}>{today}</Body>}

        {/* Soundscapes Header Toggle */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Evening soundscapes"
          onPress={onOpenSound}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            minHeight: 44,
            minWidth: 44,
            justifyContent: 'center',
            paddingVertical: 7,
            paddingHorizontal: 12,
            borderRadius: 18,
            backgroundColor: isPlaying ? '#2d2f25' : colors.raised,
            borderWidth: 1,
            borderColor: isPlaying ? colors.amber : colors.line,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Volume2 size={15} color={isPlaying ? colors.amber : colors.muted} />
          {!mobileNav && <Text
            style={{
              fontSize: 11,
              fontFamily: fonts.medium,
              color: isPlaying ? colors.amber : colors.muted,
            }}
          >
            {isPlaying ? audioMode : 'Sounds'}
          </Text>}
        </Pressable>

        <IconButton icon={Settings2} label="Reading settings" onPress={onOpenSettings} active />
      </View>
    </View>
  );
}
