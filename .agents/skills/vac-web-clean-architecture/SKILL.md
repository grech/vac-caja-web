---
name: vac-web-clean-architecture
description: Clean code, SOLID, Clean Architecture, small refactors, and maintainability guidance for Vac Web.
---

# Vac Web Clean Architecture Skill

...resto del contenido...

# Vac Web Clean Architecture Skill

## Purpose

Guide clean code, maintainability, and small refactors for Vac Web.

This skill applies to:

- Next.js App Router pages
- React components
- Supabase browser integration
- frontend actions/services
- feature organization
- small refactors

This skill does NOT apply to:

- Supabase Edge Functions
- SQL migrations
- mobile cashier app
- infrastructure provisioning

---

## Core Principles

Build Vac Web with:

- small files
- clear responsibilities
- explicit types
- minimal abstractions
- incremental refactors
- readable code
- feature-oriented organization

Use SOLID and Clean Architecture as guidance, not as ceremony.

Do not over-engineer early.

---

## Repository Structure

Vac Web currently uses root-level structure:

app/
lib/
components/
features/
types/

Do not introduce src/ unless explicitly approved.

Keep App Router files under:

app/

Shared browser integrations belong in:

lib/

Reusable UI components belong in:

components/

Business capability code belongs in:

features/

Shared types may live in:

types/

---

## Page Responsibility

Next.js pages should be thin.

Pages may:

- read route params
- compose components
- call local hooks/actions
- handle simple loading/error states

Pages should not grow into large files with:

- complex business logic
- repeated API parsing
- large JSX blocks
- unrelated UI sections
- duplicated validation logic

When a page gets too large, refactor gradually.

---

## Refactor Rule

Refactor only when there is a reason.

Good reasons:

- file becomes hard to read
- same UI appears in multiple places
- same API/error mapping repeats
- tests become hard to write
- business logic is mixed with UI

Bad reasons:

- architecture preference
- premature layering
- theoretical purity
- creating folders before features exist

---

## Refactor Size

Prefer small refactors.

One refactor should usually:

- move one component
- extract one helper
- create one type file
- isolate one action/service

Avoid large rewrites.

Do not combine feature work and refactor work unless explicitly requested.

---

## Feature Folder Pattern

When a feature becomes non-trivial, use:

features/<feature-name>/
actions/
components/
services/
types.ts

Example:

features/customer-join/
actions/create-customer-loyalty-account.ts
components/JoinForm.tsx
components/CustomerCardPreview.tsx
types.ts

Do not create all folders upfront.

Create only what the feature needs.

---

## Supabase Browser Rule

Frontend code may use:

lib/supabase-browser.ts

Allowed browser operations:

- Supabase Auth
- invoking Edge Functions
- authenticated reads if RLS allows it

Avoid direct browser reads from protected tables for public pages.

For public pages, prefer public Edge Functions that return safe DTOs.

Never use service_role keys in web code.

---

## Edge Function Integration

Frontend should treat Edge Functions as API contracts.

Each function call should have:

- typed request
- typed success response
- typed error response
- friendly UI error message

Do not scatter raw invoke calls everywhere once calls repeat.

When Edge Function usage repeats, extract a small action/service.

---

## Error Handling

Use typed and friendly handling.

Backend error shape:

{
success: false,
code?: string,
error: string
}

Frontend should:

- preserve code when useful
- show friendly Spanish copy
- avoid leaking raw technical errors to final users
- log only when useful during development

---

## TypeScript Rules

Use explicit types for:

- Edge Function request payloads
- Edge Function responses
- form state
- branding data
- customer card data
- dashboard summaries

Avoid:

- any
- broad unknown without narrowing
- duplicated inline response shapes

---

## Component Rules

Components should be:

- small
- named clearly
- presentational when possible
- free from Supabase calls unless explicitly a smart component

Prefer:

- props in
- UI out

Avoid components that:

- fetch data
- mutate state
- perform navigation
- contain unrelated sections

unless they are route-level containers.

---

## SOLID Guidance

Use SOLID pragmatically:

### Single Responsibility

Each file should have one clear reason to change.

### Open/Closed

Prefer extension through small helpers/components rather than editing large files repeatedly.

### Liskov

Do not create inheritance hierarchies for React UI.

### Interface Segregation

Prefer small specific types over huge generic interfaces.

### Dependency Inversion

UI should depend on small actions/services, not direct backend details, when complexity grows.

---

## Clean Architecture Guidance

Preferred dependency direction:

page
→ feature component/hook
→ action/service
→ lib/supabase-browser

Do not make low-level infrastructure depend on UI.

---

## Testing And Validation

For every meaningful change run:

npm run lint
npx tsc --noEmit

If behavior changes, include manual test steps.

Do not claim validation passed unless commands actually ran.

---

## Forbidden Behaviors

Do not:

- introduce src/
- add unnecessary libraries
- create large design systems early
- rewrite working pages
- mix backend and frontend changes
- expose service_role
- bypass Edge Functions for critical writes
- expose technical IDs in user-facing UI
- implement PassKit early
- implement QR rotation early
- implement offline mode early
