import { useState } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/clerk-expo';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SettingsDrawer } from '@/components/settings-drawer';
import { useTheme } from '@/lib/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// Shared ref so the Header avatar can also open the settings drawer.
export const openSettingsDrawerRef = { current: null as (() => void) | null };

const TABS: { name: string; label: string; icon: IoniconsName; activeIcon: IoniconsName }[] = [
  { name: 'index',    label: 'Home',     icon: 'home-outline',     activeIcon: 'home' },
  { name: 'settings', label: 'Settings', icon: 'settings-outline', activeIcon: 'settings' },
];

function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  return (
    <View style={[styles.tabBar, {
      paddingBottom: insets.bottom || 12,
      backgroundColor: colors.TAB_BAR_BG,
      borderTopColor: colors.TAB_BORDER,
    }]}>
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={({ pressed }) => [styles.tabItem, pressed && { opacity: 0.6 }]}
          >
            <Ionicons
              name={isFocused ? tab.activeIcon : tab.icon}
              size={22}
              color={isFocused ? colors.ACCENT : colors.INACTIVE}
            />
            <Text style={[styles.tabLabel, { color: isFocused ? colors.ACCENT : colors.INACTIVE }]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const { colors } = useTheme();

  // "/" maps to this group, so on a cold start it can render before the root
  // redirect sends a signed-out user away. Hold a neutral screen until the
  // session is confirmed so tab content never flashes.
  if (!isLoaded || !isSignedIn) {
    return <View style={{ flex: 1, backgroundColor: colors.BG }} />;
  }

  // Register so the Header avatar can trigger the same drawer.
  openSettingsDrawerRef.current = () => setDrawerOpen(true);

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="settings" />
      </Tabs>
      <SettingsDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 10,
    alignItems: 'flex-end',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
