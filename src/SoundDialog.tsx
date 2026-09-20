import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { CloudRain, Flame, Radio, Volume2, VolumeX, Wind } from 'lucide-react-native';
import { Body, Button, colors, fonts, Heading, Label, Sheet } from './ui';
import { SoundMode, SOUND_OPTIONS, useAmbientAudio } from './ambientAudio';

export function SoundDialog({ onClose }: { onClose: () => void }) {
  const { mode: currentMode, setMode, volume, setVolume, error } = useAmbientAudio();

  const getIcon = (id: SoundMode) => {
    switch (id) {
      case 'rain': return CloudRain;
      case 'fireplace': return Flame;
      case 'crickets': return Wind;
      case 'brown': return Radio;
      default: return VolumeX;
    }
  };

  return (
    <Sheet
      title="Evening Soundscapes"
      subtitle="Soft, synthesized soundscapes for a little more headspace."
      onClose={onClose}
    >
      {Boolean(error) && <Body accessibilityRole="alert" style={{ color: '#ffb6a9' }}>{error}</Body>}
      <View style={{ gap: 10 }}>
        {SOUND_OPTIONS.map(opt => {
          const active = currentMode === opt.id;
          const Icon = getIcon(opt.id);
          return (
            <Pressable
              key={opt.id}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              onPress={() => setMode(opt.id)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 16,
                padding: 16,
                borderRadius: 14,
                backgroundColor: active ? '#2c2e26' : colors.raised,
                borderWidth: 1,
                borderColor: active ? colors.amber : colors.line,
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 19,
                  backgroundColor: active ? colors.amber : colors.panel,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={18} color={active ? colors.dark : colors.muted} />
              </View>
              <View style={{ flex: 1 }}>
                <Body style={{ fontFamily: fonts.medium, fontSize: 13, color: active ? colors.amber : colors.text }}>
                  {opt.label}
                </Body>
                <Body muted style={{ fontSize: 11, marginTop: 2 }}>
                  {opt.description}
                </Body>
              </View>
              {active && (
                <View
                  style={{
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderRadius: 10,
                    backgroundColor: '#423722',
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.amber, fontFamily: fonts.medium }}>Active</Text>
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Volume control */}
      {currentMode !== 'none' && (
        <View style={{ marginTop: 16, padding: 16, backgroundColor: colors.bg, borderRadius: 14, borderWidth: 1, borderColor: colors.line }}>
          <View className="flex-row items-center justify-between" style={{ marginBottom: 12 }}>
            <View className="flex-row items-center gap-2">
              <Volume2 size={16} color={colors.amber} />
              <Label>VOLUME</Label>
            </View>
            <Text style={{ fontSize: 11, fontFamily: fonts.medium, color: colors.amber }}>
              {Math.round(volume * 100)}%
            </Text>
          </View>

          <View className="flex-row gap-2">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map(val => (
              <Pressable
                key={val}
                accessibilityRole="button"
                accessibilityLabel={`${Math.round(val * 100)}% volume`}
                onPress={() => setVolume(val)}
                style={{
                  flex: 1,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: volume >= val ? colors.amber : colors.line,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontFamily: fonts.medium,
                    color: volume >= val ? colors.dark : colors.muted,
                  }}
                >
                  {Math.round(val * 100)}%
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      <Button title="Done" onPress={onClose} />
    </Sheet>
  );
}
