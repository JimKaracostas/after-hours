import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'fixed' as any,
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingHorizontal: 16,
        paddingBottom: Math.max(insets.bottom, 10),
        paddingTop: 8,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          borderWidth: 1,
          borderRadius: 28,
          borderColor: colors.line,
          backgroundColor: '#181b18',
          paddingVertical: 5,
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
    </View>
  );
}
