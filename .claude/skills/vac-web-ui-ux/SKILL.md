---
name: vac-ui-ux
description: Canonical UI/UX and visual-language guidance for VAC web surfaces, including Landing, Owner Web, customer-facing web flows, and Caja Web. Use it to keep one coherent VAC family while preserving each surface's product role and repository boundary.
---

# VAC UI/UX & Visual Language Skill

## Purpose

Guide UI/UX, visual-language, content hierarchy, interaction polish, and presentation decisions across VAC web surfaces.

The goal is **not** to make every VAC surface identical.

The goal is:

> One VAC visual family, with different modes for different jobs.

This skill covers:

- `vacloy.com` — public marketing / corporate Landing
- `app.vacloy.com` — Owner Web / customer-facing web
- public Join / customer card / Recovery flows
- owner auth and onboarding
- Owner Web dashboard and configuration surfaces
- loyalty program setup, rewards, branding, billing, customers and insights
- `caja.vacloy.com` — Caja Web operational cashier surface

This skill does **not** authorize backend, database, Wallet runtime, Stripe runtime, Mobile, cloud-provider, hosted, or cross-repository changes.

Repository boundaries always remain in force.

---

# 1. Core Product Philosophy

VAC should feel:

- simple
- modern
- friendly
- trustworthy
- fast
- approachable for local businesses
- premium without feeling luxury-oriented
- designed, not templated
- useful before impressive

VAC should **not** feel:

- enterprise-heavy
- corporate
- complicated
- overloaded
- generic SaaS
- overly technical
- dashboard-first
- icon-heavy
- gradient-heavy
- visually noisy

Core promise:

> VAC should make loyalty simple for the business and simple for the customer.

For operational surfaces add:

> Fast to understand. Fast to operate. Hard to misuse.

Every UI decision should reduce friction, improve understanding, or make the next action more obvious.

---

# 2. One Brand, Different Surface Modes

Consistency means **shared language**, not repeated geometry.

VAC has four main web modes:

## Landing — Editorial / acquisition mode

Purpose:

- explain VAC
- create trust
- communicate value
- convert interest into trial/signup

Feel:

- lighter
- more editorial
- more expressive
- more whitespace
- less operational density

Do not make the Landing look like an admin dashboard.

## Owner Web — Management mode

Purpose:

- configure the business
- configure programs
- understand status
- manage customers/cashiers
- understand plan/billing
- review useful indicators

Feel:

- calm
- structured
- clear
- information-rich without feeling dense
- action-oriented

Do not make Owner Web feel like an enterprise control center.

## Caja Web — Operational mode

Purpose:

```text
Login
→ current business
→ scan customer
→ inspect account
→ earn / redeem
→ confirm result
→ recent activity
→ next customer
```

Feel:

- immediate
- focused
- fast
- clear at a glance
- touch/keyboard friendly
- highly legible
- low cognitive load

Caja Web is **not a second Owner Web**.

Do not add visual or product complexity merely to make it feel "complete".

## Customer Web — Business-branded mode

Purpose:

- join a program
- view the loyalty card
- understand progress/reward
- recover the card
- use approved Wallet actions

Feel:

- mobile-first
- business-branded
- low-friction
- friendly
- customer-oriented

Customer Web should feel like joining the business's loyalty program, not interacting with VAC infrastructure.

---

# 3. Shared VAC Visual Contract

Owner Web and Caja Web should visibly belong to the same product family.

When both surfaces are viewed side by side, they should share:

- the same VAC brand character
- the same dark-ink / neutral / warm-accent relationship
- similar typography hierarchy
- similar button geometry
- similar form-control geometry
- similar border/radius restraint
- similar status language
- similar icon discipline
- similar loading/error/success treatment
- similar focus/accessibility treatment

They do **not** need to share source files, React components, CSS files, or runtime packages.

Correct model:

```text
shared documented visual contract
→ independent implementation per repository
```

Not:

```text
vac-caja-web imports components from vac-web
```

Never use visual consistency as justification for cross-repository imports.

---

# 4. Brand Positioning

VAC is not merely a paper loyalty card moved to a screen.

Digital cards, QR codes, points, stamps, Wallet, and notifications are mechanisms.

VAC helps a local business:

- give customers a reason to return
- operate loyalty without slowing down daily work
- understand customer participation
- observe useful indicators instead of raw data
- identify what appears to be working
- make better program decisions
- maintain a loyalty program that creates value for customer and business

Preferred mental model:

> A good loyalty program should work for both: the customer and the business.

Useful language:

- “Haz que más clientes regresen.”
- “Entiende qué está funcionando.”
- “Toma mejores decisiones.”
- “Mantén un programa saludable para tus clientes y para tu negocio.”
- “Hazte presente en el momento adecuado.”

Avoid reducing VAC to:

- “digitaliza tu tarjeta de lealtad”
- “reemplaza tus tarjetas físicas”
- “software de puntos”

Those may describe parts of VAC, but not its complete value proposition.

---

# 5. Copy Rules

Use Spanish for normal user-facing UI unless a specific surface explicitly requires another language.

Tone:

- clear
- warm
- direct
- human
- practical
- non-technical
- confident without exaggeration

Prefer outcomes and actions.

Examples:

- “Crear mi tarjeta”
- “Únete al programa de lealtad”
- “Muestra este QR en el negocio”
- “Configura tu programa”
- “Escanear cliente”
- “Agregar puntos”
- “Canjear recompensa”
- “Operación completada”
- “Ver actividad reciente”

Avoid exposing implementation terminology such as:

- `customer_loyalty_account`
- `wallet_provider`
- `wallet_cards`
- `business_id`
- `loyalty_program_id`
- RPC names
- provider serials
- synthetic cashier Auth emails
- backend error text when a safe mapped message exists

For operational errors, prefer short actionable copy.

Example:

```text
No pudimos confirmar la operación.
Revisa la conexión antes de intentarlo de nuevo.
```

Do not convert uncertain operation results into false success or false failure messages.

---

# 6. Truthfulness / No Overclaiming

Do not market future product capabilities as currently available unless they are validated for the launch being prepared.

Do not claim:

- guaranteed revenue growth
- guaranteed customer growth
- guaranteed profitability
- automatic optimization
- predictive intelligence not implemented
- AI/ML recommendations as available when they are not
- silent customer location tracking

Prefer:

- “ayuda”
- “permite”
- “facilita”
- “observa”
- “entiende”
- “puede ayudarte”
- “toma mejores decisiones”

---

# 7. Color Direction

VAC uses a warm, trustworthy visual relationship:

- white / soft neutral backgrounds
- dark ink / navy typography
- VAC warm yellow/orange as the primary brand accent
- muted neutrals for structure
- semantic red/green/amber only for real status meaning

Use the warm VAC accent intentionally.

Do not make every card, icon, heading, border, and badge yellow.

Avoid generic-tech palettes dominated by:

- purple
- electric blue
- neon gradients
- cyan glow

Business-branded customer cards may intentionally use the business/program's approved colors instead of VAC's core accent.

---

# 8. Visual Direction

Use a clean, flat, premium-but-simple style.

Recommended:

- generous whitespace
- intentional typography
- clear hierarchy
- restrained radius
- thin soft borders
- little or no shadow
- flat coherent iconography
- purposeful composition
- strong primary action

Avoid:

- heavy gradients
- glassmorphism
- large soft SaaS shadows everywhere
- strongly rounded containers everywhere
- icon bubbles everywhere
- bento layouts by default
- decorative panels with no informational purpose
- excessive pills
- unnecessary animation

The objective is clarity with recognizable VAC character.

---

# 9. Typography

## Landing

Gabarito remains the approved primary typeface for the public Landing unless Memo explicitly changes that decision.

Do not reopen the Landing font during ordinary polish.

Prefer:

- display headings: medium/semibold presence
- section headings: around 600
- body: around 400
- navigation: around 500
- buttons: around 600

Prefer scale, spacing, and contrast over excessive weight.

## Owner Web and Caja Web

Product surfaces should generally preserve the repository's current product sans typography rather than inheriting Landing typography.

Owner Web and Caja Web should feel typographically related through:

- similar weight hierarchy
- similar label scale
- similar button weight
- similar readable body sizing
- similar operational emphasis

Do not import Landing fonts into product repos just for visual uniformity.

Caja Web may use monospace selectively for truly operational/code-like values, but not for normal customer names, actions, or long body copy.

---

# 10. Button Language

True VAC buttons should not default to capsule/pill shapes.

Prefer a restrained rectangle:

- radius approximately 6–8px
- visually similar to a small/medium rounded rectangle
- strong readable label
- obvious hover/focus/disabled states
- minimum practical touch height around 44px for operational/mobile contexts

Primary CTA:

- VAC warm yellow/orange surface when VAC branding is appropriate
- dark ink text
- restrained radius
- no heavy shadow

Secondary CTA:

- white/light surface
- subtle border
- dark text
- same radius family

Destructive action:

- do not use brand yellow
- use semantic destructive treatment
- require intentional wording/confirmation when consequence is significant

Semantic elements may remain pills:

- tags
- category chips
- compact badges
- status markers

Rule:

> Buttons are restrained rectangles. Semantic chips may be pills.

---

# 11. Form Controls

Across Owner Web and Caja Web, forms should feel like one family.

Use:

- clear visible labels
- restrained radius aligned with buttons
- comfortable input height
- readable text
- explicit focus state
- short supporting/help text only when useful
- inline error near the relevant field
- disabled states that remain legible

Avoid:

- unlabeled mystery fields
- floating-label complexity by default
- excessive decorative icons inside every input
- very rounded capsule inputs
- placeholder-only labeling

Caja Web forms should optimize for speed:

- fewer fields
- stronger focus order
- keyboard-friendly operation
- no unnecessary explanatory copy during repetitive cashier actions

---

# 12. Surface / Card Language

Do not wrap every piece of information inside a card.

Use a surface/card when it creates meaningful grouping.

Default product surface:

- white or neutral background
- thin border
- restrained radius, usually around 8–12px
- little or no shadow
- clear internal hierarchy

Use spacing/dividers instead of another nested card when possible.

Avoid:

```text
card
  card
    card
      pill
```

Owner Web may use grouped surfaces for configuration and summaries.

Caja Web should use fewer, stronger operational surfaces.

A cashier should quickly distinguish:

- current account/customer
- available action
- operation state
- result

without scanning a dashboard full of equal-weight cards.

---

# 13. Icons

Default icon language:

- monochromatic
- coherent weight
- no decorative bubble/container by default
- no gradient
- no multicolor treatment unless semantically required
- no shadow

Conceptual/marketing icons can be approximately 20–28px depending on context.

Functional product icons should prioritize clarity.

Do not add an icon merely because there is empty space.

Use icons for:

- recognizable actions
- navigation affordances
- status clarification
- scanner/camera affordances
- retry/refresh when helpful

Do not normalize product mockup icons through the marketing icon system.

---

# 14. Status, Badges, Notices and Feedback

VAC product surfaces should use a coherent semantic feedback model.

Common states:

- neutral / informational
- success
- warning / attention
- error / blocked
- loading / pending
- disabled / unavailable

Status color must reflect meaning, not decoration.

Badges may be compact pills when they represent true status.

Do not use badges as decorative labels for every heading.

Notices should:

- explain the state
- explain impact when needed
- provide the next action when one exists

Prefer:

```text
Tu sesión expiró. Vuelve a iniciar sesión.
```

over:

```text
UNAUTHORIZED
```

Operational confirmations in Caja Web should be unmistakable and short.

Example:

```text
Puntos agregados
+10 puntos
Balance actual: 84
```

Then provide an obvious next-customer action.

---

# 15. Loading / Empty / Error / Success States

Never design only the happy path.

For data-driven surfaces, define when relevant:

- loading
- empty
- error
- success/content
- disabled/unavailable
- retry

For Caja Web also consider:

- camera unsupported
- camera permission denied
- camera unavailable
- session expired
- network failure
- timeout / operation result not confirmed
- repeated scanner callbacks
- next-customer reset

Do not hide ambiguous operational outcomes behind a generic red error card.

The copy should distinguish:

```text
rejected
```

from:

```text
not confirmed
```

when the application contract makes that distinction.

---

# 16. Focus, Keyboard and Accessibility

Accessibility is part of polish, not a separate decoration pass.

Preserve:

- visible focus rings
- semantic buttons/links/inputs
- labels
- keyboard navigation
- reasonable contrast
- target sizes appropriate for touch
- reduced-motion preferences where motion exists

Caja Web requires extra attention to:

- keyboard-only workflows
- tablet touch use
- laptop operation
- focus restoration after actions
- avoiding unnecessary modal traps
- clear scanner permission recovery

Do not sacrifice focus visibility for visual cleanliness.

---

# 17. Responsive Rules

## Public customer flows

Mobile-first.

Support common widths such as:

- 360px
- 390–400px
- 430px

Avoid horizontal overflow and desktop layouts squeezed into one row.

## Owner Web

Desktop-first management surface that remains usable on tablets.

Avoid forcing desktop table density onto narrow layouts.

## Caja Web

Browser-first operational surface.

It should work well on:

- laptop
- tablet
- mobile browser when needed

Prioritize operational clarity over preserving desktop composition.

When space tightens:

- keep the primary action visible
- stack secondary information
- preserve customer/account identity
- preserve operation state
- never shrink critical controls below practical usability

---

# 18. Landing Content Architecture

The Landing should not over-explain simplicity.

A section should exist only if it answers a different customer question.

Recommended narrative model:

- Hero → What is VAC?
- Product flow → What does VAC bring together?
- How it works → What do I actually do?
- Business benefits → What do I gain?
- Customer experience → What does my customer do?
- Re-engagement → How can I invite customers back?
- Cashier operation → Will this slow down my business?
- Insights → How do I understand/improve the program?
- Pricing → What does it cost?
- FAQ → What objections remain?
- Final CTA → What should I do next?

If two sections answer substantially the same question, merge or remove one.

---

# 19. Marketing Card Language — Editorial Spine Cards

For conceptual marketing cards, default to the Editorial Spine Card family when a card format is appropriate.

Characteristics:

- flat surface
- white / soft neutral background
- subtle 1px neutral border when needed
- restrained radius, usually 8–12px
- little/no shadow
- one directional accent, usually left
- consistent VAC warm accent
- left-aligned content
- monochromatic icon
- no icon bubble

Example relationship:

```text
┃
┃   icon   Title
┃          Supporting copy
┃
```

Do not turn every section into this same card grid.

---

# 20. Open Workflow Pattern

Not every explanatory section should use cards.

For connected sequential concepts, prefer an open workflow.

Example:

```text
TEXT  │  ICON → ICON → ICON → ICON
```

Rules:

- subtle divider where useful
- no outer workflow card by default
- no cards around every milestone
- no decorative circles around every icon
- standalone icons
- connectors/arrows provide sequence
- generous breathing room

On mobile, convert to an open vertical sequence rather than a card stack if the relationship remains sequential.

---

# 21. Public Customer Experience

The final customer:

- does not want to install a required app
- does not want a complex account flow
- wants to join quickly
- wants to see the card immediately
- wants to know how to use it

Prioritize:

- short flows
- minimal fields
- mobile-first layout
- clear confirmation
- friendly copy
- immediate understanding of progress/reward

Required mental model:

> “Crear / recibir mi tarjeta de lealtad”

Not:

> “Create customer loyalty account”

## Join

Show:

- business/program identity
- minimal input
- reason for registration
- what happens next

Hide:

- technical IDs
- infrastructure language
- provider internals

## Customer Card

Should:

- look like a real loyalty card
- show business/program identity
- show QR clearly
- explain usage
- show progress/reward clearly
- avoid internal IDs
- avoid mock URLs

---

# 22. Business-Specific Branding

Customer-facing Join and Card experiences should primarily feel like the business's loyalty program.

Use available business/program branding:

- business name
- program name
- card title
- logo
- accent color
- background color
- foreground color
- label color

Use safe VAC fallbacks when branding is missing.

Do not hardcode one business's branding into reusable components.

VAC brand language and business-specific card branding are related but not identical systems.

---

# 23. Owner UX

The owner:

- wants setup to be easy
- wants to know what to do next
- wants to see whether VAC is working
- wants to configure rewards and branding
- may not be technical

Prioritize:

- guided setup
- clear next actions
- plain language
- low cognitive load
- obvious primary actions
- actionable indicators rather than vanity metrics
- safe edit/saved/unsaved feedback

## Owner Auth

Keep it simple:

- minimal fields
- Spanish copy
- clear errors
- clear post-signup state
- business onboarding after authentication

## Owner Dashboard

Do not turn it into an enterprise analytics suite.

Start with:

- setup/readiness
- next action
- customer/activity indicators
- program/reward state
- recent activity
- simple useful insights

## Program Setup

Preserve the existing product model and backend authority.

Conceptual setup areas include:

```text
Tipo
Reglas
Recompensas
Diseño
```

Visual polish must not bypass:

- draft/readiness state
- explicit saves
- dirty-state protection
- activation gates
- sharing gates
- governance rules

---

# 24. Caja Web UX — Operational Terminal

Caja Web is a minimum operational cashier terminal in a browser.

Product principle:

> Caja Web should feel unmistakably VAC, but more focused and operational than Owner Web.

It should not feel like a separate white-label tool or an unrelated internal utility.

## What Caja should visually inherit from VAC

- VAC logo/brand identity where appropriate
- warm accent
- dark ink hierarchy
- restrained button geometry
- restrained card radius
- thin borders
- coherent form controls
- coherent badges/status
- coherent focus states
- coherent error/success language
- similar typography rhythm

## What Caja should NOT inherit from Owner Web

Do not copy:

- administrative navigation density
- settings layouts
- billing cards
- analytics grids
- program-management patterns
- dashboard complexity
- multi-section forms

Caja should remain operationally small.

## Caja hierarchy

The cashier should understand within seconds:

1. who is logged in / current business
2. what the primary action is
3. which customer/account is loaded
4. what can be done now
5. whether the operation succeeded, failed, or remains unconfirmed
6. how to move to the next customer

## Primary action priority

At most one dominant action should compete for attention in a given operational state.

Examples:

```text
Escanear cliente
Agregar puntos
Canjear recompensa
Siguiente cliente
```

Secondary actions should remain visually subordinate.

## Customer/account result

When a QR resolves, emphasize:

- customer display name when available
- program type
- current balance/progress
- available reward when applicable
- allowed operation

Do not expose unnecessary IDs.

## Confirmation

After a confirmed mutation, the result should become the visual focus.

Examples:

```text
+10 puntos
Balance actual: 84
```

or:

```text
Recompensa canjeada
Balance restante: 20 puntos
```

Then provide a clear `Siguiente cliente` / reset action.

## Ambiguous result

When the operation cannot be confirmed because of timeout/network ambiguity, do not present the same visual treatment as a normal rejected error.

The UI should communicate uncertainty and avoid encouraging blind repeated submission.

Visual polish must not weaken existing duplicate-submit or mutation-safety behavior.

## Recent Activity

Keep Recent Activity operational, not analytical.

Show enough to answer:

- what happened
- to whom when safe/available
- earn/redeem type
- amount/progress meaning
- when it happened

Do not turn it into an analytics dashboard.

---

# 25. Cross-Surface Coherence Rules

When polishing Owner Web and Caja Web, compare them conceptually across these anchors:

## Header / identity

They should share recognizable VAC identity.

But:

- Owner Web may have broader navigation
- Caja should have minimal navigation/actions

## Buttons

Same geometry family and visual weight.

Caja can use larger operational targets.

## Inputs

Same radius/border/focus family.

Caja can use more compact copy and stronger keyboard flow.

## Cards/surfaces

Same border/radius restraint.

Owner groups management information.

Caja groups operation state.

## Status

Use the same semantic meaning for success/warning/error.

## Copy

Same clear/human VAC voice.

Owner explains configuration.

Caja explains action/result.

## Icons

Same restrained family.

Caja prioritizes function over decoration.

---

# 26. Navigation

## Landing desktop

Preferred:

- VAC logo left
- navigation links
- one primary CTA

## Landing mobile

Preferred:

- VAC logo left
- compact menu trigger right
- primary CTA inside menu

Avoid duplicate mobile CTAs.

## Owner Web

Navigation may expose the approved management areas.

Keep hierarchy understandable and responsive.

## Caja Web

Navigation must remain minimal.

Do not introduce Owner-style application navigation simply for brand consistency.

Caja's functional surface is intentionally limited.

---

# 27. Data Density

VAC should not use density as a proxy for sophistication.

Owner Web:

- moderate density
- strong grouping
- readable tables/lists where needed
- avoid excessive whitespace that makes management slow

Caja Web:

- low information density per state
- high action clarity
- only data needed to complete the operation

Landing:

- lowest operational density
- strongest narrative rhythm

Customer Web:

- minimal cognitive load
- only loyalty-relevant information

---

# 28. Motion

Motion should be restrained and purposeful.

Use motion only when it helps:

- orient state change
- reveal content
- confirm an action
- transition between operational steps

Avoid:

- decorative looping animation
- large hover transforms on operational controls
- animation that delays cashier workflow
- excessive spring effects

Respect `prefers-reduced-motion` where motion exists.

---

# 29. Dependency Rules

Do not add UI libraries unless explicitly approved.

Use each target repository's current stack and primitives.

Landing:

- Astro
- TypeScript
- Tailwind / existing CSS
- small local SVG when appropriate

Owner Web:

- React
- Next.js
- TypeScript
- Tailwind
- current local UI primitives

Caja Web:

- React
- Next.js
- TypeScript
- Tailwind
- existing Caja primitives such as Button / SurfaceCard / Badge where they remain appropriate

Do not add by default:

- component libraries
- icon packs
- animation libraries
- diagram libraries
- menu libraries
- QR libraries

unless the active task genuinely requires them and current project capabilities cannot reasonably support the requirement.

---

# 30. Repository / Implementation Boundaries

This skill describes presentation rules.

It does not override repository ownership.

Known web repositories include:

```text
Owner Web / Customer Web
/home/memo/devStrada/personal/GuayabaSoft/products/Vac/web/vac-web

Caja Web
/home/memo/devStrada/personal/GuayabaSoft/products/Vac/web/vac-caja-web

Landing
use its own confirmed repository path
```

One implementation task should target one repository by default.

This skill may influence, inside the correct target repository:

- `app/*`
- `components/*`
- `features/*`
- layouts/pages
- styles
- Tailwind classes
- copy
- responsive behavior
- form presentation
- local presentation/view models when already in scope

This skill does **not** authorize:

- Supabase Edge Function edits
- SQL
- migrations
- backend runtime
- Wallet provider code
- Stripe runtime
- Mobile edits
- cross-repository imports
- shared package creation
- hosted mutations
- deploys
- commit/push

Never copy executable components between Owner Web and Caja Web through filesystem imports.

If both surfaces need the same visual behavior, implement the same documented visual contract independently using each repository's existing primitives.

---

# 31. Do Not Let Polish Change Product Behavior

A visual task must not silently change:

- owner/cashier permissions
- authentication identity semantics
- loyalty calculations
- reward eligibility
- billing enforcement
- plan limits
- Wallet eligibility/lifecycle
- scanner semantics that change operation behavior
- duplicate-submit/idempotency rules
- session security
- provider logic

If the visual solution appears to require a product or backend contract change, stop and separate that requirement from the polish task.

---

# 32. Visual Review Checklist

Before closing any VAC visual/content task, ask:

1. Does this feel specifically like VAC rather than a generic SaaS template?
2. Is the surface easier to understand than before?
3. Did we improve hierarchy or only add decoration?
4. Are there too many rounded cards?
5. Are buttons becoming pills again?
6. Are icons restrained and coherent?
7. Is VAC yellow/orange being used intentionally rather than everywhere?
8. Are loading/error/empty/success states covered?
9. Is focus visible and keyboard use preserved?
10. Does mobile/tablet behavior remain practical?
11. Are we exposing technical/internal language?
12. Did visual polish accidentally alter domain behavior?

For Owner Web also ask:

13. Is the next management action obvious?
14. Is the screen becoming an enterprise dashboard unnecessarily?
15. Are saved/unsaved/readiness states still clear?

For Caja Web also ask:

16. Can a cashier understand the current state at a glance?
17. Is there one clear dominant action?
18. Is customer/account identity clear without exposing internal IDs?
19. Is confirmed success visually unmistakable?
20. Is an ambiguous/unconfirmed result clearly different from a rejected operation?
21. Is `Siguiente cliente` / reset obvious after completion?
22. Did we accidentally add administrative functionality?

For Landing also ask:

23. Does each section answer a distinct question?
24. Are we repeating the same value proposition?
25. Is the page visually rhythmic instead of card-grid after card-grid?

For Customer Web also ask:

26. Does the experience feel like the business's loyalty program?
27. Can the customer understand progress/reward quickly?
28. Is the flow mobile-first and low-friction?

---

# 33. Closing Principle

The desired relationship between VAC surfaces is:

```text
VAC Landing
→ expressive brand introduction

VAC Owner Web
→ calm management workspace

VAC Caja Web
→ fast operational terminal

VAC Customer Web
→ business-branded loyalty experience
```

They should not look identical.

They should look unmistakably related.

> Same VAC character. Different job. No repository coupling.
