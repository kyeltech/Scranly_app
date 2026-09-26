# ADR-0004: What actually reads the barcode, the plate and the label

**Status: OPEN — options only, no decision.** Three separate choices, not one. Kyel decides; this
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
