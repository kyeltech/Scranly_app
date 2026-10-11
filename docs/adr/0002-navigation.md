# ADR-0002: Navigation without a tab bar

- **Status:** accepted
- **Date:** 2026-09-25

## Context

Scranly has seven destinations: Today, Add food, Scan, Weight, Weigh-in, History and
Settings. A tab bar is the obvious answer and it costs the wrong thing: it takes the bottom
56pt, which is exactly where Scan and Log food sit — the two buttons that made the ring layout
worth choosing. Logging happens several times a day; navigating happens rarely.

## Decision

**No tab bar.** The bottom bar stays with Scan and Log food. Today's header carries navigation:
the date opens the month, the Week chip opens Weight, the gear opens Settings.

**History is not a screen.** It is Today on another day, reached by tapping the date or swiping
sideways, which is why it needs no chrome of its own.

**React Navigation, native stack.** One `Stack.Navigator`, headers off — every screen draws its
own, because the headers are doing navigation work rather than just titling. Add food is a modal;
Scan and the portion editor are full-screen modals.

## Consequences

- Four jobs is the most Today's header can carry. A fifth destination forces this decision open
  again.
- Three native dependencies: `@react-navigation/native`, `@react-navigation/native-stack` and
  `react-native-screens`. The last needs `pod install`.
- Nothing is discoverable by looking at a tab bar, so the header controls have to stay obvious.
  Worth watching the first time someone other than Kyel uses it.

## Amendment, 8 October 2026: setup is one route, not five

- **Raised by:** Kyel

Setup was five stack routes — `Welcome`, `AboutYou`, `Goal`, `Method`, `Targets` — so every
question was a push. That is wrong twice over. It slides between the four parts of one form,
which reads as four screens rather than one job; and it puts the back gesture in charge of a
form, so a swipe can leave you half way out of something you were filling in.

**Setup is one screen.** `Onboarding` holds the answers so far and which face is showing, and a
`switch` picks the body. The five step components stay as they were — they own their own fields
and their own chrome; what moved up is only what has to outlive a step.

The route takes a `step` parameter, because the weight trend's *Change the goal* has to open
setup at the goal rather than at the first question. Back on the face setup opened at leaves the
way it came in, so *Change the goal* returns to the weight trend and does not walk backwards
through questions nobody asked.

### Consequences

- The step order lives in one `STEPS` array. Adding a question is an entry in it and a `case`.
- Nothing animates between steps, which is the point.
- `RootParams` lost five names and gained one. Anything that wants a particular question asks
  for it by `step`, not by route.
