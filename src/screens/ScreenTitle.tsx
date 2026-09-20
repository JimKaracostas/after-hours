import React from 'react';
import { View } from 'react-native';
import { Body, Heading, fonts } from '../ui';

export function ScreenTitle({
  title,
  subtitle,
  action,
  compact,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  compact: boolean;
}) {
  if (compact) return <View style={{ marginBottom: 26, gap: 8 }}><View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}><Heading size={34} style={{ fontFamily: fonts.bold, letterSpacing: -1.3, flexShrink: 1 }}>{title}</Heading>{action}</View><Body muted style={{ fontSize: 15 }}>{subtitle}</Body></View>;
  return (
    <View
      style={{
        flexDirection: compact ? 'column' : 'row',
        justifyContent: 'space-between',
        alignItems: compact ? 'flex-start' : 'flex-end',
        gap: 16,
        marginBottom: 24,
      }}
    >
      <View style={{ flex: compact ? undefined : 1 }}>
        <Heading size={compact ? 34 : 43} style={compact ? { fontFamily: fonts.bold, letterSpacing: -1.3 } : undefined}>{title}</Heading>
        <Body muted style={{ marginTop: 8, fontSize: 15 }}>
          {subtitle}
        </Body>
      </View>
      {action}
    </View>
  );
}
