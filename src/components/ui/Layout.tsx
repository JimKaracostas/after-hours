import React from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, ScrollView, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BookOpen, X } from 'lucide-react-native';
import { colors, fonts } from '../../theme/tokens';
import { Body, Heading } from './Typography';
import { IconButton } from './Buttons';

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.ComponentProps<typeof View>['style'];
}) {
  return (
    <View
      className="rounded-2xl"
      style={[{ backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line }, style]}
    >
      {children}
    </View>
  );
}

export function Progress({ value, height = 4 }: { value: number; height?: number }) {
  const percentage = Math.min(100, Math.max(0, Math.round(value * 100)));
  return (
    <View
      accessibilityRole="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percentage}
      accessibilityValue={{ min: 0, max: 100, now: percentage }}
      style={{ height, backgroundColor: colors.line, borderRadius: height, overflow: 'hidden' }}
    >
      <View
        style={{
          width: `${percentage}%`,
          height,
          backgroundColor: colors.amber,
          borderRadius: height,
        }}
      />
    </View>
  );
}

export function Sheet({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const mobile = useWindowDimensions().width < 780;
  const insets = useSafeAreaInsets();
  return (
    <Modal visible transparent animationType={mobile ? 'slide' : 'fade'} onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#00000099', justifyContent: mobile ? 'flex-end' : 'center', alignItems: 'center', padding: mobile ? 0 : 24, paddingTop: mobile ? insets.top + 14 : 24 }}>
        <View accessibilityViewIsModal aria-modal={true} role="dialog" aria-label={title} style={{ backgroundColor: colors.panel, borderWidth: 1, borderColor: colors.line, borderRadius: 28, borderBottomLeftRadius: mobile ? 0 : 28, borderBottomRightRadius: mobile ? 0 : 28, width: '100%', maxWidth: mobile ? 600 : 480, maxHeight: mobile ? '96%' : '92%', paddingBottom: mobile ? Math.max(insets.bottom, 16) : 0 }}>
          {mobile && <View style={{ width: 36, height: 5, borderRadius: 3, backgroundColor: '#626860', alignSelf: 'center', marginTop: 10, marginBottom: 2 }}/>}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 22, paddingBottom: 16 }}>
            <Heading size={24} style={{ flex: 1, fontFamily: fonts.bold }}>{title}</Heading>
            <IconButton icon={X} label="Close dialog" onPress={onClose} active/>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 22, paddingTop: 0, gap: 20 }}>
            {Boolean(subtitle) && <Body muted>{subtitle}</Body>}
            {children}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <View className="items-center gap-3" style={{ paddingVertical: 32, paddingHorizontal: 24 }}>
      <BookOpen size={28} color={colors.amber} strokeWidth={1.4} />
      <Heading size={23} style={{ fontFamily: fonts.bold, textAlign: 'center' }}>{title}</Heading>
      <Body muted style={{ textAlign: 'center', maxWidth: 320 }}>
        {description}
      </Body>
      {action && <View style={{ marginTop: 8 }}>{action}</View>}
    </View>
  );
}

export function Loading() {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <ActivityIndicator color={colors.amber} />
      <Body muted style={{ marginTop: 16 }}>
        Making a little room for you…
      </Body>
    </View>
  );
}
