import React from 'react';
import { Pressable, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors, fonts } from '../../theme/tokens';
import { Body } from './Typography';

export function Field({
  label,
  error,
  ...props
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View className="gap-2">
      <Body style={{ fontFamily: fonts.medium, fontSize: 12 }}>{label}</Body>
      <TextInput
        {...props}
        accessibilityLabel={label}
        placeholderTextColor="#858c81"
        selectionColor={colors.amber}
        style={[
          {
            backgroundColor: colors.bg,
            borderWidth: 1,
            borderColor: error ? '#ffb6a9' : colors.line,
            borderRadius: 14,
            paddingHorizontal: 14,
            paddingVertical: 12,
            minHeight: 52,
            color: colors.text,
            fontSize: 16,
            fontFamily: fonts.body,
          },
          props.style,
        ]}
      />
      {Boolean(error) && <Body style={{ color: '#ffb6a9', fontSize: 12 }}>{error}</Body>}
    </View>
  );
}

export function Chips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; count?: number }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map(option => (
        <Pressable
          key={option.value}
          accessibilityRole="button"
          accessibilityState={{ selected: value === option.value }}
          aria-pressed={value === option.value}
          onPress={() => onChange(option.value)}
          style={({ pressed }) => ({
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            borderRadius: 22,
            minHeight: 44,
            paddingHorizontal: 15,
            backgroundColor: value === option.value ? colors.amber : colors.panel,
            borderColor: value === option.value ? colors.amber : colors.line,
            borderWidth: 1,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text
            style={{
              fontFamily: fonts.medium,
              color: value === option.value ? colors.dark : colors.muted,
              fontSize: 12,
            }}
          >
            {option.label}
          </Text>
          {option.count !== undefined && (
            <Text
              style={{
                fontFamily: fonts.body,
                fontSize: 11,
                color: value === option.value ? colors.dark : colors.muted,
              }}
            >
              {option.count}
            </Text>
          )}
        </Pressable>
      ))}
    </View>
  );
}

export function StarRating({
  rating = 0,
  onChange,
  readonly = false,
  size = 18,
}: {
  rating?: number;
  onChange?: (val: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  return (
    <View className="flex-row items-center gap-1">
      {[1, 2, 3, 4, 5].map(star => {
        const active = star <= rating;
        const content = (
          <Text key={star} style={{ fontSize: size, color: active ? colors.amber : '#474f44', lineHeight: size + 4 }}>
            ★
          </Text>
        );
        if (readonly || !onChange) return content;
        return (
          <Pressable
            key={star}
            accessibilityRole="button"
            accessibilityLabel={`${star} stars`}
            onPress={() => onChange(star === rating ? 0 : star)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 2 })}
          >
            {content}
          </Pressable>
        );
      })}
    </View>
  );
}
