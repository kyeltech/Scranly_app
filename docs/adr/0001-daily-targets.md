# ADR-0001: How daily targets are calculated

- **Status:** accepted
- **Date:** 2026-09-25

## Context

Scranly has to turn a person into five numbers a day: calories, protein, fat, fibre and carbs.

Kyel's existing method derives all five from bodyweight alone — pounds × 10 for calories, × 0.8 for
protein, × 0.3 for fat, 14 g of fibre per 1,000 kcal, carbs from what is left. Checked against
published guidance the macro layer holds up well, and its ratios stay constant at every bodyweight:
1.76 g/kg of protein and 26.6% of calories from fat, whether the person is 60 kg or 95 kg. Fibre at
14 g per 1,000 kcal is not a rule of thumb at all — it is the Dietary Guidelines figure verbatim.

The calorie step is the weak one. `lb × 10` has a single input, so it cannot see height, age, sex or
activity. For one 83 kg person it produces a deficit anywhere between 315 and 1,253 kcal a day
depending on how active they are — a rate of 0.29 to 1.14 kg a week, a fourfold spread the formula
cannot detect. It also has no goal in it: at light activity 1,830 kcal reaches 75 kg in about
14 weeks, not the two months Kyel had set, and nothing in the app noticed the contradiction.

## Decision

Keep the macro layer. Replace the calorie step, and measure rather than predict once there is data.

**1. Bodyweight to pounds** — `lb = round(kg × 2.2)`.

**2. Calories** — from maintenance and the goal, not from a constant:

```
maintenance = MifflinStJeor(kg, cm, age, sex) × activity
            = (10×kg + 6.25×cm − 5×age + 5 | −161) × (1.2 … 1.725)

rate    = min( (current − goal) / weeks , 1% of bodyweight per week )
deficit = rate × 7,700 ÷ 7
target  = round(maintenance − deficit)
```

**3. Protein** — `floor(lb × 0.8)` g.

**4. Fat** — `floor(lb × 0.3)` g, then clamped into 20–35% of the target.

**5. Fibre** — `floor(target ÷ 1000 × 14)` g. Fibre is a slice *inside* carbohydrate, never a fifth
macro added on top; counting it separately double-counts its calories.

**6. Carbs** — `round((target − protein×4 − fat×9) ÷ 4)` g.

**7. After 14 days of logging, maintenance is measured, not estimated.** Logged intake plus the
movement of the 7-day weight average gives this person's actual maintenance. Every equation above is
a population average applied to one individual; two weeks of their own data beats all of them. The
app then offers to re-derive the targets from the measured figure.

### Rounding

Pounds round to nearest; protein, fat and fibre floor; carbs round to nearest. This matches how Kyel
works the numbers by hand. A consequence is that the macros can sum to within about 2 kcal of the
target rather than exactly — tests assert the published figures and a `|sum − target| ≤ 3` invariant,
not equality.

### Worked example

83 kg, 182 cm, 32 years, male, lightly active, goal 75 kg in three months:
maintenance 2,492 · rate 0.62 kg/wk · deficit 677 · **target 1,815 kcal · P 146 g · F 54 g ·
fibre 25 g · C 186 g**.

Age is still an assumption — 32 is a placeholder until Kyel gives his. Height is his: 182 cm.

## Consequences

- Onboarding must collect height, age, sex and activity. The About you screen already does.
- A goal without a date cannot produce a target, so the date is required, not optional.
- Asking for more than 1% of bodyweight a week is capped rather than obeyed, and the person is told
  the arrival date that follows from the capped rate.
- The 7,700 kcal per kg figure is a rule of thumb; published values run 7,000–7,700. This is a reason
  to reach step 7 quickly, not a reason to pick a different constant.
- Targets move as weight moves, so they are recomputed from the 7-day average rather than from a
  single reading.

## Sources

- Mifflin–St Jeor coefficients — https://en.wikipedia.org/wiki/Harris%E2%80%93Benedict_equation
- Acceptable Macronutrient Distribution Ranges — https://en.wikipedia.org/wiki/Dietary_Reference_Intake
- Fibre, 14 g per 1,000 kcal — https://nutrition.ucdavis.edu/outreach/nutr-health-info-sheets/consumer-fiber
- Protein for trained lifters — https://www.strongerbyscience.com/reflecting-on-five-years-studying-protein/

The ISSN position stand on protein and the Helms 2014 systematic review could not be read (rate
limited and 403 respectively), so the protein range rests on a secondary source by the same author.
