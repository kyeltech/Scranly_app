# ADR-0005: One shared stylesheet, and what stays out of it

- **Status:** accepted
- **Decided by:** Kyel, 5 October 2026

## The decision

Every component's arrangement — boxes, gaps, sizes, fixed dimensions off a
board — moves out of the component and into `src/styles.ts`, one export per
surface. Colour and type stay in `src/theme.ts`.

Components import their own namespace aliased, so call sites are unchanged:

```ts
import {today as styles} from '../styles';
```

## How it was before, and why that was questioned

Styles lived in a `StyleSheet.create` at the foot of each component: 373 keys
across 23 files. That is the React Native default, and it was never put to Kyel
as a decision — it was taken by habit, which is the part that needed correcting
regardless of which way the decision went.

The defence of the old arrangement was real: React Native has no cascade, so a
shared stylesheet buys none of what a global CSS file buys. Each component must
still name every style it uses. What moving them does buy is one place to read
the app's spacing and sizing at once — and the drift below was only visible
once they were in one file.

## What the move exposed

Counted across the whole app:

| | |
| --- | --- |
| Raw spacing values in stylesheets | 243 |
| Uses of the `spacing` scale | 48 |
| Share of spacing values sitting on the declared scale | about a quarter |
| Colour literals outside `theme.ts` | 23 |

The raw values cluster on a 2px rhythm — 6, 8, 10, 12, 14, 16, 18, 20, 22 —
which is what the boards specify. The declared scale is `{4, 8, 16, 24, 40}`.

## Consequences

**`spacing` is documented as what it is, not promoted to a grid.** Snapping 18
to 16 would change the design, and the boards are the specification. The scale
keeps the values that genuinely recur app-wide — chiefly the side gutter — and
its comment now says plainly that most spacing lives off it, on purpose. The
alternative was deleting it, which would have turned 48 correct usages into
literals and gained nothing.

**Three colour literals became tokens:** the viewfinder's failed-frame red and
hint text (now `camera.frameFailed` and `camera.hint`), and a lime dot that was
`brand.lime` spelled out. The remaining 20 are all in `subjects.tsx` and stay
literal: they are drawings of a barcode, a plate and a printed label, and a
photograph does not invert in dark mode.

**New work prefers `gap` to `marginTop`.** The app currently has 100 margin
declarations against 75 gaps; margins collapse and double in ways gaps do not.
The existing margins were NOT bulk-converted — that is a visual change across 23
surfaces that no test here can catch, and a silent layout regression is worse
than an inconsistent idiom. Convert a screen when it is open for another reason
and someone can look at it.

## What this does not settle

Whether the per-surface namespaces should eventually become a shared layout
vocabulary (`row`, `stack`, `fill`) is open. At 23 surfaces the duplication is
not yet painful enough to justify the indirection.
