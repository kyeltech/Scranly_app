# Testing this branch by hand

What a tester can actually check on `feat/open-food-facts-lookup`, in the order
it is worth checking. Thirty-five commits plus the release and feedback work:
the Open Food Facts lookup and search, the food detail screen, the serving
guide, weigh-ins and the trend, Settings becoming real, the eight failure
states, the what's-new sheet, the update row and the feedback screen.

The unit and integration suite covers 781 cases and is not what this is for.
This is for the things only a phone, a tin of beans and a thumb can tell you.

## Before you start

1. **Build to a device, not the simulator.** ML Kit ships no arm64-simulator
   slice, so there is no simulator to run this on (AGENTS.md).
2. **Nothing to add in Xcode.** `ios/Scranly/AppVersion.swift` and
   `AppVersion.m` are already in the Scranly target's Sources phase — the
   project file lists them, verified by parsing it. There is no bridging header
   and none is needed: the Swift class is `@objc(AppVersion)` and the `.m` only
   registers it, so nothing in Swift imports anything from Objective-C. If
   Xcode offers to create one anyway, declining is fine.

   If the app ever cannot read its own version — Settings → What's new showing
   "—", no what's-new sheet, no update row — a development build logs one
   warning naming those two files, and `ios/Scranly.xcodeproj/
   project.pbxproj.bak` is the file as it was before they were added.
3. **Have these to hand:** a packaged food with a barcode, something with a UK
   nutrition label on the back, a bathroom scale if you want to test the photo
   read, and a way to turn the network off (Airplane mode or Settings → Wi-Fi).
4. **Know which build you are on.** Settings → Scranly → What's new shows it as
   `1.0 (1)`. Everything below that mentions a build means that number.

### Two things you cannot wait for, and how to fake them

- **The what's-new sheet on launch.** A first install is deliberately silent, so
  the sheet cannot appear on the build you just installed. To see it: install
  and open the app once (this writes the release down), then add a second entry
  at the top of `RELEASES` in `src/domain/releases.ts` with a new build number,
  bump `CURRENT_PROJECT_VERSION` in Xcode to match, and run again. The sheet
  rises on that launch.
- **The ninety-day clock.** Change the `on` date of the release in
  `src/domain/releases.ts` and rebuild — `25` days ago gives the signpost row,
  `80` the deadline row, `88` the last-two-days row in red. Put the real date
  back afterwards.

---

## A. The barcode scan

| # | Do this | Expect |
|---|---|---|
| A1 | Today → Scan. Point at a barcode on something ordinary | It reads on its own, no shutter. "Looking up" with the code, then the product |
| A2 | On the found sheet, tap the serving row | Per 100 g, and a per-serving row if the pack states one. No invented servings |
| A3 | Pick a meal on the segmented row, tap Add | Back on Today, in that meal, and the budget drops by the right number |
| A4 | Scan a barcode nobody has heard of (an own-brand oddity, or type one in) | "Not in the database", the code, and two ways on — label, or scan something else |
| A5 | Turn the network off. Scan anything | "No connection", and the body says logging and the diary still work |
| A6 | On that sheet, tap Try again, then point at **the same tin** | It reads again. (It used to need a different barcode — that was the bug) |
| A7 | Still offline, tap "Add it from the label" | The label reader, not a dead end |
| A8 | Network back on. Scan, then switch mode mid-lookup | Nothing from the barcode survives into plate or label |

## B. Search by name

| # | Do this | Expect |
|---|---|---|
| B1 | Today → Log food. Type "snickers" slowly | No request per keystroke; results arrive after you stop |
| B2 | Type two letters only | Nothing searched — too short to be worth a call |
| B3 | Turn the network off, search "chicken" | One line: "No connection — showing your foods only", and the local matches still listed |
| B4 | Keep typing after that line appears | The line goes at once, before the next search runs |
| B5 | Your own created foods vs database hits | Yours rank above the database |

## C. The food detail screen

| # | Do this | Expect |
|---|---|---|
| C1 | Add food → tap a food's row (not the +) | The whole panel: kcal, macros, fibre, salt, sugars, saturates — and a dash where the entry is silent, never a zero |
| C2 | Look at the badges | Nutri-Score pill, `NOVA n · WORD`, `OFF` where the entry has them, nothing invented where it does not |
| C3 | Tap the AMOUNT row | Opens only when the entry has a gram basis. Change it and every number rescales |
| C4 | Tap "See what a portion looks like" | The serving guide sheet, on the card for this food's group |
| C5 | LOG TO — change the day and the meal, then add | Lands on that day, in that meal |
| C6 | Scroll to the bottom | Ingredients where the entry has them, and the entry-source row |

## D. The serving guide

| # | Do this | Expect |
|---|---|---|
| D1 | Open it from a food detail | Lands on the card for that food's group, not card one |
| D2 | Swipe through | Sixteen cards, a 104px glyph each, the dots tracking |
| D3 | The pasta or rice card | The £1-coin tip for spaghetti, which is particular to that card |
| D4 | Any hand-measure card | The caveat under it says hands differ and names the British Nutrition Foundation |
| D5 | Tap the close disc, then tap the scrim | Both close it |

## E. Weighing and portions

| # | Do this | Expect |
|---|---|---|
| E1 | A logged food → edit the portion in grams | The numbers follow, to sensible decimals (salt to 3 dp, not 0) |
| E2 | Weigh a portion from the serving sheet | Grams in, kcal out, no guessing when the basis is unknown |
| E3 | Weigh-in → type a weight | Saved, and the trend has it |
| E4 | Photograph a scale | It walks the flow and says the read is a placeholder — it does not claim to have read your scale |
| E5 | Weigh in twice a few days apart | The budget follows the scale, and the trend draws a real line |

## F. Settings

| # | Do this | Expect |
|---|---|---|
| F1 | Today → cog | YOU reads About you → Method → Goal → Targets, in that order, with your real figures |
| F2 | About you → change height, save | Targets change. Reopen: your change is still there |
| F3 | Goal → change it, save | Saved on its own, and Today's budget reflects it |
| F4 | Foods you added | The foods you created, newest first. No chevron on the rows — editing them is not built |
| F5 | Any row with a SOON chip | Greyed, not tappable, and says SOON where the value would be |
| F6 | Open Food Facts row | Opens their site. The attribution is there because ODbL requires it |
| F7 | What's new | The sheet for this build, on demand |
| F8 | Tell me what you think | The feedback screen |

## G. What's new

| # | Do this | Expect |
|---|---|---|
| G1 | First install, first launch | **No sheet.** Onboarding is the welcome |
| G2 | Upgrade to a build with a new entry (see the recipe above) | The sheet, once, over Today. Lines with ticks, the build and date at the foot |
| G3 | Force-quit before dismissing, relaunch | The sheet again — it is written down on dismissal, not on display |
| G4 | Tap Got it, then relaunch | Gone, and it stays gone |
| G5 | Skip two builds, then upgrade | One sheet, grouped by build, newest first, "Dismissing marks them all as read" |
| G6 | Tap "Tell me what you think" on the sheet | The feedback screen, and the sheet counts as read |
| G7 | Read the sheet properly | Nothing on it offers to update or download anything. It describes the build you are in |

## H. The update row on Today

Set the release's `on` date back, per the recipe above. TestFlight builds only —
an App Store build and a local build without a sandbox receipt show nothing.

| # | Do this | Expect |
|---|---|---|
| H1 | A build five days old | No row. A row from day one is wallpaper |
| H2 | 25 days | "Get the newest build / New ones land in TestFlight", on the plain surface |
| H3 | 80 days | "This build stops working on <date>", on the warm ground, with the date in words |
| H4 | 88 days | "Two days left on this build / After <day> it will not open at all", in red |
| H5 | Tap any of them | TestFlight opens. If it cannot, the web page does — never a dead tap |
| H6 | All of them | Only ever one row, and it sits above the ring |

## I. Feedback

| # | Do this | Expect |
|---|---|---|
| I1 | Open it and press the button with nothing filled in | "Pick one, or write a line" — greyed, and nothing happens |
| I2 | Tap two chips | "Send", with "2 picked" beside it |
| I3 | Write in both boxes, Send | "Sending…", then "Sent, and read". The form empties |
| I4 | Check your inbox | The subject names the build; the picks are one line; an unanswered question is a dash |
| I5 | Turn the network off, fill it in, Send | "No connection" — and it does **not** talk about barcodes. Your words are still behind the sheet |
| I6 | Tap Try again with the network back | It goes |
| I7 | Fail it again, tap "Copy it instead" | On the clipboard, and the note says it is yours to paste |
| I8 | Leave it for now after a failure | Every word you wrote is still in the boxes |
| I9 | Read the screen before sending | It says what goes: the answers and the build, nothing else about your phone |

## J. The camera, refused and missing

| # | Do this | Expect |
|---|---|---|
| J1 | iOS Settings → Scranly → Camera off. Open Scan | "Scranly cannot see", and the way out is Open Settings |
| J2 | A fresh install, decline the camera prompt | "Allow the camera" — and pressing it asks the system again. (It used to do nothing) |
| J3 | Either state | "Type the food in instead" is there, and works |
| J4 | Plate mode | Says plates are not read yet, in plain words, and that nothing is measured |
| J5 | Label mode on a build with no OCR | The drawn stand-in and a footnote naming what is missing |

## K. The label reader

| # | Do this | Expect |
|---|---|---|
| K1 | Fill the frame with a UK nutrition table, shutter | The rows it read, both columns offered, every number tappable to fix |
| K2 | Photograph something that is not a label | Back to aiming with "Could not read that panel", not an empty sheet |
| K3 | A half-read label | The rows it got, plus a line listing what it could not place |
| K4 | Save it | A food of yours, in Foods you added |

## L. Dark mode

Settings → Display → Dark on the phone, then walk A1, C1, D1, G2, H3 and I1
again. Every surface should change; the lime button should not. Three things
worth a close look: the failure tile stays a pale ground with a dark red glyph,
the update row's three tones stay distinguishable, and the serving-guide glyph
is not a black shape on a dark card.

## M. It remembers

| # | Do this | Expect |
|---|---|---|
| M1 | Log three foods, force-quit, relaunch | All three still there, budget right |
| M2 | Create a food, relaunch | Still in Foods you added |
| M3 | Weigh in, relaunch | Still in the trend |
| M4 | Fresh install | Onboarding asks the four questions. Finish it and it never asks again |

---

## Not testable by hand, and where it is covered instead

- **A rate limit, a 500, a timeout, a malformed entry.** You cannot make Open
  Food Facts do these on command. Driven with the lookup stubbed in
  `src/screens/scan/lookup.test.tsx`, and the words checked in
  `src/domain/failure.test.ts`.
- **A render crash.** `src/components/ErrorBoundary.tsx` catches it; forcing one
  means editing the code to throw.
- **The store failing to open.** A build with no pod does it, which is not a
  state worth manufacturing. There is a development readout for it in `App.tsx`,
  and ADR-0006 Q6 is open on what a user should be told.
- **"Build 7 is out."** Designed and parked: it needs a `latest.json` published
  somewhere, which does not exist (ADR-0012).

## Things that will look wrong and are not

- **Plate mode invents numbers.** There is no plate reader in any build. The
  screen says so.
- **Foods you added has no chevron.** Editing one needs store operations that do
  not exist yet.
- **Settings → What's new shows "—".** The two iOS files are not in the Xcode
  target. See step 2.
- **A found product offers only per 100 g.** Open Food Facts had no serving size
  for that entry. Inventing one would be worse.
