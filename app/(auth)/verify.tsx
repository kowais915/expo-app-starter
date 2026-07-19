import { useState } from 'react';
import { useKeyboardHeight } from '@/lib/useKeyboard';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Logo } from '@/components/Logo';
import { ACCENT, withAlpha } from '@/lib/theme';

const ORANGE = ACCENT;
const BORDER = 'rgba(255,255,255,0.12)';
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = 'rgba(255,255,255,0.55)';
const TEXT_MUTED = 'rgba(255,255,255,0.35)';
const INPUT_BG = 'rgba(255,255,255,0.07)';
const INPUT_FOCUS_BG = withAlpha(ACCENT, 0.10);
const ERROR_BG = 'rgba(255,60,60,0.12)';
const ERROR_COLOR = '#FF5555';

export default function VerifyScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const keyboardHeight = useKeyboardHeight();

  const [code, setCode] = useState('');
  const [focused, setFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!isLoaded || loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
      /*
       * Deliberately no router.replace here.
       *
       * `setActive` flips Clerk's isSignedIn, and the route guard in
       * app/_layout.tsx redirects on that. Navigating here as well races the
       * guard: two redirects fire for one state change, and the loser can
       * leave the app on the splash cover until it's force-quit. Let the guard
       * own every post-auth navigation — it's the single place that knows
       * where a signed-in user belongs.
       */
        await setActive({ session: result.createdSessionId });
        return; // screen unmounts; leave the button in its loading state
      }
      setError('Verification incomplete. Please try again.');
      setLoading(false);
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Invalid or expired code.');
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!isLoaded || resending) return;
    setResending(true);
    setError('');
    try {
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Unable to resend code.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.bg}>
      <View style={styles.glow} pointerEvents="none" />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <ScrollView
            contentContainerStyle={[
              styles.container,
              /*
               * Reserve the keyboard's height so the submit button stays
               * reachable. `automaticallyAdjustKeyboardInsets` is iOS-only and
               * KeyboardAvoidingView has no working Android behavior under
               * edge-to-edge — see lib/useKeyboard.ts.
               */
              keyboardHeight > 0 && {
                justifyContent: 'flex-start',
                paddingBottom: keyboardHeight + 24,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoBlock}>
              <Logo size={72} />
              <Text style={styles.logoLabel}>{(Constants.expoConfig?.name ?? 'App').toUpperCase()}</Text>
            </View>

            {/* Icon */}
            <View style={styles.iconBlock}>
              <View style={styles.iconCircle}>
                <Ionicons name="mail-open-outline" size={36} color={ORANGE} />
              </View>
            </View>

            {/* Heading */}
            <View style={styles.headingBlock}>
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a 6-digit verification code to your email address. Enter it below to continue.
              </Text>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={ERROR_COLOR} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>VERIFICATION CODE</Text>
                <View style={[styles.inputWrapper, focused && styles.inputWrapperFocused]}>
                  <Ionicons
                    name="key-outline"
                    size={18}
                    color={focused ? ORANGE : TEXT_MUTED}
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter 6-digit code"
                    placeholderTextColor={TEXT_MUTED}
                    value={code}
                    onChangeText={setCode}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    keyboardType="number-pad"
                    maxLength={6}
                    returnKeyType="done"
                    onSubmitEditing={handleVerify}
                  />
                </View>
              </View>

              <Pressable
                style={({ pressed }) => [styles.verifyBtn, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
                onPress={handleVerify}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.verifyBtnText}>VERIFY EMAIL</Text>
                }
              </Pressable>
            </View>

            <View style={styles.resendRow}>
              <Text style={styles.footerText}>Didn't receive the code? </Text>
              <Pressable onPress={handleResend} disabled={resending}>
                <Text style={[styles.footerLink, resending && { opacity: 0.5 }]}>
                  {resending ? 'Sending…' : 'Resend'}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: '#0B0B12' },
  glow: { position: 'absolute', top: -130, right: -100, width: 340, height: 340, borderRadius: 170, backgroundColor: withAlpha(ACCENT, 0.2) },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 48,
    gap: 28,
  },
  logoBlock: { alignItems: 'center', gap: 10 },
  logoLabel: { color: ORANGE, fontSize: 16, fontWeight: '800', letterSpacing: 4 },
  iconBlock: { alignItems: 'center' },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: withAlpha(ACCENT, 0.12),
    borderWidth: 1.5,
    borderColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headingBlock: { gap: 10 },
  title: { color: TEXT_PRIMARY, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: TEXT_SECONDARY, fontSize: 14, lineHeight: 22 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ERROR_BG, borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: 'rgba(255,60,60,0.25)',
  },
  errorText: { color: ERROR_COLOR, fontSize: 13, flex: 1 },
  form: { gap: 18 },
  fieldGroup: { gap: 8 },
  label: { color: TEXT_MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: INPUT_BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  inputWrapperFocused: { borderColor: ORANGE, backgroundColor: INPUT_FOCUS_BG },
  inputIcon: { paddingLeft: 16, paddingRight: 4 },
  input: {
    flex: 1, color: TEXT_PRIMARY,
    fontSize: 22, fontWeight: '700', letterSpacing: 8,
    paddingVertical: 16, paddingRight: 16,
    fontVariant: ['tabular-nums'],
  },
  verifyBtn: {
    backgroundColor: ORANGE, borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
  },
  verifyBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  resendRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: TEXT_SECONDARY, fontSize: 14 },
  footerLink: { color: ORANGE, fontSize: 14, fontWeight: '700' },
});
