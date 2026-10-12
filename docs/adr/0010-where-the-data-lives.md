# ADR-0010: Where the data lives

- **Status:** OPEN — options and findings only. No decision, nothing installed, no account opened.
- **Raised by:** Kyel, 12 October 2026

## The question

The PRD names a stack — Supabase with row-level security, server-side lookups to Open Food
Facts and USDA with caching, an offline cache on the phone (lines 199–201) — and a search
order of your foods, then the shared library, then Open Food Facts, then USDA (F5, P0).

None of it was ever argued. It is a plan, not a decision record, and this is the first time it
has been examined.

## "Where does the data live" is four questions, not one

They have different answers, and bundling them is what made the PRD reach for a backend.

| | What it is | Where it wants to live |
| --- | --- | --- |
| 1. Generic foods | Reference data, changes every few years | Bundled in the app |
| 2. Branded food lookups | Barcode in, product out | Called from the phone |
| 3. The diary | This person's log, weights, custom foods | A local store on the device |
| 4. Shared library, invites, accounts, sync | Everything involving other people | A server — and only this |

Only the fourth needs a backend, and the PRD already gates it behind 20 users.

## 1. Generic foods — bundle them

A static table of a few thousand rows that changes on a multi-year cycle. Fetching it over a
network would be a round trip for numbers that have not moved since 2021. Convert once, ship a
read-only database inside the app, and it works with no signal.

### McCance & Widdowson's Composition of Foods Integrated Dataset (CoFID) — verified 12 October 2026

The UK's own reference dataset, and a better fit than USDA for a UK diet.

| | |
| --- | --- |
| Availability | Free download from GOV.UK, no registration |
| Latest edition | **CoFID 2021**, last updated 19 March 2021. Only 2015, 2019 and 2021 releases exist |
| Format | **Excel only** — a 4.42 MB `.xlsx` plus a separate "old foods" workbook and a 37-page PDF guide. No CSV, no JSON, no API |
| Nutrients | Per 100 g (per 100 ml for alcoholic drinks): protein, fat, carbohydrate, kcal and kJ, starch, total sugars, two fibre measures, saturated / mono / poly / trans fats, cholesterol — plus inorganics, vitamins, fatty acid fractions and organic acids |
| Publisher | Public Health England |

**The blocker: the licence position is not stated.** GOV.UK's page footer carries the site-wide
"Open Government Licence v3.0, except where otherwise stated", but that is boilerplate on every
page. The CoFID page itself has no dataset-specific licence or re-use statement, and the 2021
user guide carries only "© Crown copyright 2021" with no terms of use at all.

Against that, the older FSA-era user document for the same dataset imposed far tighter terms:
in-house use only, one copy on one computer, and explicitly may not "sell or distribute the Data
in whole or in part… to any third party" or use it "to produce other products of any kind"
without written permission, with re-use requiring a paid Click-Use licence. Those terms name
HMSO, OPSI and the Click-Use scheme, all of which OGL replaced, so they are almost certainly
superseded — but no current page says so, and **bundling the dataset into a shipped app turns
on exactly that point.**

Two further gaps: the number of food items is not stated anywhere (count the rows), and **PHE was
abolished in October 2021**, after this publication, with no page naming who inherited it — so
there is no obvious body to ask.

### USDA FoodData Central — challenged

The PRD's search order treats USDA as the fallback after Open Food Facts. That misreads what it
is for. It is a US dataset: UK branded packaging is largely not in it, so it is no help at all
for the thing Open Food Facts is already doing. What it is good at is generic foods — chicken
breast, rice, a banana — which is a different job, and one CoFID does for a UK diet.

It also needs an API key, unlike Open Food Facts. **Not verified this session** — check before
relying on it either way.

## 2. Branded lookups — call Open Food Facts from the phone

Verified against the API documentation on 12 October 2026:

- **Reads need no API key or account.** Only a custom `User-Agent` of the form
  `AppName/1.0 (contact@email)`.
- **Rate limits are 15 requests/minute per IP** for product reads, and **10/minute for search**,
  with the docs explicitly warning against search-as-you-type — "you would be blocked very
  quickly". That constrains the F5 search design directly.
- **"If your requests come from your users directly (ex: mobile app), the rate limits apply per
  user."** So each phone gets its own budget.
- The data is **ODbL 1.0**, contents **DbCL 1.0**, images **CC BY-SA**. Attribution is a real
  obligation; the exact required wording is not on the API page.
- They ask reusers to fill in an API usage form, and offer a staging environment for development.
- There is an official **openfoodfacts-react-native** SDK. Not examined.

**This kills the PRD's stated reason for a backend.** Line 200 justifies server-side lookups as
keeping API keys private — Open Food Facts has no key to keep. And a naive proxy would be
*worse* than no proxy: it funnels every user through one IP and one 15/minute budget, where
direct calls give each user their own.

## 3. The diary — a local store

Still undecided between MMKV and SQLite, and the shape differs from setup: setup is one record,
a diary is many days and many entries. See ADR-0007 for the seam this sits behind.

This is the one actually blocking Scranly from being usable, because every save in `Root.tsx` is
currently `navigation.goBack` and nothing is written anywhere.

## 4. A backend — what it is actually for, and what it costs

Not food data. Identity, invites, the shared food library and sync between devices.

Supabase is a defensible choice when that time comes — Postgres, auth and row-level security in
one box, with a free tier adequate at this scale. Firebase, PocketBase or plain Postgres on a VPS
would also serve. The choice matters far less than when it is made.

**The cost is not money.** Two sentences are shown to users today:

| Where | What it says | Survives a backend? |
| --- | --- | --- |
| `AboutYou.tsx:52` | "Used once, to work out what your body needs. It never leaves your phone." | **No.** A hosted profile makes it false |
| `Settings.tsx:98` | "…nothing here sells your diary on. That is the whole business model." | **Yes.** Hosting is not selling |

The Settings line is a promise about the business model and is safe. The About you line is about
the architecture and breaks. It is also the first substantive thing a new user reads. ADR-0007
caught a quieter version of this: anything that survives a wipe lives off-device, and that
sentence then has to say what goes and what does not.

The fix may be smaller than it sounds — the sentence is specifically about the profile collected
on that screen, so it could become honest again by being precise rather than by being deleted.
But it has to change, deliberately, and not be discovered afterwards.

## Recommendation, not a decision

Start at number 2. An Open Food Facts client called from the phone needs no backend, no account,
no money and no change to the privacy copy, and it turns the barcode path from a 1.4-second timer
and a hardcoded Cathedral City into a real lookup. It also gives ADR-0006's failure states
something real to catch for the first time.

Number 3 is the one blocking daily use, and number 4 can wait for invites, which ADR-0007 already
argued is where reinstalls get properly solved.

## Research still to do

- [ ] **The kitchen test** — PRD line 160 makes it a gate: scan ten items from the cupboard on the
      Open Food Facts site, 7 or more found and correct and the plan holds. Still unticked at line
      247, and it is half an hour's work. It decides whether Open Food Facts carries the packaged
      half at all.
- [ ] **CoFID licensing** — whether the dataset may be bundled in a shipped app. Needs a direct
      enquiry; the Open Government Licence v3.0 text at the National Archives is the first place
      to look, and the post-PHE publisher has to be identified before anyone can be asked.
- [ ] **How many foods CoFID contains**, by counting rows in the `.xlsx`.
- [ ] **Whether USDA FoodData Central requires an API key**, and whether it earns a place at all
      once CoFID is on the table.
- [ ] **The exact Open Food Facts attribution wording** required by ODbL, and where it goes on
      screen.
- [ ] **The `User-Agent` question on Android** — React Native's `fetch` honours a custom
      User-Agent on iOS; some Android stacks override it. Needs checking at runtime, because
      Open Food Facts asks for one on every request.
- [ ] **What the About you sentence should say** under each option.

## Not decided here

All of it. Which sources, where each lives, whether there is a backend, and when.

## Sources

- Open Food Facts API documentation: https://openfoodfacts.github.io/openfoodfacts-server/api/
- Open Food Facts rate-limit policy discussion:
  https://github.com/openfoodfacts/openfoodfacts-server/issues/8818
- CoFID on GOV.UK:
  https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid
- CoFID 2021 user guide:
  https://assets.publishing.service.gov.uk/media/60538e66d3bf7f03249bac58/McCance_and_Widdowsons_Composition_of_Foods_integrated_dataset_2021.pdf
- The obsolete FSA-era CoFID user document, for the older terms:
  https://www.fao.org/uploads/media/British_FCDB_cof_user_doc.pdf
