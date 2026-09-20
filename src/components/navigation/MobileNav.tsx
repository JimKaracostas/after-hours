import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Tab } from '../../screens/types';
import { colors, fonts } from '../ui';
import { navigationItems } from './types';

export function MobileNav({
  currentTab,
  onNavigate,
}: {
  currentTab: Tab;
  onNavigate: (tab: Tab) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        borderWidth: 1,
        borderRadius: 28,
        marginHorizontal: 16,
        marginBottom: 8,
        marginTop: 4,
        paddingVertical: 5,
        borderColor: colors.line,
        backgroundColor: '#181b18',
        paddingHorizontal: 6,
      }}
    >
      {navigationItems.map(({ id, title, icon: Icon }) => (
        <Pressable
          key={id}
          accessibilityRole="tab"
          accessibilityState={{ selected: currentTab === id }}
          aria-selected={currentTab === id}
          accessibilityLabel={title}
          onPress={() => onNavigate(id)}
          style={({ pressed }) => ({
            flex: 1,
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 5,
            paddingVertical: 11,
            paddingHorizontal: 4,
            borderRadius: 22,
            minHeight: 56,
            backgroundColor: currentTab === id ? colors.raised : 'transparent',
            opacity: pressed ? 0.6 : 1,
          })}
        >
          <Icon size={22} strokeWidth={1.65} color={currentTab === id ? colors.amber : colors.muted} />
          <Text
            style={{
              color: currentTab === id ? colors.amber : colors.muted,
              fontFamily: currentTab === id ? fonts.bold : fonts.medium,
              fontSize: 11,
            }}
          >
            {title}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
