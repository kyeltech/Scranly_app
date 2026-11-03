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

Decisions live in `docs/adr/`, numbered and dated, written when a decision is actually made rather
than in advance. A decision that changes later gets an **amendment appended to its own ADR** — the
original reasoning stays readable, because why it was right then is part of why it changed. See
`docs/agents/domain.md`.

## Working rules

- **Architectural decisions are Kyel's.** Surface the options and what each costs; do not pick one.
- **Flag every third-party dependency before installing it** — what it is, why it is needed, what it costs.
- **Vertical slices only.** One seam, one failing test, the minimal code to pass it. Never all tests first.
- **Confirm the seams before writing any test** (`tdd` skill). No test at an unconfirmed seam.
- Every slice ships with unit tests. End-to-end flows are covered once there is a flow worth walking.
- **No network calls yet.** The food database runs on mocks until ADR-0010 is decided.
- **Do not commit.** Leave it to Kyel, and list what is uncommitted at the end of each chunk.
- **Light and dark, happy and unhappy.** Both themes, and the path where the read fails or the form
  is empty, not only the one where it works.
- Follow the design unless Kyel has said otherwise. The approved boards are the fixtures in
  `src/fixtures/`; `design/` holds the brand files.

## Decisions so far

| Area | Choice |
| --- | --- |
| Framework | React Native 0.87, bare CLI (not Expo), TypeScript |
| Theming | `src/theme.ts` — light and dark palettes read through `useTheme()`, follows the device setting |
| Typeface | Archivo, bundled and linked into both native projects |
| Vector drawing | `react-native-svg` (the ring, the trend chart, every icon) |
| Unit tests | Jest + `@testing-library/react-native` |
| End-to-end | Maestro, run on the Mac — a cloud session has no simulator. Flows in `.maestro/` |
| Navigation | React Navigation, native stack, no tab bar — `docs/adr/0002-navigation.md` |
| Camera | `react-native-vision-camera`. One screen, three readers — `docs/adr/0003` |
| Reading a label | `@react-native-ml-kit/text-recognition`, on device. Parsing is in `src/readers/label.ts` and owes nothing to the OCR library |
| Reading a plate | **Not chosen.** `docs/adr/0009-plate-reader.md` is open |
| Persistence | MMKV (`react-native-mmkv`, built on Nitro) — `docs/adr/0007-onboarding-once.md`. Three stores behind one opener: setup, diary, created foods |
| Where the data lives | **Not chosen.** `docs/adr/0010-where-the-data-lives.md` is open: the food database, the API and accounts all wait on it |
| The food database | Mocks in `src/fixtures/foods.ts`. What you log and what you create are real and on disk |

## Testing gotchas that cost an hour each

`@testing-library/react-native` 14 is async throughout, and the failures it gives are misleading:

- **`render()` returns a promise.** Without `await`, `screen` is empty and the error reads
  "render function has not been called", which points nowhere near the cause.
- **`fireEvent.press()` and `fireEvent.changeText()` return promises too.** Without `await`, the
  state update has not landed on the next line — and once one test fails this way, every later
  test in the file fails to find anything.
- **Never `await waitFor(async () => …)`.** The async callback leaves a promise running past the end
  of the test and poisons the next one. Wait on the screen, then read the store once.
- **The render result has `root`, not `UNSAFE_root`,** and `UNSAFE_getAllByType` is gone. To assert a
  prop that has no visible effect, walk `view.toJSON()`.
- It needs a peer package called `test-renderer`, which is not installed automatically.
- React Navigation and `react-native-screens` ship untranspiled ES modules, so they are listed in
  `transformIgnorePatterns` in `jest.config.js`. Adding another such library means adding it there.

## Native gotchas that cost a day each

- **MMKV 4 is `createMMKV({id})`,** not `new MMKV()`. It is built on Nitro, and Nitro's generated C++
  is version-coupled, so the pinned `react-native-nitro-modules` and what MMKV expects have to agree.
- **A missing pod used to fail silently.** `src/store/mmkv.ts` now reports why it could not open
  (`storeFailure()`), a dev-only strip shows it, and a write to a store that is not there is rejected
  rather than swallowed. The first version hid a missing pod for an entire build.
- **The iOS simulator cannot run this app.** ML Kit ships fat frameworks with no arm64-simulator
  slice, so CocoaPods writes `EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64` into
  `Pods-Scranly.debug.xcconfig` and an Apple-silicon simulator has nothing to run. **Build to a
  device from Xcode.** This is why there are no simulators in the scheme list; nothing is broken.

## Where things run

`jest`, `tsc` and `eslint` run anywhere. The app and the Maestro suite need real hardware (see
above), so they run from the Mac only — a cloud session cannot verify them, and should say so
rather than implying a flow was walked.

## Commands

```sh
npm test              # jest
npm run lint          # eslint
npx tsc --noEmit      # typecheck
npm run ios:install   # cd ios && pod install — after any native dependency
npm run ios           # needs Xcode; a device, not a simulator
maestro test .maestro # end-to-end, on the Mac, against a running app
```
