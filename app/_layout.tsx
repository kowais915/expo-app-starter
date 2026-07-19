import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache } from '@/lib/token-cache';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { ThemeProvider, useTheme } from '@/lib/theme';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

/** How long the splash cover may stay up before we assume something went wrong. */
const STALL_TIMEOUT_MS = 4000;

function InitialLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { isDark, colors } = useTheme();

  const inAuthGroup = segments[0] === '(auth)';

  /*
   * The ONLY place that decides where a signed-in user belongs.
   *
   * Auth screens deliberately don't navigate after `setActive` — two redirects
   * racing on one state change is how users end up stranded on the cover below.
   */
  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!isSignedIn && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    }
  }, [isSignedIn, isLoaded, inAuthGroup]);

  // Keep a splash cover on top until Clerk has resolved AND the visible route
  // matches the auth state — otherwise a cold start briefly paints the wrong
  // screen (the "/" route maps to the tabs) before the redirect fires.
  const matched = isLoaded && (isSignedIn ? !inAuthGroup : inAuthGroup);

  /*
   * Failsafe: never let the cover strand someone.
   *
   * If a redirect doesn't land — a transient auth state, a navigation that
   * raced — the cover would otherwise stay up until the app is force-quit,
   * which reads as a frozen or broken app. After a few seconds, drop it and
   * re-assert the destination instead.
   */
  const [stalled, setStalled] = useState(false);
  useEffect(() => {
    if (matched) {
      setStalled(false);
      return;
    }
    const t = setTimeout(() => setStalled(true), STALL_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [matched]);

  useEffect(() => {
    if (!stalled || !isLoaded) return;
    router.replace(isSignedIn ? '/(tabs)' : '/(auth)/sign-in');
  }, [stalled]);

  const settled = matched || stalled;

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      {!settled && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.BG,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={colors.ACCENT} />
        </View>
      )}
    </>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ThemeProvider>
        <InitialLayout />
      </ThemeProvider>
    </ClerkProvider>
  );
}
