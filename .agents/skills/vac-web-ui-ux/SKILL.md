---
name: vac-web-ui-ux
description: UI/UX guidance for Vac Web customer experience, owner auth, onboarding, backoffice, branding, and KPI screens.
---

# Vac Web UI/UX Skill

...resto del contenido...

## Purpose

Guide UI/UX decisions for Vac Web.

Vac Web includes:

- public customer join pages
- customer card experience
- owner sign in / sign up
- owner dashboard
- business onboarding
- loyalty program setup
- rewards management
- branding configuration
- basic KPIs

This skill applies only to Vac Web.

Do not apply this skill to:

- Supabase Edge Functions
- SQL migrations
- mobile cashier app
- backend hardening

---

## Product Philosophy

Vac should feel:

- simple
- modern
- friendly
- trustworthy
- fast
- approachable for local businesses

Vac should NOT feel:

- enterprise-heavy
- corporate
- complicated
- overloaded
- generic SaaS dashboard

The product promise is:

"Vac is simple for the business and simple for the customer."

Every UI decision should reduce friction.

---

## User Types

### Final Customer

The final customer:

- does not want to install an app
- does not want to create a complex account
- wants to join quickly
- wants to see their card immediately
- wants to know how to use the QR

Prioritize:

- short flows
- minimal fields
- clear confirmation
- mobile-first layouts
- friendly copy

---

### Business Owner

The owner:

- wants setup to be easy
- wants to see if Vac is working
- wants basic metrics
- wants to configure rewards and branding
- may not be technical

Prioritize:

- clear onboarding
- guided steps
- obvious primary actions
- simple dashboard
- plain language
- low cognitive load

---

### Cashier

Cashier operations are handled in the mobile app, not Vac Web.

Do not design cashier scanner workflows inside Vac Web unless explicitly requested.

---

## Visual Direction

Use a clean and premium-but-simple SaaS visual style.

Recommended feel:

- white or soft neutral backgrounds
- rounded cards
- clear hierarchy
- generous spacing
- soft borders
- restrained shadows
- one strong accent color
- mobile-first layouts

Avoid:

- heavy gradients
- excessive animations
- dense tables too early
- complex sidebars before needed
- icon overload
- overly corporate dashboards

---

## Branding Rules

Vac Web must support business-specific branding.

The customer-facing Join Page and Card experience should feel like the customer is joining the business, not Vac.

Use business branding when available:

- business name
- loyalty program name
- card title
- logo
- accent color
- background color
- foreground color
- label color

Use safe fallbacks when branding is missing:

- primary color: #F59E0B
- logo: circular placeholder with first letter
- card title: loyalty program name
- card description: "Tu tarjeta digital de lealtad."

Do not hardcode business-specific branding permanently.

---

## Public Join Page UX

The Join Page should:

- hide technical IDs
- show business/program identity
- require minimal customer input
- explain why the user is registering
- clearly show what happens next
- avoid technical language like wallet provider, UUID, account ID

Required mental model:

"Create my loyalty card"

Not:

"Create customer loyalty account"

---

## Customer Card UX

The customer card should:

- look like a digital loyalty card
- show business name
- show loyalty program/card title
- show QR clearly
- explain how to use it
- avoid exposing internal IDs beyond the QR itself
- avoid showing mock URLs as primary content

Wallet mock URLs may be shown only as subtle debug text during MVP/dev.

---

## Owner Auth UX

Owner auth should be simple:

- one page may contain sign in and sign up modes
- Spanish copy
- minimal required fields
- clear errors
- clear post-signup state

Do not ask for business details during auth unless explicitly requested.

Business onboarding comes after authentication.

---

## Owner Dashboard UX

The first dashboard should not be an enterprise analytics product.

Start with:

- welcome message
- business setup state
- next recommended action
- customers count
- rewards count
- recent activity
- generate join QR later

Avoid advanced analytics until the basic flow works.

---

## Copy Rules

Use Spanish for user-facing UI.

Tone:

- clear
- warm
- direct
- non-technical

Prefer:

- "Crear mi tarjeta"
- "Únete al programa de lealtad"
- "Muestra este QR en el negocio"
- "Configura tu programa"

Avoid:

- "customer_loyalty_account"
- "wallet_provider"
- "RPC"
- "business_id"
- "loyalty_program_id"

---

## Responsiveness

All public customer flows must be mobile-first.

Owner dashboard should work well on desktop but remain usable on tablets.

Use simple responsive layouts before complex app shells.

---

## Dependency Rules

Do not add UI libraries unless explicitly approved.

Use:

- React
- Next.js
- Tailwind

Do not add:

- component libraries
- icon packs
- animation libraries
- QR libraries

unless the task explicitly requires it.

---

## Implementation Boundaries

This skill may influence:

- app/\*
- components/\*
- features/\*
- styles
- Tailwind classes
- copy
- layout
- form presentation

This skill must not modify:

- supabase/functions
- SQL
- migrations
- mobile app
