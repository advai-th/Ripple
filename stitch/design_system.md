# Design System: Academic Precision
**ID:** `assets/241c90531e8c4cacb23c7e72ff3b2ce3`
**Project ID:** `14952429146529925208`

---
name: Academic Precision
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#434655'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#737686'
  outline-variant: '#c3c6d7'
  surface-tint: '#0053db'
  primary: '#004ac6'
  on-primary: '#ffffff'
  primary-container: '#2563eb'
  on-primary-container: '#eeefff'
  inverse-primary: '#b4c5ff'
  secondary: '#565e74'
  on-secondary: '#ffffff'
  secondary-container: '#dae2fd'
  on-secondary-container: '#5c647a'
  tertiary: '#48566a'
  on-tertiary: '#ffffff'
  tertiary-container: '#606e83'
  on-tertiary-container: '#e9f0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dbe1ff'
  primary-fixed-dim: '#b4c5ff'
  on-primary-fixed: '#00174b'
  on-primary-fixed-variant: '#003ea8'
  secondary-fixed: '#dae2fd'
  secondary-fixed-dim: '#bec6e0'
  on-secondary-fixed: '#131b2e'
  on-secondary-fixed-variant: '#3f465c'
  tertiary-fixed: '#d5e3fc'
  tertiary-fixed-dim: '#b9c7df'
  on-tertiary-fixed: '#0d1c2e'
  on-tertiary-fixed-variant: '#3a485b'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: -0.005em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 18px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
---

## Brand & Style

This design system is engineered for university provosts, registrars, Title IX coordinators, and academic compliance officers who evaluate policy changes across multi-tiered institutional governance. The aesthetic is deterministic, institutional, and austere: it rejects consumer AI tropes—no nebulous gradients, no mystical purple glows, and no decorative skeuomorphism. Instead, it projects the authority of legal-grade audit software, drawing structural discipline from Linear's keyboard-centric information density, Stripe's tabular legibility, Vercel's telemetry-style status communication, and Attio's structured record surfaces.

The emotional signature is uncompromised clarity, administrative trust, and evidentiary rigor. The interface behaves like a precision analytical workbench where every automated recommendation is explicitly anchored to source codices, legislative clauses, or institutional bylaws. Surfaces are matte, boundaries are drawn with hairline contrast, and interactions emphasize auditability over novelty.

## Colors

The system uses a calibrated, high-efficiency light palette optimized for sustained administrative review under standard institutional office lighting. The backdrop `#F7F8FA` separates clean white surface planes (`#FFFFFF`) from auxiliary panels and data containers (`#F1F5F9` and `#F8FAFC`). Hairline borders in `#E2E8F0` provide crisp structural boundaries without adding visual clutter.

Accent blue (`#2563EB`) is applied strictly to intentional user interactions: confirmed primary actions, active navigation states, verified links, and key focus rings. It is intentionally withheld from decorative uses to prevent distraction.

### Semantic Tiers
Status signaling adheres to strict tripartite and analytical conventions:
- **Unaffected / Compliant:** Background `#ECFDF5`, text `#059669`, border `#A7F3D0`
- **At Risk / Warning:** Background `#FFFBEB`, text `#D97706`, border `#FDE68A`
- **Affected / Non-Compliant:** Background `#FEF2F2`, text `#DC2626`, border `#FECACA`
- **AI Logic & Machine Provenance:** Background `#F1F5F9`, text `#475569`, border `#CBD5E1`

Text hierarchy remains unpolluted: `#0F172A` delivers uncompromising primary legibility, `#64748B` handles metadata, counts, and supporting descriptions, while `#94A3B8` is reserved for inactive hints and input placeholders.

## Typography

Typography establishes an institutional standard through two dedicated typefaces: **Plus Jakarta Sans** for natural administrative prose, headings, forms, and layout navigation; and **JetBrains Mono** for all automated logic, threshold statements, section codes, identifier keys (`S002`, `ANL-001`), and machine-generated impact evaluations (`attendance_pct >= 80`).

Weights are intentionally restrained: 700 is reserved for top-level policy titles, 600 organizes sections and structural cards, 500 governs data labels, table headers, and badges, while 400 delivers dense, fatigue-free reading across lengthy policy citations and legal bodies. Tabular figures (`font-variant-numeric: tabular-nums`) must be enabled on all numerical data columns, compliance scores, and timeline intervals.

## Layout & Spacing

The layout model balances high information density with functional modularity. The base interface uses a multi-tier workspace arrangement: a fixed compact navigation rail (240px desktop, collapsible to 64px icon state), an adaptive main analysis viewport with 12-column fluid grid flexibility, and an expandable contextual right drawer (420px fixed) for source citations, evidentiary lineage, and statutory excerpts.

Horizontal and vertical cadence operates on a base 4px/8px module:
- Micro-gaps (`0.25rem` / `4px`) pair status dots with state titles and inline rule components.
- Standard form and badge padding relies on `0.5rem` (`8px`) vertical and `0.75rem` (`12px`) horizontal distributions.
- Content groupings and dense data tables utilize tight row intervals (`36px` to `44px` row heights) to maximize screen real estate for multi-clause comparisons.

Desktop breakpoints trigger at 1024px and 1440px. Below 1024px, the evidentiary right drawer shifts to an overlay slide-over sheet. Below 768px, horizontal tables scroll within enclosed card frames, metadata groups collapse into stacked key-value pairs, and action bars dock to the bottom viewport.

## Elevation & Depth

Visual hierarchy is maintained through surface tone contrast and hairline boundary definitions rather than heavy drop shadows. The system uses a strict 3-tier elevation model:

1. **Base Layer (Flat):** Surface `#FFFFFF` resting upon Canvas `#F7F8FA`, demarcated exclusively by a `1px solid #E2E8F0` border. No shadow. Used for data tables, analytical workbenches, and standard panel groupings.
2. **Interactive & Contextual Layer (Floating Elements):** Tooltips, dropdown menus, combobox popovers, and floating table headers use a subtle boundary shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.06), 0 1px 2px -1px rgba(15, 23, 42, 0.04)` over a `1px solid #E2E8F0` frame.
3. **Evidentiary Drawer & Modal Overlay:** Slide-over source drawers and regulatory confirmation dialogs carry an elevation of `0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.02)`.

Backdrop scrims for modals and overlays use a pure neutral wash of `#0F172A` at 20% opacity without blurs, maintaining environmental sharpness and system focus.

## Shapes

The interface embraces a low-radius, architectural geometry. Form controls, status containers, code blocks, and analytical cards utilize `0.25rem` (`4px`) or `0.375rem` (`6px`) corners, reflecting administrative seriousness and structural solidity. 

Avatars and status indicator dots remain strictly circular (`9999px`), providing an immediate shape-based contrast against rectangular record rows, mono data pills, and statutory cards. Modals and right-hand evidence drawers use `0.5rem` (`8px`) radii along interior exposed corners, preventing visual harshness without degrading into playful roundness.

## Components

### Buttons
- **Primary:** Background `#2563EB`, text `#FFFFFF`, border `1px solid #1D4ED8`. Hover: `#1D4ED8`. Active: `#1E40AF`. Focus: Ring `2px #2563EB` with `2px` offset.
- **Secondary / Outline:** Background `#FFFFFF`, text `#0F172A`, border `1px solid #E2E8F0`. Hover: `#F8FAFC`, border `#CBD5E1`.
- **Tertiary / Ghost:** Background transparent, text `#64748B`. Hover: `#F1F5F9`, text `#0F172A`.
- **Destructive:** Background `#FEF2F2`, text `#DC2626`, border `1px solid #FECACA`. Hover: `#FEE2E2`.
- Heights: Compact `32px` (standard density) and Default `36px`.

### Badges & Technical Status Dots
- Badges feature a 1px border, 4px corner radius, `label-sm` typography, and internal horizontal padding of 6px.
- Status indicators combine a `6px` solid indicator dot with a textual label:
  - *Compliant:* `#059669` dot within `#ECFDF5` badge.
  - *At Risk:* `#D97706` dot within `#FFFBEB` badge.
  - *Affected:* `#DC2626` dot within `#FEF2F2` badge.
  - *In Review / Processing:* `#2563EB` dot with a subtle pulse animation alongside `#F1F5F9` container.

### Dense Data Tables (Stripe-Inspired)
- Header rows: Height `36px`, background `#F8FAFC`, border-bottom `1px solid #E2E8F0`, typography `label-sm` with color `#64748B`.
- Content rows: Height `40px` (or `56px` for multi-clause preview), border-bottom `1px solid #F1F5F9`. Hover state shifts row background to `#F8FAFC`.
- Checkboxes sit centered within a `40px` fixed-width column.
- Logic cells display with JetBrains Mono in `#0F172A` with `#F1F5F9` background chips.

### Evidence & Source Drawer (Notion/Attio-Inspired)
- Anchored to the right viewport border (`width: 440px`).
- Header displays statutory metadata: Citation Title, Section Identifier (`code-md`), Verification Status badge, and timestamp.
- Body displays literal source text excerpts bounded by a `2px solid #E2E8F0` left accent bar on `#F8FAFC` background.
- Exact diff visualizers show strikethrough red (`#DC2626` on `#FEF2F2`) for superseded language and green (`#059669` on `#ECFDF5`) for incoming policy amendments.

### Input Fields & Filter Controls
- Input fields use `#FFFFFF` background, `1px solid #E2E8F0` border, `32px` height, and `Plus Jakarta Sans` 13px typography. Placeholder text: `#94A3B8`.
- Focus state: Border transitions to `#2563EB` with an outline ring of `1px solid #2563EB`.
- Filter chips feature key-operator-value triads (e.g., `Dept: Academic Affairs` or `Threshold <= 80%`) with integrated dismissal buttons.

### Checkboxes & Radio Controls
- Checkboxes: `16px x 16px`, `2px` corner radius, `1px solid #CBD5E1` border. Checked state: `#2563EB` background with white checkmark icon.
- Radio buttons: `16px x 16px`, circular, with a centered `6px` solid fill dot when active.
