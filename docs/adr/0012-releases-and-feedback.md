# ADR-0012: What changed, and asking what people think

- **Status:** DECIDED — 15 November 2026. Built; feedback verified end to end
  on a device. The version read is wired into the Xcode target but has not yet
  run on a device (below).
- **Raised by:** Kyel, 15 November 2026
- **Context:** the app lives in TestFlight with a handful of friends on it until
  next year, and goes to the App Store after that.

## The questions

1. When a new build goes out, how does the app tell somebody what changed —
   and does that differ between TestFlight and the App Store?
2. TestFlight has no reviews. How is feedback gathered instead?

## What TestFlight already does, verified against Apple's own pages

- **Feedback it collects:** screenshot feedback — "screenshots, comments related
  to crashes, and general comments" — and crash reports, downloadable for 120
  days. Enabled or disabled **per tester group**. A Feedback Email field in Test
  Information catches older clients and any group with it switched off.
- **Where it lands:** App Store Connect → TestFlight → Feedback, and Xcode →
  Organizer → Feedback (filter by version and build, annotate, mark resolved).
  Replies go out by **email**; testers who joined by a public link are anonymous
  unless they typed an address, so they cannot be replied to at all. A webhook
  can notify a server when new feedback arrives, and the App Store Connect API
  can pull it.
- **No ratings and no written reviews.** Apple's pages describe nothing of the
  kind. Ratings arrive with the App Store, not before.
- **Updating is Apple's job:** "TestFlight will notify you each time a new build
  is available", the tester taps **Update**, and with automatic updates on (a
  global switch and a per-app one) it installs by itself. Two things make that
  work and neither is code: fill in **What to Test** on every build, and ask
  testers to turn automatic updates on when they accept the invite.
- **A build lasts 90 days.** "Available to test for up to 90 days", and then
  "you'll no longer be able to open the beta build". This is a hard constraint
  on living in TestFlight: ship at least quarterly or every tester is locked out.

Not documented by Apple: which gesture a tester uses to send feedback. No copy
in the app or in an invite should describe it until it has been done once on a
device.

## Decided

**1. A what's-new sheet, and no update nudge.** The list of releases ships in the
bundle (`domain/releases.ts`), keyed on version *and* build — `1.0 (4)` — because
TestFlight repeats the marketing version while the build climbs, and keying on
the version alone would leave the people most owed a changelog the only ones
never shown one. It describes the build it is running in, so it needs no request
and cannot be wrong. It never offers to fetch anything: no app can install its
own replacement.

Rules, all tested: nothing on a first install (onboarding is the welcome);
once per release, written down **on dismissal** rather than on display; nothing
for a release with no entry; everything missed in one sheet, grouped newest
first; and Settings → What's new as the only way back to it.

**2. The app reads its own version natively.** `ios/Scranly/AppVersion.swift`
(with a three-line `.m` to register it) exposes `CFBundleShortVersionString`,
`CFBundleVersion` and whether the receipt is a sandbox one — Xcode's
`MARKETING_VERSION` and `CURRENT_PROJECT_VERSION` are the single source of
truth, read at runtime so nothing can go stale.

Rejected: `react-native-device-info` (a dependency with no stated New
Architecture support, and dozens of APIs for two strings) and a build-time
generated constant (a copy, which goes stale on exactly the release where it
matters — and the literal is not in Info.plist, only in the pbxproj).
`package.json`'s version is not the binary's and is not used anywhere.

**3. One row on Today for the 90 days.** `signpost` once the build is three
weeks old ("Get the newest build"), `deadline` inside a fortnight with the date
in words, `last` for the final two days. One row, chosen in that order, on
TestFlight builds only. It is never a claim that a newer build exists — the app
cannot see TestFlight — and the tap goes out to TestFlight, where the Update
button actually is.

**4. A feedback screen that posts to a form endpoint.** Three questions, one of
them a row of taps over the things that are drawn and unbuilt, because eight
people tapping the same chip is a decision where eight paragraphs mentioning it
is a feeling. Send posts `{subject, wants, confusing, anything, release}` as
JSON — their words and the build, and nothing else about the phone.

**Amended the same day.** The first build of this opened a `mailto:` draft, on
the grounds that a hosted form would break About you's promise. That was wrong
twice over. The promise is narrow — *"Used once, to work out what your body
needs. It never leaves your phone"* — and it is about the profile, not about a
sentence somebody chose to type; nothing in the payload is profile data. And the
draft put **my email address in front of every tester and in the app bundle**,
which is a worse outcome than the one it was avoiding, and asked people to go
through their own mail to say something. A form endpoint keeps the address out
of the app entirely.

Rejected: a mail-provider API key in the app (Resend, SendGrid, Postmark) —
that is a spam relay handed to anyone who unzips the binary, whatever it buys.

The endpoint ships **empty** (`readers/feedback.ts`), and `canSend` hides both
ways into the screen while it is: one that collects words it cannot deliver is
worse than none. Filling in that one constant turns both on.

Sending made two things better. "Sent" is now something the app can honestly
say, which a draft could never confirm. And a failure is the eight codes already
built rather than a special case — with `wordsFor(failure, 'send')` giving the
sentence about what still works a second form, because "the diary still works
offline" is the wrong thing to tell somebody who has just written a paragraph.
Their words survive every failure, and the clipboard is the way out that needs
no network.

**5. The app never asks for feedback on its own.** No prompt after five
launches, no "enjoying Scranly?". Two ways in: the Settings row, and one ghost
on the what's-new sheet. An app with no ads that nags for a review has only
moved the advert.

**6. Still eight failure codes.** A ninth, `noMailApp`, existed for as long as
the mail draft did and was deleted with it: nothing raises it any more, and a
code in the map that nothing can raise is a lie about what the app can do.

## Not done, and known

- **The two iOS files are in the Xcode target**, added to `project.pbxproj` by
  hand — four entries mirroring `AppDelegate.swift`'s, verified by parsing the
  result rather than by eye, with the previous file kept beside it as
  `project.pbxproj.bak`. No bridging header is involved. What has still not
  happened is a build: if the constants do not arrive, `src/version.ts` reads
  `undefined` and every caller is built for it — no sheet on launch, no row,
  and the Settings row shows "—", with one warning from `App.tsx` saying why.
- **Unverified from here:** that a legacy bridge module's `constantsToExport`
  reaches JS under the New Architecture's interop layer, and that `itms-beta://`
  opens TestFlight. Both need a device build. The row falls back to
  `https://testflight.apple.com/` so it can never be a tap that goes nowhere.
- **Not built:** the "Build 7 is out" state of the row, which would need a
  `latest.json` published somewhere static and compared on launch — the first
  piece of infrastructure this app would have. It is drawn and parked on the
  canvas. The App Store Connect API could answer it properly but needs a signed
  private key, and shipping one inside an app hands it to anyone who unzips it.
- **Sending works, verified on a device 15 November 2026.** A real send from
  the app reached Web3Forms and Kyel's inbox. That answers both of the
  questions this section listed as open: a native app is an acceptable client
  despite their docs recommending "client/browser side, not server side", and
  the `name` and `email` fields their examples all carry are **not** required —
  the five fields this app sends are enough.

  The access key lives in `ACCESS_KEY`. Their docs are explicit that it is not a
  secret — "You do not need to hide the access key. Access key is public" —
  because it is an alias for an inbox and can do nothing else. It is in the
  repository and in the binary by design; emptying that one line turns the
  feature off, because `canSend` hides both ways in.

  **Tally was tried first and cannot do this.** Its API documents `GET` and
  `DELETE` for submissions, `POST /forms` for creating forms, and webhooks —
  there is no endpoint that creates a submission, so a form on Tally can only
  be filled in through a browser. Its API key is also a full-account bearer
  token, which could never ship in an app. Formspree very likely works but its
  current documentation no longer describes the raw POST, and an endpoint we
  cannot cite is not one to build on.

  Spam filtering beyond their hidden `botcheck` field is a paid feature, and
  the key is extractable from the app, so if it is ever abused the answer is a
  Worker of our own rather than their plan. Nothing to do until then: swapping
  is `fieldsFor` and the endpoint above it, and no screen changes.
- **Open:** whether a half-written message should survive leaving the screen
  (one MMKV key), and ADR-0006's Q6 — what a person is told when the
  store itself cannot be opened.
