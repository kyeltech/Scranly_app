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
