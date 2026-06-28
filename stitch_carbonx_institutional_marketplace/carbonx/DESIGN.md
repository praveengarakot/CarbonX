---
name: CarbonX
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#c4c7c8'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#8e9192'
  outline-variant: '#444748'
  surface-tint: '#c6c6c7'
  primary: '#ffffff'
  on-primary: '#2f3131'
  primary-container: '#e2e2e2'
  on-primary-container: '#636565'
  inverse-primary: '#5d5f5f'
  secondary: '#c6c6cf'
  on-secondary: '#2f3037'
  secondary-container: '#45464e'
  on-secondary-container: '#b4b4bd'
  tertiary: '#ffffff'
  on-tertiary: '#2f3131'
  tertiary-container: '#e2e2e2'
  on-tertiary-container: '#636565'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e2e2e2'
  primary-fixed-dim: '#c6c6c7'
  on-primary-fixed: '#1a1c1c'
  on-primary-fixed-variant: '#454747'
  secondary-fixed: '#e2e1eb'
  secondary-fixed-dim: '#c6c6cf'
  on-secondary-fixed: '#1a1b22'
  on-secondary-fixed-variant: '#45464e'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  headline-xl:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-lg:
    fontFamily: Geist
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.03em
  headline-lg-mobile:
    fontFamily: Geist
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  label-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin: 32px
---

## Brand & Style
The design system is engineered for institutional trust and surgical precision within the decentralized carbon credit sector. The aesthetic is strictly monochromatic, eschewing the common "green-washing" or high-energy "web3" visuals in favor of a sophisticated, high-utility financial interface.

The style is **Modern Minimalism** with a focus on high-density information made legible through generous whitespace and a rigid structural hierarchy. Drawing inspiration from industry leaders like Vercel and Linear, this design system utilizes flat surfaces, thin borders, and a stark tonal palette to evoke a sense of permanence, transparency, and carbon-neutral efficiency.

## Colors
This design system operates on a strict monochromatic scale to maintain institutional gravity.

- **Primary & Background:** The default experience is dark-mode centric, utilizing a pure `#000000` background to maximize contrast with high-grade typography.
- **Surfaces:** UI elements sit on `#111111` or `#1A1A1A` layers. These subtle shifts in value denote hierarchy without the need for shadows.
- **Borders:** All interactive elements and card containers utilize a consistent `#262626` border.
- **Accents:** Functional colors (Success, Warning, Error) should be used sparingly and desaturated, ensuring the monochromatic theme remains dominant.

## Typography
The system uses **Geist** for its technical, developer-centric precision. 

Headlines are characterized by heavy weights and aggressive negative letter-spacing to create a "locked-in" editorial feel. Body text prioritizes legibility with slightly wider line heights, while labels use subtle uppercase tracking for functional clarity in data-heavy views.

## Layout & Spacing
The layout follows a **Fluid Grid** system within a 1440px max-width container. 

- **Grid:** 12-column structure for desktop, 4-column for mobile.
- **Rhythm:** An 8px linear scale (4px for micro-adjustments) ensures a consistent mathematical cadence across the interface.
- **Negative Space:** Use `lg` and `xl` spacing for section grouping to maintain the high-end, uncluttered aesthetic of institutional fintech apps.

## Elevation & Depth
In alignment with the flat, minimalist aesthetic, this design system avoids traditional drop shadows. 

Depth is achieved through **Tonal Layering** and **Subtle Outlines**:
- **Level 0 (Background):** `#000000` — The canvas.
- **Level 1 (Cards/Panels):** `#111111` with a 1px border of `#262626`.
- **Level 2 (Popovers/Modals):** `#1A1A1A` with a 1px border of `#333333` and a 10% opacity white inner-glow for slight separation.

## Shapes
The shape language balances the rigidity of fintech with the modern approachable nature of SaaS. 

- **Standard Elements:** Buttons and input fields use a consistent `0.5rem` (8px) radius.
- **Structural Containers:** Cards and main dashboard panels utilize `rounded-lg` (16px) to soften the monochromatic starkness and provide clear visual containment for marketplace listings.

## Components
- **Buttons:** Primary buttons are Solid White with Black text. Secondary buttons are Ghost (Transparent) with a White 1px border. Hover states involve a subtle background shift to `#FFFFFF10`.
- **Input Fields:** Background: `#000000`; Border: 1px `#262626`. Focus state: Border changes to `#FFFFFF`. Labels are always `#A1A1AA` and positioned above the field.
- **Cards:** Used for carbon credit projects. Use `#111111` backgrounds with consistent 16px corner radii. No shadows.
- **Chips/Badges:** Small, high-contrast indicators for "Verified" or "Vintage" status. Monospace font variants (Geist Mono) are preferred for badge text to emphasize technical accuracy.
- **Lists:** Clean rows separated by 1px `#262626` dividers. High contrast between primary data (White) and metadata (Zinc-500/`#71717A`).
- **Data Tables:** Dense but breathable. Headers are uppercase `label-sm` with a bottom border only.