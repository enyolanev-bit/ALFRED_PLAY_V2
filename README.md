##  AI-Assisted Development — Prompt Hierarchy

This project uses Claude Code (Anthropic) as a development co-pilot, orchestrated through a **4-layer prompt hierarchy** inspired by LLM architecture principles (MIT Professional Education — Module 4.4).

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│   LAYER 1 — Constitution (Super System Message)       │
│                                                         │
│  CLAUDE.md                                              │
│  ├── Design rules (3 colors, 2 fonts, asymmetric)       │
│  ├── File conventions (naming, imports, structure)       │
│  ├── Forbidden patterns (no inline styles, no jQuery)    │
│  ├── GPU tier behavior (0-3 adaptation)                 │
│  └── Trigger keywords → load conditional docs           │
│                                                         │
│  Always loaded. Every session. ~3.5KB = ~900 tokens.    │
├─────────────────────────────────────────────────────────┤
│   LAYER 2 — Conditional Context (System Messages)     │
│                                                         │
│  docs/.md — Loaded on trigger, not by default          │
│  ├── product-brief.md    (@product)                     │
│  ├── architecture.md     (@architecture)                │
│  ├── design-system.md    (@design)                      │
│  ├── sprint-plan.md      (@sprint)                      │
│  └── status-report.md    (@status)                      │
│                                                         │
│  .bmad/ — 21 specialized AI agent personas              │
│  ├── product-manager.md                                 │
│  ├── architect.md                                       │
│  └── frontend-dev.md                                    │
│                                                         │
│  Loaded only when relevant. Saves context window.       │
├─────────────────────────────────────────────────────────┤
│   LAYER 3 — User Prompts                              │
│                                                         │
│  Terminal commands in Cursor / Claude Code               │
│  "Add parallax effect to Scene1980 Game Boy"            │
│  "Fix race condition in init.js"                        │
│  "Create GLTF loader with DRACO fallback"               │
├─────────────────────────────────────────────────────────┤
│   LAYER 4 — Generated Output                          │
│                                                         │
│  Code committed to git (co-authored with Claude Opus)   │
│  ├── src/lib/core/.js                                  │
│  ├── src/lib/scenes/Scene*.js                           │
│  ├── src/lib/config/decades.js                          │
│  └── README.md, CHANGELOG                               │
│                                                         │
│  Output becomes input: committed code updates           │
│  the project context for the next session.              │
│  This is the feedback loop.                            │
└─────────────────────────────────────────────────────────┘
```

### Why This Matters

Traditional development: developer reads docs → writes code → commits.

AI-assisted development: the **context window IS the documentation**. CLAUDE.md is not a README for humans — it's a pre-loaded memory for the AI. Every rule in CLAUDE.md is a token carefully budgeted to maximize code quality without exceeding the context limit.

### Ethical Design

- **Zero data collection** — No analytics, no tracking, no cookies
- **GPU-adaptive rendering** — detect-gpu (tiers 0-3) adapts scene complexity to user hardware
- **AI Control Level 2-3** — Claude generates code, human reviews and commits. No autonomous deployment.
