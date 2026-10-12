# ADR-0009: What reads the plate

- **Status:** OPEN — options and research only. No decision, nothing installed.
- **Split from:** [ADR-0004](0004-readers.md), which decided the barcode and the label
  and left this one question hanging.
- **Raised by:** Kyel, 11 October 2026

## Why this is its own record

ADR-0004 chose the camera, the barcode reader and the label reader, and deferred the
plate because it is the only reader with a running cost. That deferral was right, but it
left one open question buried at the bottom of a document that is otherwise decided — and
the research needed to answer it is larger than the rest of 0004 put together.

So the plate moves here. ADR-0004 stays as the record of what was decided; this is where
the plate's options, costs and research live until it is answered.

## The question, unchanged from ADR-0004

> Is a running per-scan cost acceptable on a free app, or does the plate reader have to be
> on-device or absent?

## What the design has already settled

The board says: *"A photo cannot see weight. These portions are a starting guess — correct
one and Scranly remembers it for next time."*

That sentence does a lot of work. **Identification has to be good; grams do not** — the app
asks for the grams anyway and learns the correction. Paying for portion-estimation accuracy
would be buying a number the screen already treats as a guess.

## The constraints that decide it

- **Free, no ads, no subscription.** Every API call is Kyel's money with no revenue against it.
- **Invite-only, under 20 users to start.** Per-call pricing is irrelevant now and decides
  everything later.
- **"Your data never leaves your phone"** is on the About you screen. A cloud reader makes
  that sentence conditional, and the screen would have to say so.

## The options

### 1. General LLM vision (Claude, Gemini, GPT)

Good at "list what is on this plate", no food-specific contract, handles leftovers no
classifier has seen, and the prompt is ours so the copy's hedging can be enforced in the
output.

Against: per-image cost forever; photos leave the phone; needs a server, because an API key
shipped in the app is a key that leaks.

### 2. Specialist food API

Trained on food, returns dish plus nutrition, food database attached.

Checked 11 October 2026 — all three are cloud/REST, API-first, with no on-device or edge
build found in their documentation:

| | |
| --- | --- |
| LogMeal | Food AI Engine, REST |
| Calorie Mama (Azumio) | Food AI API, REST |
| Foodvisor | REST |

Against: per-call pricing, a vendor to depend on, and published comparisons show accuracy
varying a lot by cuisine — worth testing on the food Kyel actually eats, not on a demo.

### 3. On-device food SDK

**This row is thinner than ADR-0004 implied.** Searching on 11 October 2026 for on-device
food recognition SDKs turns up Passio and very little else; the names that surface
alongside it are the cloud APIs in option 2, which is a different cost model and breaks the
privacy line.

So in practice this option means **Passio, or build it yourself (option 4)**.

For: no photo leaves the phone, works offline, no per-call cost, keeps the About you promise
intact. Against: licence cost, app size.

### 4. Build our own model

**The model is the easy part, and that is the trap.**

The easy part: Food-101 is a public dataset of dish images. Apple's Create ML does transfer
learning from a folder of labelled images, runs on Kyel's own Mac at no cost, and produces a
`.mlmodel` that the Vision framework loads directly. A weekend, including the fiddling. A
fine-tune of MobileNet or EfficientNet in PyTorch with `coremltools` is the same job with
more control and a rented GPU.

What actually costs:

1. **Food-101 is the wrong 101 things.** It is restaurant dishes — baklava, beef carpaccio,
   escargots. No chicken breast, no porridge, no Greek yoghurt, no leftovers in a bowl. The
   real work is a dataset of the food Kyel actually eats, photographed and labelled.
2. **A plate is multi-item; classification returns one label.** Chicken, rice and broccoli on
   one plate needs detection or segmentation, which is a different and much larger problem.
3. **Label to nutrition is arguably more work than the model.** "Spaghetti bolognese" has to
   become grams of protein, carbs and fat — a fuzzy join into a food database, with ambiguity
   at every step, and the part no tutorial covers.
4. **It never finishes.** Every wrong identification is ours to fix, with no vendor to
   escalate to.

Effort, as a judgement and not a measurement: a toy that classifies a single dish on the
phone is a weekend and is not useful. Something that works on real dinners and produces
nutrition is months of part-time work followed by permanent maintenance. Food recognition is
somebody's whole company, which is why Passio can charge for it.

### 5. No vision at all — a shortlist from what you already eat

Not in ADR-0004's table, and it belongs there.

The app already asks for grams and already remembers corrections. So plate mode could skip
identification entirely and offer the foods this person logs most, as a quick multi-select:
"what's on the plate?" answered by tapping four things you have eaten before.

For: costs nothing, no vendor, no photo leaves the phone, nothing to maintain, and it fits a
free app's constraints better than any paid option. It also gets better the more you use the
app, which none of the others do.

Against: it is not the mode the board drew, and it does not feel modern. It does nothing for
a first-time user with an empty diary, and nothing for food they have never logged.

### 6. Ship without the plate

Costs nothing. Barcode and label cover packaged food, which is most of a UK diet. Loses the
mode that makes the app feel modern, and the board is already drawn.

## Research still to do

Nothing below has been done. This is the list, not the findings.

- [ ] **Passio pricing.** Published as "contact sales"; no figure has been obtained and none
      should be guessed. Needs an actual enquiry.
- [ ] **Pricing for LogMeal, Calorie Mama and Foodvisor.** Same — contact-sales, unverified.
- [ ] **Per-image cost of the LLM option** at a realistic rate of plate scans per user per day,
      against a plausible user count. Arithmetic, once a provider and a rate are picked.
- [ ] **Accuracy on Kyel's own food.** Photograph twenty real meals and run them through
      whichever two or three options reach a trial. Published benchmarks are on restaurant
      dishes and do not predict this.
- [ ] **Whether a general CV platform with edge deployment has a usable food model.** Suspected
      to exist, not verified, deliberately not listed above as though it had been.
- [ ] **What the About you copy would have to say** if a cloud reader were chosen. A wording
      problem as much as a technical one, and it touches a promise already on screen.
- [ ] **Whether option 5 is enough.** Cheapest to find out: it needs no vendor, and the diary
      has to exist first either way.

## Not decided here

Any of it. The question at the top is still Kyel's, and the research above is what should
answer it rather than a preference for whichever library was reached for first.

## Sources

- LogMeal Food AI Engine: https://logmeal.com/solutions/food-ai-engine
- LogMeal API docs: https://docs.logmeal.com/docs/guides-getting-started-welcome-logmeal-api
- Calorie Mama: https://caloriemama.ai/ and https://dev.caloriemama.ai/
- Passio mobile SDK overview: https://passio.gitbook.io/nutrition-ai/mobile-sdks/mobile-sdk-overview
- nutrilens, a worked example of the fully on-device route (Swin-Food101, MobileCLIP, SlimSAM,
  ONNX, no backend): https://github.com/thejusdutt/nutrilens
