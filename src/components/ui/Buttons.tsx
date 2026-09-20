import React from 'react';
import { Pressable, Text } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors, fonts } from '../../theme/tokens';

export function IconButton({
  icon: Icon,
  label,
  onPress,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 22,
        width: 44,
        height: 44,
        backgroundColor: active ? colors.raised : 'transparent',
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon size={20} color={active ? colors.amber : colors.muted} strokeWidth={1.6} />
    </Pressable>
  );
}

export function Button({
  title,
  onPress,
  icon: Icon,
  secondary = false,
  disabled = false,
  danger = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
  secondary?: boolean;
  disabled?: boolean;
  danger?: boolean;
  small?: boolean;
}) {
  const foreground = danger ? '#ffb6a9' : secondary ? colors.text : colors.dark;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        borderRadius: 16,
        minHeight: small ? 44 : 52,
        paddingHorizontal: small ? 16 : 20,
        backgroundColor: danger ? '#3b2723' : secondary ? colors.raised : colors.amber,
        opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        transform: [{ scale: pressed ? 0.98 : 1 }],
        borderWidth: secondary ? 1 : 0,
        borderColor: colors.line,
      })}
    >
      {Icon && <Icon size={16} strokeWidth={1.8} color={foreground} />}
      <Text style={{ color: foreground, fontFamily: fonts.bold, fontSize: 15 }}>{title}</Text>
    </Pressable>
  );
}

export function TextLink({
  title,
  onPress,
  icon: Icon,
}: {
  title: string;
  onPress: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        minHeight: 44,
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Text style={{ fontFamily: fonts.medium, fontSize: 13, color: colors.amber }}>{title}</Text>
      {Icon && <Icon size={15} color={colors.amber} />}
    </Pressable>
  );
}
