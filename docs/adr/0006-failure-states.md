# ADR-0006: What the app says when something fails

- **Status:** OPEN — options only. To be decided when API work starts; see
  [ADR-0010](0010-where-the-data-lives.md), which is where that work is being scoped.
- **Raised by:** Kyel, 5 October 2026

## Why this exists now

There is no network code in the app at all — `grep` for `fetch`, `axios` or
`XMLHttpRequest` returns nothing. Every failure the app can currently have is
local, and every one of them is designed. The moment a real lookup goes over the
wire, a whole class of failure arrives that no board covers: no connection, a
timeout, a 500, a rate limit, a response in a shape we did not expect.

This records the question before the first request is written, because the
answer shapes the data layer rather than being painted on afterwards.

## What the app already does on failure

Worth stating, because it sets a standard that any new error state has to meet.

| Failure | What the user sees |
| --- | --- |
| Barcode not in the database | "Not in the database", the code it read, and two ways on: add it from the label, or scan something else |
| Camera permission refused | Its own sheet, on the viewfinder's ground, with the option to type it in instead |
| A label photo too poor to read | Stays on the viewfinder: "Could not read that panel. Fill the frame with the table and tap to focus." |
| A label half-read | The rows it got, plus `unread` listing the lines it could not place |
| No camera in this build | The drawn stand-in, and a footnote saying which part is missing |

**None of them says "something went wrong".** Each says what happened and what
to do next. A generic error screen would be a step down from the standard the
boards already set, so the first question below is not "what should the
something-went-wrong screen look like" but "which failures deserve their own
state, and what catches the rest".

## What has no state at all

- **No connection / airplane mode.** The app is offline-first by nature today
  because nothing is online. The first remote call changes that.
- **Timeout.** A lookup that hangs. Related: the scanner's own "Looking up…"
  stage is currently a timer, so there is a spinner with nothing behind it.
- **Server error, rate limit, unexpected response shape.** Open Food Facts is
  free and community-run; it owes us nothing in uptime or schema stability.
- **A crash in render.** There is no error boundary anywhere in the tree. This
  is not hypothetical: a missing `pod install` took the whole app down with a
  white screen earlier in the build, because a static import of an absent native
  module threw during render. That was fixed at the import (`readers/native.ts`),
  but the general case is still unguarded.

## The questions

1. **Which failures get their own designed state, and which share a fallback?**
   The barcode lookup failing is not the same event as the app crashing, and the
   app's existing copy suggests they should not look the same.
2. **What does a failed lookup do to the scan flow?** The design already has
   "Not in the database" with two ways forward. Is a network failure a third
   variant of that sheet, or something else? It is recoverable in a way that
   "not in the database" is not — the answer may be there in a moment.
3. **Retry: automatic, manual, or both?** And if automatic, does the user see it
   happening? A silent retry that eventually fails is worse than a visible one.
4. **Does a cached answer count as an answer?** If a barcode was looked up
   before, serving it offline is better than failing — but it needs the
   persistence decision, which is also still open.
5. **What does the About you screen say?** It currently promises data never
   leaves the phone. A remote lookup makes that conditional, and the screen has
   to say precisely what goes and what does not. This is a copy change with a
   trust cost, not a footnote.

## The one thing worth doing regardless

**An error boundary.** Whatever is decided above, a render crash should not be a
white screen — it should be a screen that says the app hit a problem and offers
a way back. That is independent of the API work and does not depend on any of
the questions above being settled.

## Not decided here

Nothing. This is a list of what has to be answered, not an answer. The data
layer, persistence and the plate reader (ADR-0004) all touch it.

## Amendment — 3 November 2026: the barcode lookup's failures

With the first real lookup written (Open Food Facts, ADR-0010), questions 1–3
are answered for the barcode path. The rest of the list stands.

- **Q1 / Q2 — a failure to reach is its own state, not a variant of "Not in the
  database."** A miss and a can't-reach are different events: the food may well
  be there, so the way out is to try again, not to add it from the label. A new
  `CantReachSheet` says what happened (offline, or Open Food Facts busy — the
  429 rate limit included) and offers two ways on: try again, or type it in. It
  holds to the standard the boards set — it never says "something went wrong."
- **Q3 — retry is manual.** The sheet's "Try again" returns to aiming; there is
  no silent auto-retry, which this ADR already argued is worse than a visible
  one.
- **The error boundary is built.** `src/components/ErrorBoundary.tsx` wraps the
  app in `App.tsx`: a throw during render becomes a screen that says Scranly hit
  a problem and offers "Try again", rather than the blank screen a missing pod
  once caused. The one thing this ADR said was worth doing regardless is done.
- **Still open:** Q4 (a cached answer offline — waits on more of the persistence
  work) and Q5 (the About you copy).
