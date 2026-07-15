import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useUser } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { openSettingsDrawerRef } from '@/app/(tabs)/_layout';
import { useTheme, withAlpha } from '@/lib/theme';

export function Header() {
  const { user } = useUser();
  const { colors } = useTheme();
  const appName = Constants.expoConfig?.name ?? 'App';

  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .map((n) => n![0].toUpperCase())
    .join('') || '?';

  return (
    <View style={styles.header}>
      <Text style={[styles.brand, { color: colors.TEXT_SECONDARY }]}>{appName}</Text>
      <Pressable
        style={({ pressed }) => [
          styles.avatar,
          { backgroundColor: withAlpha(colors.ACCENT, 0.14) },
          pressed && { opacity: 0.7 },
        ]}
        onPress={() => openSettingsDrawerRef.current?.()}
      >
        <Text style={[styles.avatarText, { color: colors.ACCENT }]}>{initials}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 4,
  },
  brand: { fontSize: 15, fontWeight: '500', letterSpacing: -0.2 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 13, fontWeight: '600' },
});
