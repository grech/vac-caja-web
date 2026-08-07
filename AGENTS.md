# AGENTS.md — VAC Caja Web

## Purpose

This file defines the repository-level operating rules for Codex and other coding agents working in VAC Caja Web.

These instructions are permanent defaults for this repository unless Memo explicitly overrides them in a task-specific prompt.

Main goals:

- preserve repository boundaries;
- keep Caja Web focused on the minimum operational contingency/testing experience;
- reuse approved backend contracts instead of duplicating business logic;
- use available skills when they materially help the task;
- prefer the smallest complete safe change;
- avoid scope drift, speculative refactors, and unauthorized hosted actions;
- keep every change easy to review and audit.

---

# 1. Repository identity

This repository is:

```text
/home/memo/devStrada/personal/GuayabaSoft/products/Vac/web/vac-caja-web
```

Repository responsibility:

```text
VAC Caja Web
Browser-based operational client
Owner + Cashier
Testing + contingency / redundancy surface
```

Before any task that may modify files, run:

```bash
pwd
git rev-parse --show-toplevel
git status --short
```

The resolved Git root must exactly match:

```text
/home/memo/devStrada/personal/GuayabaSoft/products/Vac/web/vac-caja-web
```

Otherwise stop immediately with:

```text
BLOCKED — WRONG REPOSITORY CONTEXT
```

Do not navigate into another sibling repository and continue silently.

---

# 2. Product role of Caja Web

Caja Web is not a replacement for Owner Web and is not a second administration dashboard.

Its intended role is a minimal browser-based operational surface for:

- testing;
- redundancy;
- contingency when native apps are unavailable;
- owner/cashier operational access where a supported browser is available.

The expected operational loop is conceptually:

```text
login
→ resolve membership/business
→ acquire customer QR
→ load loyalty account
→ earn points/stamps or redeem reward
→ confirm result
→ recent activity
```

Do not expand Caja Web into billing, program administration, customer administration, Wallet administration, signup, analytics, or other Owner Web responsibilities unless explicitly approved.

---

# 3. Repository ownership

## Caja Web may own

- browser UI;
- web routing/navigation;
- owner/cashier authentication presentation;
- browser session lifecycle;
- scanner UX;
- browser camera permission UX;
- approved manual QR fallback UX;
- safe client-side validation and normalization;
- Caja Web-specific view models;
- loading/error/empty/success states;
- calls to approved backend APIs / Supabase Edge Functions;
- browser accessibility;
- responsive layouts;
- browser compatibility handling;
- Caja Web tests;
- contingency-specific UX.

## Caja Web does NOT own

Caja Web must not become the source of truth for:

- database schema;
- SQL migrations;
- RLS;
- tenant authorization;
- backend role authorization;
- loyalty balance mutation rules;
- reward redemption rules;
- billing enforcement;
- membership enforcement;
- plan limits;
- Wallet lifecycle;
- Wallet ordering/idempotency;
- provider credentials;
- backend canonical hashes;
- server-side domain invariants.

Those responsibilities remain in backend.

---

# 4. Known sibling repositories

Backend:

```text
/home/memo/devStrada/personal/GuayabaSoft/products/Vac/sft
```

Owner Web:

```text
/home/memo/devStrada/personal/GuayabaSoft/products/Vac/web/vac-web
```

Mobile:

```text
/home/memo/devStrada/personal/GuayabaSoft/products/Vac/app/vac-app
```

Unless a task explicitly authorizes cross-repository inspection:

- do not edit sibling repositories;
- do not import from sibling repositories;
- do not silently inspect sibling internals to widen scope;
- do not copy runtime modules from them into Caja Web.

If another repository is required, stop with the most specific gate:

```text
BLOCKED — CROSS-REPO CONTRACT REQUIRED
```

or:

```text
BLOCKED — SCOPE EXPANSION REQUIRED
```

---

# 5. Cross-repository imports are forbidden

Never create imports between sibling repositories using relative or absolute source paths.

Forbidden examples:

```text
../../../../../sft/...
../../../../../web/vac-web/...
../../../../../app/vac-app/...
```

Do not modify:

- TypeScript configuration;
- bundler configuration;
- aliases;
- workspace configuration;
- module resolution;
- build include/exclude paths;

merely to consume source code from another VAC repository.

If executable shared code is genuinely required, that requires a separate approved architecture scope.

---

# 6. Skills-first rule

Before implementing a task, inspect the skills available to the current Codex environment.

If a skill clearly matches the requested work:

```text
1. Read its SKILL.md.
2. Follow its workflow where compatible with this AGENTS.md.
3. Use it only inside the authorized repository and task scope.
```

Relevant examples may include skills for:

- frontend design;
- web accessibility;
- React;
- testing;
- debugging;
- security review;
- performance;
- documentation;
- code review.

Do not use a skill merely because it exists.

A skill must not:

- widen scope;
- authorize another repository;
- authorize hosted changes;
- override approved product behavior;
- introduce unnecessary dependencies;
- bypass repository boundaries.

Priority when instructions differ:

```text
explicit task instructions
→ AGENTS.md
→ skill guidance
```

subject to higher-level system instructions.

---

# 7. Scope discipline

Work only on the active objective.

Do not:

- investigate unrelated bugs;
- refactor adjacent modules without necessity;
- add speculative features;
- redesign unrelated surfaces;
- create abstractions only for hypothetical future reuse;
- turn an audit into an implementation;
- turn a small implementation into a general rewrite.

Secondary findings should be recorded briefly as separate follow-ups.

Do not implement them without explicit approval.

Permanent principle:

```text
Minimum safe change that completely closes the requested objective.
```

---

# 8. Product decisions are not agent decisions

Do not silently decide:

- new owner/cashier permissions;
- new roles;
- new login identity formats;
- signup behavior;
- Google Auth scope;
- offline mutation behavior;
- scanner semantics that alter business operation;
- reward rules;
- membership behavior;
- Wallet provider strategy;
- new backend dependencies.

If a required product decision is missing, stop with:

```text
BLOCKED — PRODUCT DECISION REQUIRED
```

State exactly what decision is required.

---

# 9. Authentication contract

Caja Web should preserve the approved unified login experience.

Visible input:

```text
Usuario o correo
```

Owner:

```text
uses the owner's real email
```

Cashier:

```text
uses the visible alias:

<login_username>@<cashier_login_code>
```

Example:

```text
cajero-plaza@chavitos-club-kyht2sts
```

The deterministic synthetic cashier Auth identity is an internal implementation detail.

It must not be exposed in normal UI, logs, or user-facing errors.

Do not introduce, unless explicitly authorized:

- a separate cashier login screen;
- a role selector;
- another authentication provider;
- another user table;
- another cashier identity format.

---

# 10. Membership and authorization boundary

Authenticated identity alone does not define business access.

Conceptually:

```text
Supabase Auth user
→ profile
→ business_members
→ business
→ role
→ status
→ operational experience
```

Caja Web may use membership information to drive UX.

Caja Web must not treat client-side checks as the security boundary.

Backend/RLS/Edge Functions remain authoritative for sensitive operations.

---

# 11. Backend integration boundary

Caja Web should consume approved serialized request/response contracts.

Relevant operational Edge Functions may include:

```text
scan-loyalty-account
update-points
redeem-reward
get-recent-loyalty-events
```

Exact contracts must be verified from approved evidence before implementation.

Do not recreate their server-side rules in Caja Web.

Do not perform direct client writes that independently mutate:

- loyalty balances;
- loyalty ledger;
- redemptions;
- subscriptions;
- membership state;
- Wallet delivery state.

---

# 12. QR acquisition

Caja Web may provide browser-based QR acquisition.

Client responsibilities may include:

- camera permission;
- QR-only scanning;
- safe normalization;
- UX validation;
- loading state;
- repeated callback suppression;
- success/failure presentation;
- reset for the next customer.

A manual QR value input/paste may be used as a contingency fallback only when included in the approved task scope.

Client-side UUID/QR validation is UX protection only.

Backend remains authoritative.

Do not transmit or persist unnecessary camera imagery.

---

# 13. Contingency boundary

Caja Web can provide redundancy for:

- unavailable native app;
- device incompatibility;
- native installation problems;
- native camera/app problems;
- access from a browser-equipped computer/tablet.

Caja Web does not automatically provide redundancy for:

```text
Supabase outage
backend outage
network outage
```

when it depends on the same backend.

Do not implement offline balance mutation, local shadow balances, or independent ledgers unless explicitly approved in a separate architecture scope.

---

# 14. Session handling

Private backend calls must use a current authenticated session.

Preserve safe behavior for:

- session restoration;
- token refresh;
- session expiration;
- logout;
- browser refresh;
- user/account switching;
- query/cache isolation.

Do not log:

- access tokens;
- refresh tokens;
- JWTs;
- passwords;
- cashier passwords;
- API secrets.

Session-expired UI should be safe and actionable.

---

# 15. Error handling

Prefer safe normalized categories such as:

- invalid credentials;
- session expired;
- network failure;
- timeout;
- invalid QR;
- account unavailable;
- membership/access restriction;
- operation rejected;
- generic unexpected error.

Do not expose:

- stack traces;
- raw auth tokens;
- synthetic cashier emails;
- unnecessary internal IDs;
- service-role data;
- provider secrets.

Do not surface raw backend text when an approved user-facing mapping exists.

---

# 16. Data minimization

Only request, cache, retain, or display data needed for Caja Web.

Avoid unnecessary exposure or persistence of:

- PII;
- Auth IDs;
- internal profile IDs;
- backend actor IDs;
- wallet internals;
- provider payloads;
- Stripe IDs;
- secrets.

Do not persist sensitive transient data without explicit authorization.

---

# 17. Dependencies

Do not add, remove, replace, or upgrade dependencies unless required by the active objective.

Before adding one:

1. Confirm the repository does not already provide the capability.
2. Check whether a relevant installed skill recommends an existing/built-in approach.
3. Prefer the smallest dependency surface.
4. Explain why it is required.

Never modify dependencies during audit-only work.

Do not modify lockfiles accidentally.

---

# 18. UI and design

Caja Web should be operationally simple, fast, and clear.

For UI changes:

- use existing primitives in this repository;
- preserve the VAC visual language where available;
- prioritize speed of operation;
- preserve keyboard usability;
- preserve accessibility;
- preserve responsive behavior;
- handle loading/error/empty/success states;
- avoid decorative complexity that slows cashier workflows.

If a relevant frontend-design or accessibility skill is available, use it before substantial visual work.

Visual changes must not alter domain behavior.

---

# 19. Browser-first considerations

Because this is a contingency web surface, explicitly consider when relevant:

- camera support;
- camera permission denial;
- no-camera devices;
- keyboard-only operation;
- touch operation;
- desktop/tablet layouts;
- page refresh;
- connection loss;
- accidental double submit;
- repeated QR callbacks;
- stale session;
- browser compatibility.

Do not promise broad browser support without evidence.

---

# 20. Tests and validation

Use validation proportional to the scope.

Prefer existing repository scripts.

Typical checks may include:

```bash
pnpm test
pnpm lint
pnpm exec tsc --noEmit
pnpm build
```

Run only commands supported by the repository.

Prefer targeted tests first when appropriate.

Do not fix unrelated pre-existing failures unless they block the requested objective.

Never claim PASS without command evidence.

---

# 21. Audit-only tasks

When a task says:

```text
audit-only
read-only
analysis-only
docs-only
```

do not edit production source.

Only create/update the explicitly authorized audit/document artifact.

Do not “fix while auditing”.

Keep separate:

```text
finding
recommendation
implementation
```

Implementation requires explicit authorization.

---

# 22. Hosted and external safety

Unless explicitly authorized, do not perform:

```text
Supabase hosted writes
db push
migration repair
Edge Function deploy
secret changes
provider calls
production mutations
DNS changes
Vercel production changes
```

Read-only hosted inspection also requires explicit authorization when the task depends on hosted state.

CLI confirmation is not equivalent to product authorization.

---

# 23. Git rules

Do not commit or push unless explicitly requested.

At task start:

```bash
git status --short
```

Preserve pre-existing user changes.

Do not:

- reset user changes;
- stash without instruction;
- revert unrelated files;
- delete untracked files blindly.

At task completion always report:

```text
git status --short
```

If files changed, list exact repository-relative paths.

---

# 24. Documentation deliverables

When documentation is requested:

- distinguish verified facts from inference;
- cite exact source paths in the repository;
- include relevant validation commands/results;
- avoid restating unrelated project history;
- keep unresolved risks limited to the active objective.

The final Codex response must explicitly include:

```text
Guardado en:
<exact path>
```

for each requested documentation artifact.

---

# 25. Stop conditions

Stop before continuing when the task requires:

```text
another repository
a cross-repository runtime import
a new shared package
a schema change outside approved scope
hosted mutation without authorization
new secrets or credentials
a provider-account change
a new product decision
substantial scope expansion
```

Use the most specific gate:

```text
BLOCKED — WRONG REPOSITORY CONTEXT
BLOCKED — CROSS-REPO CONTRACT REQUIRED
BLOCKED — SCHEMA CHANGE REQUIRED
BLOCKED — HOSTED AUTHORIZATION REQUIRED
BLOCKED — PRODUCT DECISION REQUIRED
BLOCKED — SCOPE EXPANSION REQUIRED
```

Do not silently work around a blocker.

---

# 26. Final response format

Unless the task defines another format, implementation work should end with:

```text
Result:
<short summary>

Files created/updated:
- <exact path>

Validation:
- <command>: <PASS/FAIL>

Notes:
<only relevant remaining information>

git status --short:
<exact output>
```

Do not hide failures.

---

# 27. Permanent operating principle

```text
Preserve repository boundaries.
Keep backend rules in backend.
Keep Caja Web minimal and operational.
Use skills when they materially help.
Do not widen scope silently.
Prefer the smallest complete safe change.
```
