# Scranly

A free, invite-only food and calorie tracker for iOS and Android. No adverts, no subscription.
React Native (bare CLI) + TypeScript. Product spec: `docs/PRD.md`.

## Agent skills

### Issue tracker

Issues live as GitHub issues on `kyeltech/Scranly_app`, driven by the `gh` CLI.
See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical roles, each label named after itself. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root, created lazily by `domain-modeling`
as terms and decisions are actually resolved. See `docs/agents/domain.md`.

## Working rules

- **Architectural decisions are Kyel's.** Surface the options and what each costs; do not pick one.
- **Flag every third-party dependency before installing it** — what it is, why it is needed, what it costs.
- **Vertical slices only.** One seam, one failing test, the minimal code to pass it. Never all tests first.
- **Confirm the seams before writing any test** (`tdd` skill). No test at an unconfirmed seam.
- Every slice ships with unit tests. End-to-end flows are covered once there is a flow worth walking.
- **No network calls yet.** The app runs on dynamic mocks until the data layer is chosen.

## Decisions so far

| Area | Choice |
| --- | --- |
| Framework | React Native 0.87, bare CLI (not Expo), TypeScript |
| Theming | `src/theme.ts` — light and dark palettes read through `useTheme()`, follows the device setting |
| Typeface | Archivo, bundled and linked into both native projects |
| Vector drawing | `react-native-svg` |
| Unit tests | Jest + `@testing-library/react-native` |
| End-to-end | Maestro, run on the Mac — a cloud session has no simulator |
| Navigation | React Navigation, native stack, no tab bar — see `docs/adr/0002-navigation.md` |
| Vector drawing | `react-native-svg` (the ring, the trend chart) |
| Camera | **Not chosen.** `src/components/CameraStub.tsx` stands in; everything layered over it is real |
| Data | Dynamic mocks in `src/fixtures/`. Persistence not yet chosen |

## Testing gotchas that cost an hour each

`@testing-library/react-native` 14 is async throughout, and the failures it gives are misleading:

- **`render()` returns a promise.** Without `await`, `screen` is empty and the error reads
  "render function has not been called", which points nowhere near the cause.
- **`fireEvent.press()` and `fireEvent.changeText()` return promises too.** Without `await`, the
  state update has not landed on the next line — and once one test fails this way, every later
  test in the file fails to find anything.
- It needs a peer package called `test-renderer`, which is not installed automatically.
- React Navigation and `react-native-screens` ship untranspiled ES modules, so they are listed in
  `transformIgnorePatterns` in `jest.config.js`. Adding another such library means adding it there.

## Where things run

`jest`, `tsc` and `eslint` run anywhere. The app and the Maestro suite need a simulator, so they run
on the Mac only — a cloud session cannot verify them.

## Commands

```sh
npm test              # jest
npm run lint          # eslint
npx tsc --noEmit      # typecheck
npm run ios           # needs Xcode; cd ios && pod install first after a native dep
```
