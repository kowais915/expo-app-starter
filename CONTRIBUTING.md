# Contributing to Expo App Starter

Thanks for taking the time to contribute! This project is a starter template, so the bar for changes is a little different from a typical app: everything should stay **general, minimal, and easy for someone to mold into their own app**. Please keep that in mind.

## Ways to contribute

- 🐛 **Report bugs** — open an issue with clear steps to reproduce, your Expo/OS versions, and what you expected.
- 💡 **Suggest improvements** — open an issue describing the idea and why it belongs in a *general* template (not a specific app's feature).
- 🔧 **Send a pull request** — fix a bug, improve docs, or add a broadly-useful piece of scaffolding.

## Guiding principles

Before adding something, ask: _would most apps built from this template want it?_ If it's niche, it probably belongs in a fork, not here.

- **Stay generic.** No app-specific screens, branding, or business logic. Placeholder content only.
- **Keep it minimal.** Prefer zero new dependencies. Every dependency is a maintenance cost for everyone who clones this.
- **One source of truth.** Colors go through the `ACCENT` knob and the theme palette; the app name comes from `app.json`. Don't hardcode.
- **Don't break the hardened bits.** The Supabase client stability fix, the auth-flash guard, and the redirect logic exist for good reasons — see the code comments before changing them.
- **TypeScript clean.** `npx tsc --noEmit` must pass with no errors.

## Development setup

```bash
npm install
cp .env.example .env.local   # add your own Clerk + Supabase test keys
npx expo start
```

You'll need your own free Clerk instance and Supabase project to run auth end to end.

## Pull request checklist

- [ ] `npx tsc --noEmit` passes.
- [ ] No new dependencies (or a clear justification in the PR description).
- [ ] No app-specific content, branding, or hardcoded colors/names.
- [ ] Docs updated (README / comments) if behavior or setup changed.
- [ ] The change is described clearly, with screenshots for any UI.

## Commit & PR style

- Keep commits focused and messages descriptive (e.g. `fix: prevent tab flash on cold start`).
- Reference the issue you're addressing where relevant.
- Small, reviewable PRs get merged faster than large ones.

## Code of conduct

Be respectful and constructive. We're all here to make a better starting point for everyone.

---

Not sure whether an idea fits? Open an issue first and let's discuss — that's always welcome.
