# ADR-0011: Reading the scale

- **Status:** DECIDED — 8 November 2026. On-device, free, with a model to source.
- **Raised by:** Kyel, 8 November 2026
- **Feature:** F14 (P1) — photograph the scale, read the weight, confirm, log.

## The question

The weigh-in has two ways in: type the number, or photograph the scale. The
typed path is real and logs to the weight store (ADR none; `store/weight.ts`).
The photo path — `ScalePhoto` — is drawn but its read is a placeholder: the
shutter flips to a "read" screen showing a number handed in, not one read from
the camera. What reads the display for real?

## What the research found (8 November 2026)

- **General OCR does not read seven-segment displays.** ML Kit — the text
  recogniser the label reader already uses (ADR-0004) — reads printed text well
  and seven-segment digits badly: LED bleed, glare, and segmented (not solid)
  strokes defeat it. Tesseract is the same. So the free reuse that worked for
  labels does **not** carry over to the scale.
- **Seven-segment reading needs a model trained for it.** Custom approaches
  reach ~98% accuracy where general OCR flounders; ready seven-segment TFLite
  models exist.

## The constraint that decides it

"Your data never leaves your phone" is on the About you screen. A photo of a
scale is as personal as a photo of a plate (ADR-0009). So the reader must be
**on-device**, which rules out cloud OCR (Google Cloud Vision, Textract) — the
same line the plate reader drew, and for the same reason.

## The decision: a TFLite model, on-device

A seven-segment TFLite model, run in a `react-native-vision-camera` frame
processor through **`react-native-fast-tflite`**.

| Piece | Cost | Licence |
| --- | --- | --- |
| `react-native-fast-tflite` | Free, no key, no per-use cost | MIT |
| TensorFlow Lite runtime | Free, on-device | Apache 2.0 |
| `react-native-vision-camera` (already in) | Free | MIT |
| vision-camera resize plugin / worklets-core | Free | MIT |
| The seven-segment `.tflite` model | Free (source an open one, or train on a Mac) | **to confirm per model** |

So: **no money, no subscription, no per-scan cost** — the whole point of staying
on-device, unlike the cloud options ADR-0009 priced. `fast-tflite` is the same
author as vision-camera, GPU-accelerated, "provided as is" (hobby-maintained — a
dependency to watch, per the flag-every-dependency rule).

## What this costs that is not money

- **App size** — the TFLite runtime plus the bundled model add a few MB.
- **A native build** — new native modules mean `pod install` and a device rebuild.
- **The model is the real work** — source or train a seven-segment model and run
  the kitchen-test equivalent: photograph the actual scale and see if it reads.
  An imperfect read is survivable because `ScalePhoto` already lets you tap the
  number to correct it — but only if it is usually right.

## How it splits for building

- **Buildable and tested off a device:** the read-to-weight step — turning the
  model's digits into a plausible kilograms figure, rejecting a misread rather
  than logging it. Lives in `domain/scale.ts`, owes nothing to the camera, the
  same way `readers/label.ts` owes nothing to ML Kit.
- **Device / ML work:** sourcing or training the model, installing the native
  modules, writing the frame processor, and testing against a real scale. None
  of it verifiable in a cloud session, which should be said rather than implied.

## Worth remembering

F14 is P1 and the typed weigh-in already works. This is a convenience whose hard
half is a trained model. If the model-sourcing turns out to be a slog, deferring
F14 and shipping on the typed path is a legitimate call.

## Amendment — 8 November 2026: the kitchen test, and it failed

Kyel's own scale was photographed (a blue backlit seven-segment LCD, reading
e.g. 79.25 and 36.30 kg, with KG, a temperature and a battery icon on the same
display). The display region was cropped and run through the easiest free path —
Tesseract with the seven-segment `ssd` model (and plain Tesseract as a baseline).

**It did not read it.** The weight 79.25 came back blank or as "1 1"; 36.30 came
back as "9"; plain Tesseract gave "| al". Four reasons, all in the photos: glare
reflections brighter than the digits (a global threshold grabs the glare), the
low contrast of light-blue digits on a dark-blue backlight, the clutter of the
temperature and battery beside the weight, and a domain mismatch — the `ssd`
model is trained on red/black meter displays, not a blue phone-era LCD.

So the free OCR path is out, as predicted. A reader that works on this scale
means a **trained model on displays of this style**, which is a data-collection
and training effort, plus the native wiring. The one thing that reads it
trivially is a vision LLM — but that is cloud, per-scan cost and the privacy
line, exactly what ADR-0009 ruled out for the plate.

**Recommendation: defer F14.** The typed weigh-in is real and already moves the
budget; the photo reader is an ML project out of proportion to a P1 convenience.
Pick it up when there is reason to, with real training data of the target
display. `domain/scale.ts` (`toWeight`) stays — it is the gate any future reader
feeds, and it reads this scale's format correctly.
