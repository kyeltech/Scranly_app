# ADR-0003: One scanner, three readers

**Status: PROPOSED — needs Kyel's decision.** Written up because the code is there to try, not
because the call has been made. Architecture decisions are his; this is the case for one option
and what it costs.

## Context

The design has three ways to read food into the app, and a fourth for the scale:

| Reader | Boards | What it reads |
| --- | --- | --- |
| Barcode | ScanHunting, ScanLookingUp, Scan, ScanNoMatch | A packaged product's barcode |
| Plate | PlateAim, PlateAnalysing, PlateResult | A whole meal, from above |
| Label | LabelAim, LabelResult | A UK nutrition table |
| Scale | ScalePhotoAim, ScalePhotoRead | A bathroom scale's display |

The boards put mode tabs — Barcode · Plate · Label — inside the viewfinder, so the first three are
already drawn as one place. The scale reader has no tabs, and is reached from the weigh-in.

## Decision

**One `Scan` screen with a `mode`, not three screens.** Switching mode is a state change, not a
navigation. The reason is physical: all three are the same gesture with the phone held the same
way, and a person who finds no barcode should reach Plate without backing out to a menu. A
navigation between them would put a screen transition in the middle of one continuous action.

**The scale reader is its own screen.** It has no mode tabs on its board, and offering Barcode
from a weigh-in would be nonsense.

**Every mode is a small state machine, and every state is a board:**

```
barcode   aiming -> looking -> found -> serving       (or -> nomatch)
plate     aiming -> working -> result
label     aiming -> result
scale     aiming -> read
```

**Switching mode returns to aiming.** A barcode result means nothing once the phone is pointed at
a plate, so carrying it over would be a lie about what is in frame.

**The picture is the only pretend thing.** `src/components/subjects.tsx` draws the barcode, the
plate, the label and the scale display. Everything layered over them — frame, hint, mode tabs,
shutter, every result sheet — is real. Choosing a camera library replaces one layer.

## What this costs

- `Scan.tsx` owns three state machines. If a fourth reader arrives it should be split.
- The timers standing in for the readers are in the screen. A real reader belongs behind an
  interface the screen calls, which is the shape to aim for when the camera decision is made.
- Deep-linking to a single mode works (`navigate('Scan', {mode: 'label'})`) but the back stack
  has one entry for all three, so Android back leaves the scanner rather than stepping modes.
  Whether that is right is worth a look on a device.

## Still open

- **The camera library.** Kyel's call, and a native dependency. Until then, `subjects.tsx`.
- **The `Custom` horizon chip** on the Goal boards has no screen behind it. Every tappable control
  is supposed to have one, so either a date picker gets designed or the chip comes off.
- **Whether the day picker should go forward at all.** It stops at the month containing today,
  on the grounds that a food diary has no future. If planning ahead is ever a feature, that stops
  being true.
