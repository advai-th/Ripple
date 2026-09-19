---
name: Ripple Academic Analytics
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
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5b598c'
  on-secondary: '#ffffff'
  secondary-container: '#c7c3fe'
  on-secondary-container: '#514f81'
  tertiary: '#00505f'
  on-tertiary: '#ffffff'
  tertiary-container: '#006a7c'
  on-tertiary-container: '#93e8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c1fb'
  on-secondary-fixed: '#181445'
  on-secondary-fixed-variant: '#444173'
  tertiary-fixed: '#acedff'
  tertiary-fixed-dim: '#4cd7f6'
  on-tertiary-fixed: '#001f26'
  on-tertiary-fixed-variant: '#004e5c'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '700'
    lineHeight: 2.5rem
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: 2rem
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '700'
    lineHeight: 1.75rem
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.625rem
    letterSpacing: -0.01em
  kpi-display:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: 2.125rem
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.25rem
  body-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: 1.125rem
  label-md:
    fontFamily: Inter
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: 1.25rem
    letterSpacing: -0.005em
  label-sm:
    fontFamily: Inter
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.01em
  label-xs:
    fontFamily: Inter
    fontSize: 0.6875rem
    fontWeight: '600'
    lineHeight: 0.875rem
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 1.75rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.875rem
  space-lg: 1.25rem
  space-xl: 1.75rem
---

## Brand & Style

This design system targets institutional researchers, university provosts, research administrative directors, and public policy analysts who navigate complex bibliographic impact metrics, grant attribution networks, and institutional governance workflows.

The visual style blends **Corporate / Modern enterprise utility** with **refined data density**. The aesthetic communicates institutional authority, rigorous statistical objectivity, and modern executive polish. Key attributes include:

- **Dual-Zone Architectural Shell**: A commanding, dark indigo-navy master sidebar provides an unwavering anchor for primary navigation and user identity, transitioning immediately into an airy, high-contrast cool-slate canvas for multi-pane analytical dashboards.
- **Analytical Precision & Tactile Clarity**: Complex data widgets and KPI stat summaries inhabit structured white container cards defined by crisp sub-pixel boundaries rather than heavy drop shadows.
- **Cognitive Micro-Encapsulation**: Dense metric tables, micro-sparklines, stacked policy breakdown bars, and contextual pill badges use deliberate chromatic coding to lower cognitive friction during high-frequency administrative reviews.

## Colors

The color palette centers on high-order chromatic clarity and rigorous functional categorization.

### Core Roles
- **Primary (`#4F46E5` / Indigo-600)**: Used for high-priority interactive elements, active navigation states, selected chart intervals, primary action buttons, and active filter indicators.
- **Secondary (`#1E1B4B` / Deep Navy Shell)**: Governs the persistent primary rail/sidebar surface, nested navigational dropdowns, and deep administrative structural elements.
- **Tertiary (`#06B6D4` / Cyan-500)**: Serves secondary data-series visualizations, cross-institutional citation linkages, and comparative trend overlays.
- **Neutral (`#64748B` / Slate-500)**: Governs structural framing, inactive icons, supporting metric labels, table column headers, and sub-pixel card outlines (`#E2E8F0`).

### Surface Architecture
- **App Shell Navigation**: `#1E1B4B` (Background), `#2E2A72` (Submenu / Hover surface), `#3730A3` (Selected item highlight).
- **Canvas Base**: `#F8FAFC` to `#F1F5F9` (Clean, cool-slate foundation).
- **Surface Elevation (Cards & Widgets)**: `#FFFFFF` (Pure crisp white cards for maximum data contrast).

### Semantic & KPI Indicator Tints
Metric stat tiles and status tags utilize soft tinted pastels with saturated foreground text to maintain readability:
- **Success / Positive Impact**: Background `#ECFDF5`, Border `#A7F3D0`, Text `#047857`
- **Warning / Under Review**: Background `#FFFBEB`, Border `#FDE68A`, Text `#B45309`
- **Critical / At-Risk**: Background `#FEF2F2`, Border `#FECACA`, Text `#B91C1C`
- **Informational / Policy Tag**: Background `#EEF2FF`, Border `#C7D2FE`, Text `#4338CA`
- **Neutral Badge**: Background `#F1F5F9`, Border `#E2E8F0`, Text `#475569`

## Typography

The typographic hierarchy pairs **Plus Jakarta Sans** for display, section titles, and numerical KPI readouts with **Inter** for data tables, analytical charts, labels, and administrative forms.

### Styling & Optical Tuning
- **Headlines & Metric Figures**: Plus Jakarta Sans applies tight geometric proportions and soft terminals, humanizing numerical density while ensuring large figures (`$59,690`, `4,865`) stand out instantly.
- **Data Tables & Administrative Microcopy**: Inter provides tabular lining figures (`font-variant-numeric: tabular-nums`) across statistical tables, timestamp indicators, and metric variances.
- **Labeling Hierarchy**: Table headers and secondary chart axes utilize `label-xs` or `label-sm` set in medium/semibold weights with slight positive tracking (`+0.01em` to `+0.02em`) to maintain legibility at compact sizes.

## Layout & Spacing

This design system uses an **asymmetric fixed-sidebar with fluid multi-column grid layout**.

### Structural Architecture
- **Global Navigation Sidebar**: Fixed 260px desktop width (`#1E1B4B`), housing branding, workspace switchers, hierarchical navigation accordions, and administrative user identity. Collapses to an icon rail (72px) on medium screens (1024px–1279px) and a bottom sheet or off-canvas drawer below 1024px.
- **Application Header**: 64px height, fluid width, transparent or canvas-matched backdrop with global faceted search, quick filters, contextual actions, and notification bells.
- **Main Analytical Viewport**: Fluid 12-column responsive grid with a 1.25rem (`gutter`) horizontal gap and 1.75rem (`margin`) exterior frame padding.

### Responsive Breakpoints
- **Desktop (>= 1280px)**: 12-column grid. Full sidebar (260px). Multi-pane views display primary chart decks (8 columns) alongside secondary breakout lists (4 columns).
- **Tablet (768px - 1279px)**: 8-column grid. Sidebar collapses to 72px compact rail. Large charts span full width (8 columns); KPI cards flow into 2x2 matrices.
- **Mobile (< 768px)**: 4-column single-flow grid. 0.75rem gutters, 1rem margin. Sidebar shifts to hidden off-canvas drawer. Stat cards stack vertically or form a 2-column compact grid.

## Elevation & Depth

Depth is established primarily through **tonal separation and subtle borders**, supplemented by soft ambient indigo-tinted drop shadows rather than heavy structural dropoffs.

### Surface Tiers
- **Tier 0 (Backdrop / Shell)**: `#1E1B4B` (Dark Navy Sidebar) and `#F8FAFC` (Canvas Foundation).
- **Tier 1 (Surface Cards & Widgets)**: `#FFFFFF`. Paired with a 1px solid border in `#E2E8F0` and an ambient shadow: `box-shadow: 0 1px 3px 0 rgba(30, 27, 75, 0.04), 0 1px 2px -1px rgba(30, 27, 75, 0.02)`.
- **Tier 2 (Floating Popovers, Dropdowns, Datepickers)**: `#FFFFFF`. Bounded by `#CBD5E1` and an elevated shadow: `box-shadow: 0 10px 15px -3px rgba(30, 27, 75, 0.08), 0 4px 6px -4px rgba(30, 27, 75, 0.04)`.
- **Tier 3 (Modal Dialogs & Command Palettes)**: `#FFFFFF`. Positioned over a 40% opacity navy scrim (`rgba(15, 23, 42, 0.4)` with 4px backdrop blur): `box-shadow: 0 20px 25px -5px rgba(30, 27, 75, 0.12), 0 8px 10px -6px rgba(30, 27, 75, 0.08)`.

### Chart Tooltip Floats
Contextual chart cursors and tooltips (e.g., `$47,500` callout pins) use dark neutral pills (`#0F172A`) with inverted white typography, crisp 4px pointers, and an ambient lift: `0 4px 12px rgba(15, 23, 42, 0.2)`.

## Shapes

The design system maintains a **`roundedness: 2` (Standard Rounded)** geometry throughout cards, controls, and administrative widgets, complemented by deliberate pill radii on badges and primary interactive buttons.

### Corner Radius Mapping
- **Base Elements (`rounded`, 0.5rem / 8px)**: Standard text input fields, segmented control switches, dropdown select menus, table row hover bounds, chart tooltips.
- **Large Containers (`rounded-lg`, 1rem / 16px)**: Analytics dashboard cards, data table wrappers, modal containers, and KPI widget shells.
- **Full Radius (`rounded-full`, 9999px)**: Contextual metric trend pills (`13.4% ↑`), policy status chips, active column indicator points, avatar images, and circular action buttons.

## Components

### Buttons
- **Primary Action**: Full pill (`rounded-full`) or `rounded` (8px). Background `#4F46E5`, white text, semibold 13px/14px. On hover: `#4338CA` with subtle translation. Active: `#3730A3`.
- **Secondary / Outline**: 1px solid border `#E2E8F0`, background `#FFFFFF`, text `#334155`. Hover: background `#F8FAFC`, border `#CBD5E1`.
- **Ghost / Header Utilities**: Transparent background, text `#64748B`, hover background `#EEF2FF`, text `#4F46E5`.

### KPI Stat Cards
- Compact white card bounded by 1px solid `#E2E8F0` with `p-space-md` or `p-space-lg`.
- Top row: Metric label in `label-sm` neutral slate (`#64748B`) paired with an embedded micro-sparkline or mini category icon.
- Middle row: Bold numeric readout (`kpi-display`, `#0F172A`).
- Bottom row: Inline reference text (`Since last week`) beside a rounded-full pill tag displaying delta percentage (`13.4% ↑`) filled with semantic pastel tint.

### Pill Badges & Status Chips
- Height: 22px to 26px; padding: `0.125rem 0.625rem`; `rounded-full`.
- Font: `label-xs` (semibold, tabular tracking).
- Completed/Verified: `#ECFDF5` background, `#047857` text, leading 6px circular dot indicator `#10B981`.
- Pending/Review: `#FFFBEB` background, `#B45309` text, dot `#F59E0B`.
- Canceled/Expired: `#FEF2F2` background, `#B91C1C` text, dot `#EF4444`.

### Data Visualization Components
- **Bar Charts**: Rounded top caps (`border-top-left-radius: 6px`, `border-top-right-radius: 6px`). Inactive bars use soft lavender-tinted slate (`#E0E7FF` / `#EEF2F6`); selected or focus bars illuminate in vibrant `#4F46E5`.
- **Line & Area Series**: Stroke width 2.5px in `#4F46E5` with a vertical linear gradient fill transitioning from `rgba(79, 70, 229, 0.16)` to `rgba(79, 70, 229, 0.00)`. Point markers appear on hover as concentric rings (`#4F46E5` center, white border, outer glow).
- **Segmented Range Selectors**: Pill container with `#F1F5F9` track. Active button features white pill fill, subtle box-shadow, and `#1E1B4B` text.

### Tables & Policy Registry Lists
- Header: `#F8FAFC` background, 1px border-bottom `#E2E8F0`, uppercase `label-xs` text in `#64748B`.
- Rows: Minimum height 48px, background `#FFFFFF`, border-bottom 1px solid `#F1F5F9`. Hover state switches row background to `#F8FAFC`.
- Cells: Vertical alignment center; primary ID/Ref numbers styled with monospace-like tabular precision in `#4F46E5` with soft backgrounds (`#EEF2FF`).

### Search & Form Inputs
- Global search bar features soft pill or 8px rounded contours, `#F8FAFC` fill, inset search icon (`#94A3B8`), and 1px border `#E2E8F0`. Focus state shifts background to `#FFFFFF`, border to `#4F46E5`, with an indigo focus ring (`box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.12)`).