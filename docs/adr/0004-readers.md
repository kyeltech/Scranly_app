# ADR-0004: What actually reads the barcode, the plate and the label

**Status: PART DECIDED — barcode and label chosen; the plate is still open.**

Decided: react-native-vision-camera 5.2.3 for the camera and its built-in barcode
scanner; @react-native-ml-kit/text-recognition 2.0.0 for the label. The plate is
deferred — it is the only reader with a running cost, and deferring it costs
nothing.

**react-native-nitro-ocr was tried first and abandoned.** It installs as a
pre-release and does not compile:

| Attempt | Failure |
| --- | --- |
| 0.1.0-beta.0 | `CGImagePropertyOrientation` does not conform to `BinaryFloatingPoint` |
| 0.1.0-beta.1, nitro-modules 0.37.1 | `Type 'RuntimeError' has no member 'from'` |
| 0.1.0-beta.1, nitro-modules 0.35.10 (what it asks for) | the same, on a clean build |

The third is the telling one: `RuntimeError.from(cppError:)` is present in
0.35.10 — read it in the source — and there is only one copy of nitro-modules in
the tree. Its generated bindings do not match any nitro-modules the camera can
also live with. A library at 0.1.0-beta failing to build against the current iOS
SDK is the library saying it is not ready; that should have been the conclusion
after the first failure rather than the third.

### Two things the ML Kit package brings with it

Both were found by reading its podspec and its iOS source, not by hitting them at runtime. Neither
blocks the build; both are Kyel's call.

1. **It pulls five script packs.** The podspec depends on `GoogleMLKit/TextRecognition` *plus*
   Chinese, Devanagari, Japanese and Korean — all five, unconditionally — and the Objective-C file
   `@import`s all of them. A UK food label is Latin. The extra packs are app size for nothing, and
   trimming them means either patch-package (a new dev dependency) or a vendored podspec with
   autolinking disabled for the package. Deferred: app size decides nothing before the App Store,
   and the release is gated on 20 active users.
2. **It is an old-architecture bridge module** (`RCT_EXPORT_MODULE`, `NativeModules.TextRecognition`)
   in a project running the New Architecture. RN 0.87's interop layer is meant to carry it. If it
   does not, that is the first thing to suspect on a failed label read.

It also requires **iOS 15.5**, so the project's deployment target moved from 15.1 (see the Podfile's
`post_install`, which holds every pod target at the same floor).

**Original status: OPEN — options only, no decision.** Three separate choices, not one. Kyel decides; this
records what the options are and what each costs, so the decision is made on facts rather than on
whichever library I reached for first.

Every option below is a third-party dependency. Nothing here is installed.

## Context

`src/components/subjects.tsx` draws a barcode, a plate, a label and a scale display. They stand in
for a sensor. Everything over them — frame, hints, mode tabs, result sheets — is real and tested,
so each choice below replaces one layer.

The app's constraints matter more than usual here:

- **Free, no ads, no subscription.** Every API call is Kyel's money with no revenue against it.
- **Invite-only, under 20 users to start.** Per-call pricing is irrelevant now and decides
  everything later.
- **"Your data never leaves your phone"** is on the About you screen. A cloud reader makes that
  sentence conditional, and the screen would have to say so.

## 1. The camera, and the barcode

The viewfinder is shared by all four readers, so this is the one choice that blocks the other three.

| Option | For | Against |
| --- | --- | --- |
| **react-native-vision-camera** (Margelo, MIT) | The default in this space. v5 has a barcode scanner **built in**, so barcode mode needs no second library. Frame processors leave the door open for the other modes. New-architecture ready, which this project needs. | Native dependency: `pod install`, camera permission strings in both projects. Large-ish. |
| Commercial SDK (Scanbot, Dynamsoft) | Better on damaged, curved or badly-lit barcodes. Support contract. | Licence fee and a key to manage. Overkill for reading cupboard packaging in a kitchen. |
| expo-camera | Well documented. | Pulls the Expo module system into a bare CLI app. A layer for nothing we need. |

**Leaning: vision-camera.** One dependency, and barcode comes free with it.

## 2. The plate — the one with a real cost

The design already says *"A photo cannot see weight. These portions are a starting guess — correct
one and Scranly remembers it for next time."* That commitment changes the problem: **identification
has to be good, grams do not**, because the app asks for the grams anyway. Optimising for portion
accuracy would be paying for a number the screen already treats as a guess.

| Option | For | Against |
| --- | --- | --- |
| **General LLM vision** (Claude, Gemini, GPT) | Good at "list what is on this plate". No food-specific contract. Handles a plate of leftovers that no food classifier has seen. Prompt is ours, so the hedging in the copy can be enforced in the output. | Per-image cost, forever. Photos leave the phone. Invents plausible grams unless told not to. Needs a server or an API key in the app — a key in the app is a key that leaks. |
| **Specialist food API** (LogMeal, Foodvisor) | Trained on food, returns dish plus nutrition, food database attached. | Per-call pricing and a vendor to depend on. Published comparisons of these platforms show accuracy varying a lot by cuisine — worth testing on the food Kyel actually eats, not on a demo. |
| **On-device food SDK** (e.g. Passio) | No photo leaves the phone, works offline, no per-call cost. Keeps the About you promise intact. | Licence cost, and app size. |
| **Ship without the plate reader** | Costs nothing. Barcode and label cover packaged food, which is most of a UK diet. | Loses the mode that makes the app feel modern, and the design is drawn. |

**Open question for Kyel:** is a running per-scan cost acceptable on a free app, or does the plate
reader have to be on-device or absent?

## 3. The label — probably not an LLM

A nutrition panel is structured printed text in high contrast: the easiest thing OCR ever gets.

| Option | For | Against |
| --- | --- | --- |
| **On-device OCR** (Apple Vision on iOS, ML Kit text recognition on Android, via one RN wrapper) | Free, offline, nothing leaves the phone, fast. Suits the task. | We write the parser for UK label layouts — two columns, kJ and kcal, "of which" sub-rows. That parser is the actual work. |
| LLM vision | Reads a creased label on a curved jar better, and returns structured fields without a parser. | Pays per label for something OCR can mostly do free. |

**Leaning: on-device OCR, with the parser as the real task.** The design already asks which of the
two columns to keep and lets any number be corrected, which is the right shape for an imperfect read.

## How to decide rather than argue

The kitchen test already on the list: ten real products from Kyel's cupboard, photographed as a user
would. Run them through each candidate and compare. Ten products settles more than any amount of
reading.

## Consequences either way

- The timers in `src/screens/Scan.tsx` stand in for a reader. Whatever is chosen belongs behind an
  interface the screen calls, so the screen keeps its states and its tests.
- If any reader is cloud-based, the About you copy has to stop saying data never leaves the phone,
  or say precisely what does.
