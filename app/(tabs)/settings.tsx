import { ScrollView, View, Text, Pressable, Switch, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Header } from '@/components/header';
import { useTheme, withAlpha } from '@/lib/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
type Colors = ReturnType<typeof useTheme>['colors'];

function Row({
  icon,
  label,
  colors,
  type = 'chevron',
  value,
  onToggle,
  onPress,
}: {
  icon: IconName;
  label: string;
  colors: Colors;
  type?: 'chevron' | 'toggle' | 'value';
  value?: string | boolean;
  onToggle?: (v: boolean) => void;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={type === 'chevron' ? onPress : undefined}
      style={({ pressed }) => [styles.row, pressed && type === 'chevron' && { opacity: 0.6 }]}
    >
      <View style={[styles.iconCircle, { backgroundColor: withAlpha(colors.ACCENT, 0.14) }]}>
        <Ionicons name={icon} size={18} color={colors.ACCENT} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.TEXT_PRIMARY }]}>{label}</Text>
      {type === 'toggle' && (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: colors.BORDER, true: colors.ACCENT }}
          thumbColor="#FFF"
        />
      )}
      {type === 'value' && <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 14 }}>{value as string}</Text>}
      {type === 'chevron' && <Ionicons name="chevron-forward" size={18} color={colors.TEXT_MUTED} />}
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);

  const name = user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'Account';
  const email = user?.primaryEmailAddress?.emailAddress ?? '—';
  const initials = [user?.firstName, user?.lastName].filter(Boolean).map((n) => n![0].toUpperCase()).join('') || '?';

  const handleSignOut = () => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: async () => { await signOut(); router.replace('/(auth)/sign-in'); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.BG }} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Header />
        <Text style={[styles.title, { color: colors.TEXT_PRIMARY }]}>Settings</Text>

        <Pressable style={({ pressed }) => [styles.profile, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }, pressed && { opacity: 0.7 }]}>
          <View style={[styles.avatar, { backgroundColor: withAlpha(colors.ACCENT, 0.14) }]}>
            <Text style={{ color: colors.ACCENT, fontSize: 17, fontWeight: '600' }}>{initials}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.TEXT_PRIMARY, fontSize: 16, fontWeight: '600' }}>{name}</Text>
            <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 13, marginTop: 2 }} selectable>{email}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.TEXT_MUTED} />
        </Pressable>

        <Text style={[styles.group, { color: colors.TEXT_SECONDARY }]}>General</Text>
        <View style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Row icon="notifications-outline" label="Notifications" type="toggle" value={notifications} onToggle={setNotifications} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
          <Row icon="moon-outline" label="Dark mode" type="toggle" value={isDark} onToggle={toggleTheme} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
          <Row icon="sync-outline" label="Auto-sync" type="toggle" value={autoSync} onToggle={setAutoSync} colors={colors} />
        </View>

        <Text style={[styles.group, { color: colors.TEXT_SECONDARY }]}>About</Text>
        <View style={[styles.card, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
          <Row icon="information-circle-outline" label="Version" type="value" value={Constants.expoConfig?.version ?? '—'} colors={colors} />
          <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
          <Row icon="shield-checkmark-outline" label="Privacy" type="chevron" colors={colors} />
        </View>

        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [styles.signOut, { backgroundColor: colors.CARD_BG, borderColor: withAlpha('#E0555A', 0.4) }, pressed && { opacity: 0.7 }]}
        >
          <Ionicons name="log-out-outline" size={18} color="#E0555A" />
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { fontSize: 30, fontWeight: '600', letterSpacing: -0.6, marginTop: 16 },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginTop: 18,
  },
  avatar: { width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  group: { fontSize: 13, marginTop: 22, marginBottom: 10, paddingLeft: 4 },
  card: { borderRadius: 18, borderWidth: 1, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 13, paddingHorizontal: 15, paddingVertical: 12 },
  iconCircle: { width: 34, height: 34, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '500' },
  divider: { height: 1, marginLeft: 62 },
  signOut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
    marginTop: 24,
  },
  signOutText: { color: '#E0555A', fontSize: 15, fontWeight: '600' },
});
