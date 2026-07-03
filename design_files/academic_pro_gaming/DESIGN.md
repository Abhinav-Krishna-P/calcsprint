---
name: Academic Pro Gaming
colors:
  surface: '#faf9fd'
  surface-dim: '#dad9dd'
  surface-bright: '#faf9fd'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f4f3f7'
  surface-container: '#efedf1'
  surface-container-high: '#e9e7eb'
  surface-container-highest: '#e3e2e6'
  on-surface: '#1a1c1e'
  on-surface-variant: '#43474e'
  inverse-surface: '#2f3033'
  inverse-on-surface: '#f1f0f4'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f88'
  primary: '#002045'
  on-primary: '#ffffff'
  primary-container: '#1a365d'
  on-primary-container: '#86a0cd'
  inverse-primary: '#adc7f7'
  secondary: '#545f72'
  on-secondary: '#ffffff'
  secondary-container: '#d5e0f7'
  on-secondary-container: '#586377'
  tertiary: '#002713'
  on-tertiary: '#ffffff'
  tertiary-container: '#003f23'
  on-tertiary-container: '#4bb278'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d6e3ff'
  primary-fixed-dim: '#adc7f7'
  on-primary-fixed: '#001b3c'
  on-primary-fixed-variant: '#2d476f'
  secondary-fixed: '#d8e3fa'
  secondary-fixed-dim: '#bcc7dd'
  on-secondary-fixed: '#111c2c'
  on-secondary-fixed-variant: '#3c475a'
  tertiary-fixed: '#91f8b8'
  tertiary-fixed-dim: '#74db9d'
  on-tertiary-fixed: '#002110'
  on-tertiary-fixed-variant: '#00522f'
  background: '#faf9fd'
  on-background: '#1a1c1e'
  surface-variant: '#e3e2e6'
typography:
  math-display-lg:
    fontFamily: Inter
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 80px
    letterSpacing: -0.02em
  math-display-md:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
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
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  math-display-mobile:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
  focus-width: 640px
  transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1)
  transition-instant: 50ms linear
---

## Brand & Style

The design system is engineered for "Academic Pro" environments, specifically targeting high-performance math training. The brand personality is disciplined, authoritative, and intellectually rigorous, removing all cognitive load to allow for maximum mental focus. 

The aesthetic blends **Modern Minimalism** with **Industrial Precision**. It avoids the "toy-like" appearance of traditional educational games, instead opting for a sophisticated, high-stakes interface that respects the user's intelligence. Success is communicated through crisp visual feedback rather than decorative flourishes. The emotional response is one of clarity, urgency, and professional achievement.

## Colors

The palette is rooted in a high-contrast, "Institutional White" foundation to ensure zero distractions. 

- **Primary (Deep Navy):** Reserved for critical actions and active states. It provides a sense of stability and importance.
- **Secondary (Slate Grey):** Used for instructional text and UI scaffolding.
- **Feedback (Success Green / Warning Red):** These are the only high-chroma elements in the interface, used exclusively to signal performance outcomes.
- **Neutral:** A range of cool greys is used to differentiate background surfaces from interactive cards without breaking the clean, academic feel.

## Typography

The design system utilizes **Inter** for its exceptional legibility and neutral, systematic character. The hierarchy is strictly functional:

1.  **Math Display:** Extra-large, bold weights are used for the primary mathematical problems to ensure they are the first thing a user sees.
2.  **Clarity:** Numerical glyphs in Inter are distinct, preventing confusion between similar characters (e.g., 1, l, and I).
3.  **Data-Heavy Labels:** Uppercase labels with slight letter spacing are used for secondary stats (e.g., "STREAK", "TIME REMAINING") to provide an organized, cockpit-like feel.

## Layout & Spacing

This design system employs a **Fixed Focus Grid**. To minimize eye travel and increase problem-solving speed, the core interactive area is constrained to a narrow central column (640px) on desktop.

- **Spacing Rhythm:** Based on a 4px baseline grid. Padding within cards is generous (32px) to provide "breathing room" for complex thought.
- **Speed Tokens:** Transitions between problems must be near-instant (150ms or less). There are no "slide" or "fade" animations; elements should snap into place to maintain a high-tempo training rhythm.
- **Mobile Adaptivity:** On mobile, the central column becomes fluid with 16px side margins, but the math display size is maintained as large as possible to ensure tap accuracy.

## Elevation & Depth

To maintain the "Sharp" and "Focused" aesthetic, the design system avoids heavy shadows. 

- **Tonal Layering:** The background is white (#FFFFFF), and secondary UI panels use a very light grey (#F7FAFC) with a 1px solid border (#E2E8F0).
- **Interactive Elevation:** Only active elements (like the current input field or a selected answer) receive a subtle, crisp shadow: `0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)`.
- **Focus State:** Active input fields use a 2px solid Deep Navy border. There is no outer glow; the focus is defined by structural sharpness.

## Shapes

The design system uses **Sharp (0px)** roundedness. Every element—from buttons and input fields to the main container cards—utilizes hard 90-degree corners. This reinforces the "Academic Pro" persona, suggesting precision, mathematical accuracy, and a serious, no-nonsense environment.

## Components

### Buttons
- **Primary:** Deep Navy background, white text, sharp corners. No gradients.
- **Secondary:** Transparent background, Slate Grey 1px border, Slate Grey text.
- **Feedback States:** On a correct answer, the button or input field border snaps immediately to Success Green. On failure, it snaps to Warning Red with a brief 100ms horizontal shake.

### Cards (Focus Containers)
Cards are the primary layout building block. They feature a white background, a 1px Slate Grey border, and zero border-radius. Content inside cards is always center-aligned to keep the user's gaze fixed.

### Input Fields
Large, centered text. The cursor is a block style rather than a line to emphasize the "terminal-like" precision. 

### Progress Indicators
Linear bars (100% width) at the very top of the interface. Use a high-contrast Success Green for the fill to provide a "gamified" sense of completion without distracting from the center-screen math.

### Chips
Used for tags like "Level 1" or "Algebra". These use a light grey fill and Slate Grey text in the `label-caps` typography style.