import { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Switch, Alert,
  Modal, Animated, ScrollView, PanResponder, useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, withAlpha } from '@/lib/theme';
import Constants from 'expo-constants';

const DISMISS_THRESHOLD = 120;
const DISMISS_VELOCITY = 0.8;

export function SettingsDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { signOut } = useAuth();
  const { user } = useUser();
  const { colors, isDark, toggleTheme } = useTheme();

  const translateY = useRef(new Animated.Value(height)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const dragY = useRef(new Animated.Value(0)).current;
  const sheetTranslate = useRef(Animated.add(translateY, dragY)).current;
  const [mounted, setMounted] = useState(false);
  const animating = useRef(false);
  const dismissViaHandle = useRef<() => void>(() => {});
  const [notifications, setNotifications] = useState(true);
  const [autoSync, setAutoSync] = useState(false);

  dismissViaHandle.current = () => {
    dragY.flattenOffset();
    Animated.parallel([
      Animated.timing(dragY, { toValue: height, duration: 220, useNativeDriver: true }),
      Animated.timing(backdropOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => {
      setMounted(false);
      onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      dragY.setOffset(0);
      dragY.setValue(0);
      translateY.setValue(height);
      backdropOpacity.setValue(0);
      setMounted(true);
      animating.current = true;
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4, speed: 14 }),
        Animated.timing(backdropOpacity, { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start(() => { animating.current = false; });
    } else if (mounted) {
      animating.current = true;
      Animated.parallel([
        Animated.timing(translateY, { toValue: height, duration: 300, useNativeDriver: true }),
        Animated.timing(backdropOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start(({ finished }) => {
        animating.current = false;
        if (finished) setMounted(false);
      });
    }
  }, [visible]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: () => {
        dragY.setOffset(0);
        dragY.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        if (g.dy > 0) dragY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > DISMISS_THRESHOLD || g.vy > DISMISS_VELOCITY) {
          dismissViaHandle.current();
        } else {
          dragY.flattenOffset();
          Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
        }
      },
      onPanResponderTerminate: () => {
        dragY.flattenOffset();
        Animated.spring(dragY, { toValue: 0, useNativeDriver: true, bounciness: 6 }).start();
      },
    })
  ).current;

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => { onClose(); await signOut(); },
      },
    ]);
  };

  const name = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ''}`.trim()
    : 'Account';
  const email = user?.primaryEmailAddress?.emailAddress ?? '—';
  const initials = [user?.firstName, user?.lastName]
    .filter(Boolean).map((n) => n![0].toUpperCase()).join('') || '?';

  return (
    <Modal visible={mounted} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      <Animated.View style={[styles.sheet, {
        backgroundColor: colors.BG,
        transform: [{ translateY: sheetTranslate }],
      }]}>
        {/* Drag handle */}
        <View style={styles.handleArea} {...panResponder.panHandlers} collapsable={false}>
          <View style={[styles.handle, { backgroundColor: colors.HANDLE }]} />
        </View>

        {/* Header row */}
        <View style={[styles.sheetHeader, { borderBottomColor: colors.BORDER }]}>
          <View>
            <Text style={[styles.sheetTitle, { color: colors.TEXT_PRIMARY }]}>Settings</Text>
            <Text style={[styles.sheetSubtitle, { color: colors.TEXT_SECONDARY }]}>Preferences & account</Text>
          </View>
          <Pressable onPress={onClose} style={[styles.closeBtn, { backgroundColor: colors.CARD_BG }]} hitSlop={12}>
            <Ionicons name="close" size={18} color={colors.TEXT_SECONDARY} />
          </Pressable>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
        >
          {/* Profile card */}
          <View style={[styles.profileCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.AVATAR_BG, borderColor: colors.ACCENT }]}>
              <Text style={[styles.avatarInitials, { color: colors.ACCENT }]}>{initials}</Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.profileName, { color: colors.TEXT_PRIMARY }]}>{name}</Text>
              <Text style={[styles.profileEmail, { color: colors.TEXT_SECONDARY }]} selectable>{email}</Text>
            </View>
          </View>

          {/* General */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.TEXT_MUTED }]}>General</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
              <SettingRow icon="notifications-outline" label="Notifications" type="toggle" value={notifications} onToggle={setNotifications} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
              <SettingRow icon="sync-outline" label="Auto-sync" type="toggle" value={autoSync} onToggle={setAutoSync} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
              <SettingRow icon="moon-outline" label="Dark mode" type="toggle" value={isDark} onToggle={toggleTheme} colors={colors} />
            </View>
          </View>

          {/* About */}
          <View style={styles.section}>
            <Text style={[styles.sectionLabel, { color: colors.TEXT_MUTED }]}>About</Text>
            <View style={[styles.sectionCard, { backgroundColor: colors.CARD_BG, borderColor: colors.BORDER }]}>
              <SettingRow icon="information-circle-outline" label="Version" type="value" value={Constants.expoConfig?.version ?? '—'} colors={colors} />
              <View style={[styles.divider, { backgroundColor: colors.BORDER }]} />
              <SettingRow icon="shield-checkmark-outline" label="Privacy" type="chevron" colors={colors} />
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [styles.signOutBtn, { backgroundColor: colors.CARD_BG, borderColor: '#E0555A66' }, pressed && { opacity: 0.8 }]}
            onPress={handleSignOut}
          >
            <Ionicons name="log-out-outline" size={18} color="#E0555A" />
            <Text style={styles.signOutText}>Sign out</Text>
          </Pressable>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

function SettingRow({ icon, label, value, type = 'chevron', onToggle, colors }: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value?: string | boolean;
  type?: 'chevron' | 'toggle' | 'value';
  onToggle?: (v: boolean) => void;
  colors: ReturnType<typeof useTheme>['colors'];
}) {
  return (
    <Pressable style={({ pressed }) => [styles.settingRow, pressed && type === 'chevron' && { opacity: 0.65 }]}>
      <View style={[styles.rowIcon, { backgroundColor: withAlpha(colors.ACCENT, 0.14) }]}>
        <Ionicons name={icon} size={18} color={colors.ACCENT} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.TEXT_PRIMARY }]}>{label}</Text>
      {type === 'toggle' && (
        <Switch
          value={value as boolean}
          onValueChange={onToggle}
          trackColor={{ false: colors.BORDER, true: colors.ACCENT }}
          thumbColor="#FFF"
        />
      )}
      {type === 'chevron' && <Ionicons name="chevron-forward" size={18} color={colors.TEXT_MUTED} />}
      {type === 'value' && <Text style={{ color: colors.TEXT_SECONDARY, fontSize: 14 }}>{value as string}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 24,
  },
  handleArea: {
    paddingTop: 14,
    paddingBottom: 18,
    alignItems: 'center',
    width: '100%',
  },
  handle: {
    width: 44,
    height: 5,
    borderRadius: 3,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  sheetTitle: {
    fontSize: 28,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  sheetSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 20,
  },
  profileCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
  },
  profileEmail: {
    fontSize: 12,
  },
  section: { gap: 10 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '500',
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
  },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginLeft: 62,
  },
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 15,
  },
  signOutText: {
    color: '#E0555A',
    fontSize: 15,
    fontWeight: '600',
  },
});
