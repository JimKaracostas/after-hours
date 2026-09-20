import React from 'react';
import { Text } from 'react-native';
import { colors, fonts } from '../../theme/tokens';

export function Label({ children, color = colors.muted }: { children: React.ReactNode; color?: string }) {
  return (
    <Text style={{ fontFamily: fonts.bold, color, fontSize: 10, letterSpacing: 2.1, lineHeight: 16 }}>
      {children}
    </Text>
  );
}

export function Body({
  children,
  muted = false,
  style,
  ...props
}: React.ComponentProps<typeof Text> & { muted?: boolean }) {
  return (
    <Text
      {...props}
      style={[
        {
          fontFamily: fonts.body,
          fontSize: 14,
          lineHeight: 22,
          color: muted ? colors.muted : colors.text,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

export function Heading({
  children,
  size = 30,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  style?: React.ComponentProps<typeof Text>['style'];
}) {
  return (
    <Text
      accessibilityRole="header"
      style={[
        {
          fontFamily: fonts.serif,
          color: colors.text,
          fontSize: size,
          lineHeight: size * 1.25,
          letterSpacing: -0.7,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
