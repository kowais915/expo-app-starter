import { useState } from 'react';
import { useKeyboardHeight } from '@/lib/useKeyboard';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSignUp } from '@clerk/clerk-expo';
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

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const keyboardHeight = useKeyboardHeight();

  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  const handleSignUp = async () => {
    if (!isLoaded || loading) return;
    setError('');
    setLoading(true);
    try {
      const result = await signUp.create({
        firstName: firstName.trim(),
        emailAddress: email.trim(),
        password,
      });
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
      } else if (result.status === 'missing_requirements') {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        router.push('/(auth)/verify');
      } else {
        setError('Unable to complete sign-up. Please try again.');
      }
    } catch (err: any) {
      setError(err?.errors?.[0]?.message || 'Unable to create account.');
    } finally {
      setLoading(false);
    }
  };

  const inputWrapper = (field: string) => [
    styles.inputWrapper,
    focused === field && styles.inputWrapperFocused,
  ];
  const iconColor = (field: string) => (focused === field ? ORANGE : TEXT_MUTED);

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
              <Logo size={80} />
              <Text style={styles.logoLabel}>{(Constants.expoConfig?.name ?? 'App').toUpperCase()}</Text>
            </View>

            {/* Heading */}
            <View style={styles.headingBlock}>
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={ERROR_COLOR} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>FULL NAME</Text>
                <View style={inputWrapper('name')}>
                  <Ionicons name="person-outline" size={18} color={iconColor('name')} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your full name"
                    placeholderTextColor={TEXT_MUTED}
                    value={firstName}
                    onChangeText={setFirstName}
                    onFocus={() => setFocused('name')}
                    onBlur={() => setFocused(null)}
                    autoCapitalize="words"
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>EMAIL ADDRESS</Text>
                <View style={inputWrapper('email')}>
                  <Ionicons name="mail-outline" size={18} color={iconColor('email')} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your email"
                    placeholderTextColor={TEXT_MUTED}
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType="next"
                  />
                </View>
              </View>

              <View style={styles.fieldGroup}>
                <Text style={styles.label}>PASSWORD</Text>
                <View style={inputWrapper('password')}>
                  <Ionicons name="lock-closed-outline" size={18} color={iconColor('password')} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Create a password"
                    placeholderTextColor={TEXT_MUTED}
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    returnKeyType="done"
                    onSubmitEditing={handleSignUp}
                  />
                  <Pressable onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={TEXT_MUTED} />
                  </Pressable>
                </View>
                <Text style={styles.hint}>Minimum 8 characters</Text>
              </View>

              <Pressable
                style={({ pressed }) => [styles.signUpBtn, pressed && { opacity: 0.85 }, loading && { opacity: 0.6 }]}
                onPress={handleSignUp}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color="#FFFFFF" size="small" />
                  : <Text style={styles.signUpBtnText}>CREATE ACCOUNT</Text>
                }
              </Pressable>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <Link href="/(auth)/sign-in" asChild>
                <Pressable><Text style={styles.footerLink}>Sign in</Text></Pressable>
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
  hint: { color: TEXT_MUTED, fontSize: 11, marginTop: -2 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: INPUT_BG, borderRadius: 14,
    borderWidth: 1, borderColor: BORDER,
  },
  inputWrapperFocused: { borderColor: BORDER_FOCUS, backgroundColor: INPUT_FOCUS_BG },
  inputIcon: { paddingLeft: 16, paddingRight: 4 },
  input: { flex: 1, color: TEXT_PRIMARY, fontSize: 15, paddingVertical: 16, paddingRight: 16 },
  eyeBtn: { paddingHorizontal: 16, paddingVertical: 16 },
  signUpBtn: {
    backgroundColor: ORANGE, borderRadius: 14,
    paddingVertical: 18, alignItems: 'center',
    marginTop: 4,
  },
  signUpBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800', letterSpacing: 1.5 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { color: TEXT_SECONDARY, fontSize: 14 },
  footerLink: { color: ORANGE, fontSize: 14, fontWeight: '700' },
});
