# Caja Web — VAC Visual Family Polish, Pass 1

Status: implemented (local only, no commit)
Date: 2026-09-02
Scope: visual / presentation only. No product, auth, scanner, operation, or backend
contract behavior was changed.

Canonical guidance applied: `vac-web-ui-ux` skill (Caja principle — "unmistakably VAC,
but more focused and operational than Owner Web").

---

## 1. Problems found in the targeted preflight

| Area | Finding |
| --- | --- |
| Page / shell | Entire app rendered on a warm-yellow (`--vac-surface-warm`) background plus a diagonal white gradient. VAC accent was acting as the global background, not as emphasis. |
| Decoration | `.vac-sun` decorative yellow blob floated behind the H1 on login and the operational shell — pure decoration competing with cashier actions. |
| Radius | `--radius-brand` 14px (buttons/inputs) and `--radius-surface` 24px (cards). Both well above the restrained 6–8px / 8–12px the visual contract calls for; "strongly rounded containers everywhere". |
| Shadow | `--shadow-surface` was a heavy `0 20px 50px` drop shadow on every `SurfaceCard`; camera preview had a separate `0 24px 70px` shadow. "Large soft SaaS shadows everywhere". |
| Typography | Hero H1s at `text-7xl` (72px) and `--text-display` up to 120px — dashboard-scale type on an operational terminal. Operational page headings at `sm:text-5xl`. |
| Button language | Single `Button` (dark ink, 14px radius) used for the dominant action, the refresh utility, retry, **and** logout. No hierarchy. Operational shell showed two equally dominant dark buttons (Escanear + Cerrar sesión). Secondary actions were raw `<Link>`s with ~250-char duplicated class strings. No VAC-yellow primary. |
| Color / semantics | Semantic amber (`text-warning`) reused as a decorative eyebrow / label color for business names, loading eyebrows, reward requirements, reward names, role badges. Diluted the meaning of "warning". Ambiguous ("resultado por confirmar") operation result used the same red eyebrow as a rejected error. |
| Badge | Default badge was warm-amber-on-warm — read as a status even for neutral role/type labels. |

## 2. What was changed

### Tokens — `app/globals.css`
- `--radius-brand` 0.875rem → **0.5rem**; `--radius-surface` 1.5rem → **0.75rem**.
- `--shadow-surface` heavy drop → **`0 1px 2px rgb(32 33 36 / 5%)`**; `--shadow-brand` softened to `0 1px 2px`.
- `--text-display` `clamp(3.75rem, 11vw, 7.5rem)` → **`clamp(2.25rem, 6vw, 3.25rem)`**; `--tracking-display` -0.055em → -0.04em.
- `html` / `body` background → **`--vac-surface-soft`** (neutral). Removed the yellow gradient.
- Removed the `.vac-sun` rule and its two media-query blocks.

### Buttons — `components/ui/button.tsx`
- Added `variant`: `primary` (VAC yellow surface, dark ink), `secondary` (white, thin border — **new default**), `ghost` (low-emphasis text, for session/destructive).
- Exported `buttonClassName(variant, className)` so `<Link>` call-to-actions share the exact geometry instead of copy-pasted class strings.
- Applied across the app: dominant action per state = `primary` (Iniciar sesión, Escanear cliente, Activar cámara, Registrar compra / Agregar sellos, Canjear recompensa, Reintentar, Volver a escanear); utilities (Actualizar, post-success "Escanear otro") = `secondary`; `Cerrar sesión` = `ghost`.

### Surfaces
- `SurfaceCard`: border `border-border-subtle` → `border-border` (definition now comes from the border, not a shadow).
- `qr-camera`: hardcoded `rounded-[1.5rem]` / `rounded-[1.25rem]` / inline shadow → `rounded-surface` / `rounded-brand`, thin border, no heavy shadow. Yellow viewfinder frame kept (functional affordance).

### Color / semantics
- `Badge` default → neutral (`text-muted-strong` on `bg-surface-soft`, `border-border`). The `CajaFrame` "ready" success override still applies.
- Decorative `text-warning` eyebrows/labels → `text-muted-strong` (business-name context eyebrows on scan + activity, loading eyebrows, reward-requirement annotation) or `text-ink` (reward name in the activity feed).
- Ambiguous operation result eyebrow ("Resultado por confirmar") → **amber** instead of danger-red, so an unconfirmed result no longer looks identical to a rejected one. The amber "no reenvíes" caution box is unchanged.
- Genuine status colors kept: `text-success` ("Cuenta encontrada", "Operación completada", "Caja lista"), `text-danger` (rejected / stopped), amber caution box for ambiguous retries.

### Typography
- Hero H1s (`login-screen`, `operational-shell`) `text-5xl sm:text-7xl` → `text-4xl sm:text-5xl`.
- Operational headings (`scanner-screen`, `activity-screen`) `text-3xl sm:text-5xl` → `text-2xl sm:text-3xl`.
- Status card headings `text-3xl` → `text-2xl sm:text-3xl`; balance numbers `text-6xl` → `text-5xl` (still the visual focus of the result).

## 3. What was deliberately NOT changed

- No auth, cashier-identity, membership, QR/scanner, earn/redeem, idempotency,
  duplicate-submit, timeout, or recent-activity contract behavior. No copy that
  carries operational meaning was reworded.
- `use-qr-camera.ts` (already modified in the working tree before this pass) was left
  untouched.
- No new dependencies, no config/tsconfig/next.config/alias changes.
- `MembershipState` eyebrow kept amber — its states ("Acceso pendiente", "Selección
  requerida", boundary errors) are genuine attention states.
- The warm "looking-up" / selected-reward / ambiguous-caution surfaces keep
  `bg-surface-warm` — intentional, meaningful accent use.
- `SurfaceCard` count/structure kept as-is (they group real operation state); only
  their weight was reduced. A later pass could merge the two side-by-side cards in
  `ScanResultCard` if desired.
- No sidebar / admin navigation introduced.

## 4. Validation

| Check | Result |
| --- | --- |
| `pnpm test` (vitest) | PASS — 31 files, 152 tests |
| `pnpm lint` (eslint) | PASS — clean |
| `pnpm exec tsc --noEmit` | PASS — clean |
| `pnpm build` (next 16 / turbopack) | PASS |
| `git diff --check` | PASS — no whitespace errors |

Manual `vac-web-ui-ux` Caja checklist: feels specifically VAC (yellow primary + brand
mark on a calm neutral shell); one dominant action per operational state; no admin UI
added; no internal IDs exposed; success stays unmistakable (`text-success` + large
balance); ambiguous result now visually distinct from a rejected failure (amber vs
red); "Escanear otro" / reset still obvious; focus rings unchanged and visible;
no product behavior changed.

## 5. Blocked / needs a product decision

None. Every item in scope was visual and was implemented.

---

# Pass 1 — v2 addendum (brand assets, warmth, typographic voice)

Date: 2026-09-02. Same UI-only scope. Driven by a visual diff against the marketing
landing (REF-A) plus the current signed-in Caja state (REF-B).

## Seed findings — outcome

| # | Seed hypothesis | Outcome |
| --- | --- | --- |
| 1 | Header renders a text-in-box "VAC" chip, not the real icon mark. | **Confirmed.** Real transparent brand assets now exist in this repo at `public/images/` (`vac-logo-horizontal.webp`, `vac-logo.webp`, `vac-logo-icono.webp`, `vac-isotype-navy.webp`, `vac-isotype-white.webp`, `vac-word-mnark.webp`) plus `public/favicon.ico`. `VacBrand` now renders `vac-logo-horizontal.webp` (icon + wordmark) via `next/image`. No CSS/text approximation, no recolor, no crop. |
| 2 | Micro-labels use a monospace, wide-tracked, uppercase "dev-tool" voice. | **Confirmed.** `--tracking-system` 0.11em → 0.06em; `font-mono` removed from every kicker/eyebrow/footer label (kept only on the activity-feed timestamp, a genuine tabular value). Labels stay short, uppercase, `text-xs font-semibold` in the sans family. No wording changed, no status semantics touched. |
| 3 | Surface is near-stark white/gray; REF-A uses warm cream/peach. | **Confirmed.** New token `--vac-surface-page: #faf7f1` (warm paper) for `html`/`body`; `--vac-surface-soft` retuned `#f8f9fa` → `#f6f4ef` so secondary fills sit in the same warm family. Cards stay pure `--vac-surface` white, so depth now comes from a warm-paper / white-card relationship instead of shadows. Accent yellow still reserved for the primary button and true emphasis. |
| 4 | Outlined status pills have no canonical counterpart. | **Partly refuted.** `vac-web-ui-ux` documents no rigid badge component — only "compact pills for true status, semantic colour, not decorative". `Badge` was already neutralised in v1; v2 only drops its `font-mono` so it matches the new label voice. |
| 5 | Thin dark bar at the top of REF-B. | **Refuted / excluded.** Not application chrome — `app/layout.tsx` renders no such element. It is the Next.js dev-tools indicator (visible bottom-left in local dev). Not touched. |

## What changed in v2

- `components/brand/vac-brand.tsx` — real lockup image (`next/image`, `priority`,
  aspect-ratio preserved, ~24–28px tall) replacing the coloured chip + literal
  "VAC" text. `compact` prop kept for call-site compatibility.
- `app/globals.css` — `--vac-surface-page` added and mapped; `--vac-surface-soft`
  warmed; `--tracking-system` tightened; `html`/`body` background → warm paper.
- De-`font-mono` sweep across `login-screen`, `caja-frame`, `operational-shell`,
  `membership-state`, `scanner-screen`, `activity-screen`, `operation-status-card`,
  `scan-result-card`, `badge` (label/footer text only).

## What was deliberately NOT changed in v2

- No other brand asset wired in (no per-card logos, no dark-surface isotype swap) —
  identity reinforced once in the shell header + login, not repeated per state.
- No import/copy/symlink of assets from any sibling repo — only files already
  present in `vac-caja-web/public/`.
- `next.config.ts`, `tsconfig.json`, aliases, dependencies — untouched.
- No contract, auth, scanner, operation, idempotency, or activity behaviour changed.
- Wording kept as-is ("Escanear cliente" not swapped for the landing mockup's
  "Escanear QR") — that is a content decision, listed as a possible follow-up.

## Validation (v2)

| Check | Result |
| --- | --- |
| `pnpm test` | PASS — 31 files, 152 tests |
| `pnpm lint` | PASS — clean (no `<img>` warning; uses `next/image`) |
| `pnpm exec tsc --noEmit` | PASS |
| `pnpm build` | PASS |
| `git diff --check` | PASS |
| Manual render (local dev, `/login`) | Logo lockup renders; warm paper vs white card reads correctly; VAC-yellow primary button; visible warm focus ring; de-mono labels. |

## Follow-ups (not implemented)

- Optional content/voice pass on operational wording ("Escanear cliente" →
  "Escanear QR" / "Listo para atender") — cosmetic but a wording change, so left
  for an explicit decision.
- `vac-isotype-white.webp` could brand the dark camera surface in a later pass.
- Favicon/app metadata could adopt `public/favicon.ico` + the lockup for
  `apple-touch-icon` / OG image.
