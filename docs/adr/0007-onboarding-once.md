# ADR-0007: Doing onboarding once

- **Status:** OPEN — the local half is recommended and unbuilt; the cross-install half needs a decision.
- **Raised by:** Kyel, 8 October 2026

## The symptom

Onboarding runs on every launch.

## The cause, which is not onboarding

There is no persistence in the app at all. `grep` for AsyncStorage, MMKV,
SecureStore or Keychain returns nothing. `Root` hardcodes
`initialRoute = 'Welcome'` and holds the profile and goal in `useState`, so
every launch is a cold boot from the fixture.

Onboarding is not repeating. The app has no memory, and onboarding is simply
the first thing it does.

## Two problems wearing one coat

**1. Reopening the app.** The real irritation, and entirely solvable on-device.

**2. Reinstalling the app.** A different problem with a different answer, and
the one that cannot be solved properly without an account.

## 1. Reopening — persist locally, gate on a flag

Save the profile, the goal and a `hasOnboarded` flag; read them before the
first render; send a returning user to Today.

| | |
| --- | --- |
| **AsyncStorage** | The default. Asynchronous, so the first frame has to handle "not loaded yet" — a splash already covers that. |
| **MMKV** | Faster and synchronous, so the route is known before anything draws. A heavier native dependency. |

Either is a third-party install. The choice is Kyel's; the flag matters more
than the store.

**What persisting the profile does NOT mean.** A returning user should still be
asked to weigh in. The weight is a reading, not a setting, and ADR-0001's
targets follow from it.

## 2. Reinstalling — what each platform actually offers

Checked October 2026, because this behaviour has changed before.

| Platform | Mechanism | Standing |
| --- | --- | --- |
| iOS | Keychain | Survives deletion today, but **undocumented**. Apple tried to auto-delete keychain items in the iOS 10.3 beta and reverted after developer pushback. Expo has an open issue noting their own docs contradict the behaviour. |
| Android | Block Store | **Supported and documented** for exactly this. Needs Play Services and the user's backup turned on. |

So iOS offers an undocumented accident and Android offers a real API. There is
no symmetric answer, and on both a user who clears data or turns backup off
defeats it. Building the onboarding gate on the iOS keychain means resting it
on behaviour Apple has never promised and has already tried to remove once.

## Three reasons "never again, ever" is the wrong target

1. **A stale profile is worse than a question.** Someone reinstalling after a
   year has a different weight and probably a different goal. Re-asking is
   correct, not a failure.
2. **Phones change hands.** Device-level persistence hands a stranger's targets
   to the next owner of a hand-me-down phone.
3. **It contradicts a promise already on screen.** About you says data never
   leaves the phone. Anything that survives a wipe lives off-device — Block
   Store, iCloud or our own server — and that sentence then has to say what
   goes and what does not. A trust cost, not a footnote.

## Recommendation

Build the local half now: it fixes the actual complaint and commits to nothing.

Leave the cross-install half until invites and accounts, which the >20-user gate
needs anyway. Identity then carries the profile across reinstalls as a side
effect of something already being built — no keychain trick, no broken promise,
and it works on both platforms the same way.

## Not decided here

Which store. Whether a returning user is asked to weigh in (recommended: yes).
What Settings offers for starting again — there is no board for it, and a
destructive action with no way back is its own design problem.

## Sources

- Expo issue 40662, iOS Keychain data persisting after uninstall:
  https://github.com/expo/expo/issues/40662
- Apple Developer Forums, iOS 10.3 beta 2 keychain auto-delete and its reversal:
  https://developer.apple.com/forums/thread/72271
- Android Block Store: https://developer.android.com/identity/block-store
