/**
 * Test environment shims.
 *
 * Every mock here exists because a native module has no JS implementation
 * under Node. Without them the failure is confusing — a screen throws deep
 * inside a library rather than failing on the thing you're testing.
 */

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

/**
 * Safe-area insets come from a native module, so ANY component calling
 * `useSafeAreaInsets()` throws outside a provider. Mocking here rather than
 * wrapping each test keeps tests about behaviour rather than scaffolding.
 * (The library ships its own mock, but as untranspiled .tsx that the default
 * transformIgnorePatterns don't cover.)
 */
jest.mock('react-native-safe-area-context', () => {
  const insets = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 390, height: 844 };
  const { View } = require('react-native');
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: View,
    SafeAreaInsetsContext: { Consumer: ({ children }) => children(insets) },
    useSafeAreaInsets: () => insets,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets, frame },
  };
});

/** Secure Store is native; back it with an in-memory map. */
jest.mock('expo-secure-store', () => {
  const store = new Map();
  return {
    getItemAsync: jest.fn(async (k) => (store.has(k) ? store.get(k) : null)),
    setItemAsync: jest.fn(async (k, v) => void store.set(k, v)),
    deleteItemAsync: jest.fn(async (k) => void store.delete(k)),
  };
});

/**
 * Clerk, stubbed as signed-out by default.
 *
 * Override per-file with `jest.mock('@clerk/clerk-expo', ...)` when a test
 * needs a signed-in user.
 */
jest.mock('@clerk/clerk-expo', () => ({
  ClerkProvider: ({ children }) => children,
  useAuth: () => ({ isLoaded: true, isSignedIn: false, userId: null, signOut: jest.fn() }),
  useUser: () => ({ user: null, isLoaded: true }),
  useSignIn: () => ({ isLoaded: true, signIn: { create: jest.fn() }, setActive: jest.fn() }),
  useSignUp: () => ({ isLoaded: true, signUp: { create: jest.fn() }, setActive: jest.fn() }),
}));

/*
 * Deliberately NOT enabling fake timers globally: providers that hydrate from
 * storage on mount need real timers for `waitFor` to observe them. Opt in per
 * test where you need them.
 */
