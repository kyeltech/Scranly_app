# ADR-0006: What the app says when something fails

- **Status:** MOSTLY DECIDED — every failure the app can currently raise has a
  designed state, and they all come from one component (see the amendments of 3
  and 15 November 2026 below). Three questions stay open: Q4 (a cached answer
  offline), Q5 (the About you copy), and a new one — what a person is told when
  the store itself cannot be opened. The options survey that follows is kept as
  the record of why.
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

## Amendment — 15 November 2026: one component, eight codes

The 3 November amendment answered Q1–Q3 for the barcode path with a second
sheet beside "Not in the database". Four failures were being told apart in the
reader and then collapsed into one sentence on screen — offline, a timeout, a
500 and a 429 all read "You're offline, or Open Food Facts is busy", which is
two guesses and an apology for the ones it got wrong. The board now carries the
whole map, and the code follows it.

- **`domain/failure.ts` owns the words.** Eight codes — `offline`, `timeout`,
  `server`, `rateLimited`, `badResponse`, `notFound`, `cameraRefused`,
  `unknown` — each with a title of four words or fewer, a body of two sentences
  whose second says what still works, one primary action and at least one ghost.
  A caller raises a `Failure` and never chooses a title or a button, so a change
  to the wording is one edit rather than eight. The rules are tests, not notes:
  title length, sentence count, "never says something went wrong", and never a
  sheet with one button.
- **`screens/scan/FailureSheet.tsx` is the only sheet.** `NoMatchSheet` and
  `CantReachSheet` are gone; `CameraRefused` is now a caller of it with the
  `cameraRefused` code. A way with no handler is not drawn, and the next way
  takes the lime button — which is how a refused camera stops offering "Allow
  the camera" when the system will no longer honour it, without the copy
  knowing anything about permissions.
- **The primary action is not always "Try again."** On a rate limit, an entry
  with no nutrition, and a barcode nobody has heard of, the label path takes the
  lime button and the retry drops to a ghost — with the wait named when
  Retry-After says how long and is worth saying. A primary button that will fail
  again is a lie told in a nice font.
- **The deadline is real.** `readers/product.ts` now puts an `AbortController`
  on every request with a ten-second deadline, so the designed `timeout` state
  is reachable; before this it could not be, because nothing ever gave up. A 404
  is read as a miss rather than a failure, and a 200 whose entry carries no
  nutrition is `badResponse` — the barcode is known, so another scan will not
  help.
- **Q3 stands: retry is still manual.** Nothing auto-retries.
- **The camera's own button works.** `CameraRefused` declared an `onAsk` that
  `Scan` never passed, so "Allow the camera" was drawn and wired to nothing.
  The permission request now comes down from `useCamera`, and the test presses
  the button rather than checking that it exists.
- **The search says which failure it was.** Add food cannot give up the screen
  to a sheet — the local results are still worth showing — so it shows the
  code's one-line note instead of one sentence covering four problems.

### New open question — Q6: what if the store cannot be opened?

`store/mmkv.ts` records why it could not open its storage and nothing shows it
outside a dev readout. A build with no pod keeps running and silently forgets
every day it logs, which is the one failure in this app that loses data rather
than a lookup. It is not on the board and it is not a network code, so it is not
invented here: it needs a decision about what the app says and whether it keeps
accepting entries it cannot save.
