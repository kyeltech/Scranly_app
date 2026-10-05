# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

Resolve the glossary in this order — the root tells you which layout you're in:

1. **`CONTEXT-MAP.md`** at the repo root, if it's there. This is a multi-context repo: the map is the index of contexts. Read it first, pick the contexts your topic touches, then read each of their `CONTEXT.md` files. Read only those — a multi-context repo can hold dozens, and reading all of them is how you burn a context window on vocabulary you don't need.
2. **`CONTEXT.md`** at the repo root otherwise. Single context; this one file is the glossary.
3. **`docs/adr/`** — read ADRs that touch the area you're about to work in. In multi-context repos, root `docs/adr/` holds system-wide decisions; also read any `docs/adr/` sitting next to a context's own `CONTEXT.md`.

**Never guess a context's path.** Contexts live wherever this repo puts them — `packages/*`, `apps/*`, `services/*`, `libs/*`, `src/*`, or something else entirely. `CONTEXT-MAP.md` carries the real paths; if the map is present, its links are the only source of truth for where a context lives.

If any of these files don't exist, **proceed silently**. Don't flag their absence; don't suggest creating them upfront. The `/domain-modeling` skill (reached via `/grill-with-docs` and `/improve-codebase-architecture`) creates them lazily when terms or decisions actually get resolved.

## File structure

Single-context repo (most repos):

```
/
├── CONTEXT.md
├── docs/adr/
│   ├── 0001-event-sourced-orders.md
│   └── 0002-postgres-for-write-model.md
└── src/
```

Multi-context repo (presence of `CONTEXT-MAP.md` at the root). The directory names below are one repo's choice, not a convention to expect — read the map for the real paths:

```
/
├── CONTEXT-MAP.md                     ← the index; the only source of truth for paths
├── docs/adr/                          ← system-wide decisions
├── packages/
│   ├── ordering/
│   │   ├── CONTEXT.md
│   │   └── docs/adr/                  ← context-specific decisions
│   └── billing/
│       ├── CONTEXT.md
│       └── docs/adr/
└── apps/
    └── admin-web/
        └── CONTEXT.md
```

A context is a unit of domain language, not a build unit — one context may span several packages, and a package may hold none. The map records the mapping; don't infer it from the directory tree.

## Use the glossary's vocabulary

When your output names a domain concept (in an issue title, a refactor proposal, a hypothesis, a test name), use the term as defined in `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If the concept you need isn't in the glossary yet, that's a signal — either you're inventing language the project doesn't use (reconsider) or there's a real gap (note it for `/domain-modeling`).

## Flag ADR conflicts

If your output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
