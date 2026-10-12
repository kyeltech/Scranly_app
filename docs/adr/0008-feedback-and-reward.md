# ADR-0008: What Scranly takes from Duolingo, and what it refuses

- **Status:** PROPOSED — the principle and the sorting below are a recommendation.
  Nothing here is built. Kyel decides which parts are taken.
- **Raised by:** Kyel, 8 October 2026

## The question

Duolingo makes a daily habit feel good: small wins celebrated, motion that
responds, a phone that buzzes when something lands. Scranly is also a
several-times-a-day habit. Which of that machinery belongs here?

## The principle everything else follows from

**Celebrate the logging, never the deficit.**

An over day gets the same warmth as an under day. Nothing celebratory fires on a
smaller number. The weight trend going down gets no flourish. What the app says
is *you told me*, not *well done for eating less*.

This is written first because without it the question gets decided one animation
at a time, by whatever felt good in the moment. Every item below resolves
against it.

It is not only an ethics point. An app that makes someone feel bad about a
normal meal gets deleted, so the restraint is also what keeps Scranly installed
long enough to be any use.

## The sorting

### Take: the feedback layer

Haptics and motion, at the moment a state changes.

| Moment | Feedback |
| --- | --- |
| Barcode locks on | Light impact, the instant the box snaps |
| Label parses | Success |
| Food committed to the diary | Success |
| Weigh-in saved | Success |
| Setup finished | Success |

Plus: the ring springs and counts up rather than snapping; the macro bars on the
targets step stagger in.

Five or six haptic moments in the whole app, and no more. Haptics only feel good
when they are rare and earned — a buzz on every tap is noise, and noise is what
people turn off in Settings. The rule: **a state change the user caused and
cares about, never navigation.**

Why this is the one worth having. It needs no server and no account, costs
nothing in privacy, carries no behavioural hazard, does not reopen ADR-0002, and
compounds with the ring, the scanner and the macro bars that already exist. It
is also the only item here that improves the app for someone who never engages
with a single game mechanic.

**Not free.** Core React Native ships `Vibration`, which is a dumb buzz and not
the Taptic Engine. Real patterns (`UIImpactFeedbackGenerator`,
`UINotificationFeedbackGenerator`) mean a third-party module or a small native
module of our own — a dependency decision, and one whose nitro and New
Architecture requirements get checked against the pins before it is suggested,
not after.

`AnimatedSplash` already honours reduce-motion. The same respect applies here,
and iOS has a separate system setting for haptics that has to be honoured too.

### Take: an ending

Nothing happens when the day closes. Duolingo's actual trick is not the streak —
it is that a lesson *ends*, with a visible floor and ceiling and a clean done.
Scranly has the ring and no ending.

Cheap to build on what exists. There is no board for it, so it needs a design
pass before any code.

### Take, carefully: guess before you know

Before a barcode resolves or a label parses, the app already knows the answer a
half-second later. So ask first: how many calories do you reckon? Score the gap.
Estimation error falling over weeks is the progress curve.

It reuses the scanner, stays on-device, produces progress that is neither weight
nor a chain, and is the only mechanic that serves both halves — habit and
teaching — at once. It also points somewhere no competitor does: a tracker whose
goal is that you stop needing to weigh your chicken.

**The constraint that decides whether it works.** Logging happens several times a
day. Asking for a guess on every scan gets old inside a week. It has to be
occasional — new foods only, or once a day, or opt-in. Built as a gate on every
scan it makes the app worse, and that is the likeliest way to get this wrong.

### Refuse: streaks on hitting targets

Punishes a birthday dinner and rewards under-eating. This is the mechanic that
turns calorie apps into something people have to quit.

### Refuse: streaks on logging

Softer, and still no. A chain creates a reason to log something false rather than
break it, and a missed day still reads as failure.

The honest version is a completeness view — *24 of the last 30 days* — which is
information rather than something to protect. Same signal, no anxiety attached.

### Refuse: leagues and leaderboards

Three independent reasons, any one sufficient: competitive weight loss is a bad
idea on its own; it needs a server and a social graph; and it contradicts the
sentence already on the About you step, which says the data never leaves the
phone.

### Refuse: hearts, lives, gems

Gating access to your own food diary is hostile. A currency with nothing to buy
is cargo cult — those mechanics exist to shape spending in a freemium app, and
Scranly sells nothing.

### Refuse: notification guilt

Manipulation aimed at eating is a different category of harm from manipulation
aimed at Spanish vocabulary.

### Defer: a lessons curriculum

Food literacy is genuinely learnable and badly taught, so the idea is not wrong.
But it is a content business rather than a code one — somebody writes and
maintains every lesson forever — and ADR-0002 leaves nowhere to put it without
reopening the navigation decision.

*Guess before you know* delivers much of the same teaching value with no content
to write, which is why it is preferred over this.

## Why the refusals are easy here

Duolingo needs you back forever because that is where the revenue is, and the
streak is how that is engineered. Scranly sells nothing, so none of the
engagement machinery has a business case behind it — which leaves only the
question of whether each piece makes the app better for the person using it.
That is a much easier question, and it is how the list above was sorted.

## Not decided here

Whether any of it is built, and in what order. Which haptics module, if the
feedback layer is taken. Where an ending lives on Today, which has no board. How
often *guess before you know* asks, and whether it is opt-in.
