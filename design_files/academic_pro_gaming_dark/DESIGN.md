---
name: Academic Pro Gaming Dark
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#b7c8e1'
  on-secondary: '#213145'
  secondary-container: '#3a4a5f'
  on-secondary-container: '#a9bad3'
  tertiary: '#c5cce6'
  on-tertiary: '#283044'
  tertiary-container: '#a9b1ca'
  on-tertiary-container: '#3c4459'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#dae2fd'
  tertiary-fixed-dim: '#bec6e0'
  on-tertiary-fixed: '#131b2e'
  on-tertiary-fixed-variant: '#3f465c'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.05em
  code:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  gutter: 20px
  margin-mobile: 16px
  margin-desktop: 64px
---

## Brand & Style
The design system reflects a high-performance, scholarly environment for competitive gaming. It bridges the gap between traditional academic rigor and elite esports performance. The aesthetic is "Technical Academic"—a blend of **Minimalism** and **Corporate Modern** with a focus on data density and high-contrast legibility.

The interface evokes a sense of focus and elite discipline. It targets student-athletes and professional analysts who require a sophisticated, distraction-free environment. The dark-mode shift ensures reduced eye strain during long analytical sessions while maintaining a prestigious, institutional feel.

## Colors
The palette is rooted in deep navy and charcoal tones to establish a grounded, professional foundation. 

- **Backgrounds:** The core application uses `#0a192f` for the lowest level, with `#0f172a` for primary content containers.
- **Primary Accent:** A sharp, high-performance sky blue (`#38bdf8`) is used for primary actions and focus states, providing high visibility against the deep navy.
- **Typography:** Headlines use an off-white (`#f8fafc`) for maximum clarity, while secondary information uses a muted light gray (`#94a3b8`) to establish hierarchy.
- **Status Colors:** Success, Warning, and Error colors are desaturated to ensure they don't vibrate against the dark backgrounds while remaining functionally distinct.

## Typography
This design system utilizes **Inter** exclusively to maintain a systematic, utilitarian aesthetic. The type scale is tight and structured, favoring clarity and information density over decorative flair.

Large headlines use tighter letter spacing and heavier weights to feel "authoritative." Label styles use uppercase transformations and slight tracking to mimic academic citations and technical readouts. High contrast is strictly maintained between font weights to ensure hierarchy is visible even in low-light environments.

## Layout & Spacing
The layout follows a **Fluid Grid** model based on an 8px base unit (with 4px increments for micro-adjustments). 

- **Desktop:** A 12-column grid with 20px gutters. Content is often organized into "Modules" or "Panels" that reflect a dashboard-heavy analytical environment.
- **Mobile:** A 4-column grid with 16px margins. 
- **Rhythm:** Spacing is used to group data points closely, maintaining a high information density typical of professional gaming HUDs and academic papers. Vertical rhythm is strictly enforced to ensure tabular data remains scannable.

## Elevation & Depth
In this dark-themed environment, depth is communicated through **Tonal Layers** rather than shadows. 

1.  **Level 0 (Base):** `#0a192f` - The canvas.
2.  **Level 1 (Surface):** `#0f172a` - Main content cards and navigation sidebars.
3.  **Level 2 (Elevated):** `#1e293b` - Hover states, tooltips, and active modal layers.

Instead of traditional drop shadows, use **Low-contrast outlines** (1px borders in `#334155`) to define boundaries. If a shadow is required for a floating modal, use a large, soft blur with 40% opacity in a darker navy tint to avoid a "muddy" appearance.

## Shapes
The shape language is **Soft (0.25rem)**. This subtle rounding provides a modern, professional feel while retaining the structural "grid" aesthetic required for an academic look. 

Buttons and input fields use the base 4px radius. Larger containers or data cards may use 8px (`rounded-lg`) to create clear visual containment. Avoid pills or circles unless used for specific status indicators (e.g., online status) to maintain the serious, architectural tone of the design system.

## Components
- **Buttons:** Primary buttons use a solid `#38bdf8` fill with dark text for high visibility. Secondary buttons are outlined in `#334155` with off-white text. 
- **Input Fields:** Use a `#0f172a` background with a subtle `#334155` border. On focus, the border transitions to `#38bdf8`.
- **Cards:** Defined by a 1px border (`#334155`) and a slight background shift to `#0f172a`. They should have zero inner padding at the edges if containing data tables.
- **Lists:** High-density list items with 1px bottom dividers. Use hover states with a background of `#1e293b` to indicate interactivity.
- **Data Tables:** Clear header rows using `label-md` typography. Zebra striping is achieved using a slight tonal shift to `#1e293b` on alternating rows.
- **Chips/Badges:** Small, rectangular tags with 2px radius. Use desaturated background tints (e.g., dark green for "Ranked") with bright text for high contrast.