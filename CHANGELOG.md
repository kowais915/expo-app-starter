# Changelog

All notable changes to this template are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and versions follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Already using this template?** You can't `git pull` a repo you've diverged
> from, so each release links a **compare view** showing exactly what changed.
> Use it to cherry-pick the bits you want. Every entry names the *symptom*, so
> you can tell at a glance whether it affects you.

## [Unreleased]

### Added

- **CI.** `.github/workflows/ci.yml` runs `npm ci`, `npm run typecheck` and
  `npm test` on every push and pull request.

### Fixed

- **`eas build` failed on a fresh clone.** `app.json` carried the original
  author's `owner` field, pointing EAS at an Expo organization you aren't a
  member of. Removed — add your own (see the README's rebranding section). The
  bundle identifier and Android package are now the neutral
  `com.example.expostarter`, which you must change before building anyway.

---

## [1.1.0] — 2026-07-19

### Fixed

- **Grey/blank screen after sign-in, sign-up, or email verification.** The auth
  screens called `router.replace('/(tabs)')` immediately after `setActive()`,
  racing the route guard in `app/_layout.tsx`. Two redirects fired for one state
  change and the loser could leave the app stuck on the splash cover until it was
  force-quit. The guard is now the single owner of post-auth navigation.
- **App could hang on the splash cover indefinitely.** If a redirect never
  landed, `settled` stayed false forever. A 4-second failsafe now drops the cover
  and re-asserts the destination, so a transient auth state can't look like a
  frozen app.
- **Submit buttons hidden behind the keyboard on Android.** All three auth
  screens relied on `automaticallyAdjustKeyboardInsets`, which is iOS-only —
  and `KeyboardAvoidingView` has no working Android `behavior` under
  edge-to-edge either. Screens now reserve the measured keyboard height.

### Added

- **Test harness.** Jest + React Native Testing Library, preconfigured with
  mocks for the native modules that otherwise throw under Node (safe-area,
  Secure Store, AsyncStorage, Clerk). `npm test` works immediately.
  Versions are pinned deliberately — see the note in `jest.config.js`.
- **`lib/useKeyboard.ts`** — `useKeyboardHeight()`, a cross-platform keyboard
  height hook.
- **`lib/shadow.ts`** — `softShadow()`, plus documentation of the Android
  `elevation`-without-`backgroundColor` trap that renders a hard dark rectangle
  ignoring `borderRadius`.
- **`npm run typecheck`** script.

### Upgrading from 1.0.0

Nothing here is required — the template still runs unchanged. Take these if the
symptom sounds familiar:

- **Auth navigation** — copy `app/(auth)/sign-in.tsx`, `sign-up.tsx`,
  `verify.tsx` and `app/_layout.tsx` together. They're one change: the screens
  stop navigating and the guard takes over. Taking only some leaves you with
  either no redirect or the same race. If you added your own screens that
  navigate after `setActive`, remove that navigation too.
- **Keyboard** — add `lib/useKeyboard.ts`, then pad any scroll view holding a
  submit button by `useKeyboardHeight()`.
- **Shadows** — add `lib/shadow.ts`. Then `grep -rn "elevation" app/ components/`
  and check each hit sits on a view with its own `backgroundColor`.
- **Tests** — copy `jest.config.js`, `jest.setup.js`, and the `devDependencies`
  and scripts from `package.json`. Match `jest-expo` to your Expo SDK major.

---

## [1.0.0] — Initial release

### Added

- Full Clerk auth flow: sign in, sign up, email verification, auth-gated tabs.
- Supabase via Clerk's native integration, with a stable authenticated client.
- One-knob theming: dark/light, persisted, driven by a single `ACCENT`.
- Expo Router navigation, custom tab bar, swipe-to-dismiss settings drawer.
- No token-refresh flash — the Supabase client is created once and reads the
  latest token via a ref.
- No cold-start flash — a splash cover holds until the session resolves and the
  visible route matches.

[Unreleased]: https://github.com/kowais915/expo-app-starter/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/kowais915/expo-app-starter/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/kowais915/expo-app-starter/releases/tag/v1.0.0
