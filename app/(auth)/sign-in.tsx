import { useState } from 'react';
import { useKeyboardHeight } from '@/lib/useKeyboard';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignIn } from '@clerk/clerk-expo';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { Logo } from '@/components/Logo';
import { ACCENT, withAlpha } from '@/lib/theme';

const ORANGE = ACCENT;
const BORDER = 'rgba(255,255,255,0.12)';
const BORDER_FOCUS = ACCENT;
const TEXT_PRIMARY = '#FFFFFF';
const TEXT_SECONDARY = 'rgba(255,255,255,0.55)';
const TEXT_MUTED = 'rgba(255,255,255,0.35)';
const INPUT_BG = 'rgba(255,255,255,0.07)';
const INPUT_FOCUS_BG = withAlpha(ACCENT, 0.10);
const ERROR_BG = 'rgba(255,60,60,0.12)';
const ERROR_COLOR = '#FF5555';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const keyboardHeight = useKeyboardHeight();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded || loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await signIn.create({ identifier: email.trim(), password });
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
        return;
      } else {
        setError('Unable to complete sign-in. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
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
              <Logo size={88} />
              <Text style={styles.logoLabel}>{(Constants.expoConfig?.name ?? 'App').toUpperCase()}</Text>
            </View>

            {/* Heading */}
            <View style={styles.headingBlock}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>Sign in to your account to continue</Text>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={ERROR_COLOR} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                  <Ionicons name="mail-outline" size={18} color={emailFocused ? ORANGE : TEXT_MUTED} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={TEXT_MUTED}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                  <Ionicons name="lock-closed-outline" size={18} color={passwordFocused ? ORANGE : TEXT_MUTED} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Enter your password"
                    placeholderTextColor={TEXT_MUTED}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSignIn}
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={TEXT_MUTED} />
                  </Pressable>
                </View>
              </View>

              <Pressable style={styles.forgotBtn}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              <Pressable
                style={({ pressed }) => [styles.signInBtn, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
                onPress={handleSignIn}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.signInBtnText}>SIGN IN</Text>
                }
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Don't have an account? </Text>
              <Link href="/(auth)/sign-up" asChild>
                <Pressable><Text style={styles.footerLink}>Create account</Text></Pressable>
              </Link>
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
  headingBlock: { gap: 6 },
  title: { color: TEXT_PRIMARY, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { color: TEXT_SECONDARY, fontSize: 14 },
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
  inputWrapperFocused: { borderColor: BORDER_FOCUS, backgroundColor: INPUT_FOCUS_BG },
  inputIcon: { paddingLeft: 16, paddingRight: 4 },
  input: { flex: 1, color: TEXT_PRIMARY, fontSize: 15, paddingVertical: 16, paddingRight: 16 },
  eyeBtn: { paddingHorizontal: 16, paddingVertical: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginTop: -6 },
  forgotText: { color: ORANGE, fontSize: 13, fontWeight: '600' },
  signInBtn: {
    backgroundColor: ORANGE, borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
    marginTop: 4,
  },
  signInBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: TEXT_SECONDARY, fontSize: 14 },
  footerLink: { color: ORANGE, fontSize: 14, fontWeight: '700' },
});
