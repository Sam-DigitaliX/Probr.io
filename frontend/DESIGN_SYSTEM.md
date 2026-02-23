# Probr Design System

> Last updated: 2026-02-23

## Overview

Probr uses an **Evervault-inspired glassmorphism** aesthetic on a dark base, with a **tri-color gradient** brand identity and **Space Grotesk + Inter** type stack.

---

## Brand Gradient

```
Purple #833AB4 → Red #FD1D1D → Orange #FCB045
```

```css
background: linear-gradient(90deg, #833AB4 0%, #FD1D1D 50%, #FCB045 100%);
```

### HSL Equivalents

| Name     | Hex       | HSL                  | Usage                                    |
| -------- | --------- | -------------------- | ---------------------------------------- |
| Purple   | `#833AB4` | `hsl(276 51% 47%)`  | Primary, ring, sidebar, glows            |
| Red      | `#FD1D1D` | `hsl(0 98% 55%)`    | Accent, gradient midpoint                |
| Orange   | `#FCB045` | `hsl(35 97% 63%)`   | Secondary, gradient end                  |

### CSS Variables

```css
--gradient-brand:   linear-gradient(90deg, hsl(276 51% 47%) 0%, hsl(0 98% 55%) 50%, hsl(35 97% 63%) 100%);
--gradient-primary: linear-gradient(135deg, hsl(276 51% 47%), hsl(0 98% 55%), hsl(35 97% 63%));
--gradient-hero:    linear-gradient(180deg, hsl(276 30% 10%) 0%, hsl(240 15% 6%) 100%);
--gradient-cta:     linear-gradient(135deg, hsl(276 30% 10%) 0%, hsl(240 15% 6%) 100%);
--gradient-card:    linear-gradient(135deg, hsl(276 51% 47% / 0.06), hsl(35 97% 63% / 0.03));
```

---

## Color Tokens

### Surfaces

| Token          | Value                        | Description           |
| -------------- | ---------------------------- | --------------------- |
| `background`   | `hsl(240 15% 6%)`           | Deep dark navy        |
| `foreground`   | `hsl(0 0% 95%)`             | Near white            |
| `card`         | `hsl(0 0% 100% / 0.04)`    | Glass card fill       |
| `popover`      | `hsl(240 15% 10%)`          | Dropdown/popover bg   |
| `muted`        | `hsl(240 10% 12%)`          | Muted surface         |

### Brand

| Token          | Value                        |
| -------------- | ---------------------------- |
| `primary`      | `hsl(276 51% 47%)` (purple)  |
| `secondary`    | `hsl(35 97% 63%)` (orange)   |
| `accent`       | `hsl(0 98% 55%)` (red)       |

### Semantic

| Token          | Value                 |
| -------------- | --------------------- |
| `destructive`  | `hsl(0 84.2% 60.2%)` |
| `success`      | `hsl(142 71% 45%)`   |
| `warning`      | `hsl(38 92% 50%)`    |

### Glass

| Token             | Value                        |
| ----------------- | ---------------------------- |
| `glass`           | `hsl(0 0% 100% / 0.03)`    |
| `glass-border`    | `hsl(0 0% 100% / 0.06)`    |
| `glass-highlight` | `hsl(0 0% 100% / 0.08)`    |

### Borders

| Token    | Value                        |
| -------- | ---------------------------- |
| `border` | `hsl(0 0% 100% / 0.08)`    |
| `input`  | `hsl(0 0% 100% / 0.08)`    |
| `ring`   | `hsl(276 51% 47%)`          |

---

## Typography

### Font Stack

| Role      | Font Family    | Weights       | Usage                         |
| --------- | -------------- | ------------- | ----------------------------- |
| Display   | Space Grotesk  | 400–700       | h1, h2, h3, h4, buttons      |
| Body      | Inter          | 300–900       | Body text, labels, inputs     |
| Mono      | Cascadia Code  | —             | Code blocks, technical data   |

### CSS Variables

```css
--font-sans:    "Inter", system-ui, -apple-system, sans-serif;
--font-display: "Space Grotesk", "Inter", system-ui, sans-serif;
--font-mono:    ui-monospace, "Cascadia Code", "Fira Code", monospace;
```

### Auto-application

All `h1`–`h4` elements automatically use `--font-display` via CSS rule.

---

## Glassmorphism

### Glass Card (`.glass-card`)

```css
background:      hsl(0 0% 100% / 0.03);
border:          1px solid hsl(0 0% 100% / 0.06);
backdrop-filter: blur(20px);
border-radius:   1rem;
```

- `::before` pseudo adds a 135deg white highlight overlay at 5% opacity
- `.glass-card-interactive` adds hover: `border-color: primary/0.3`, `translateY(-4px)`, glow shadow

### Glass Badge (`.glass-badge`)

```css
background: linear-gradient(135deg, white/0.08, white/0.04);
border:     1px solid white/0.15;
```

- Rounded-full, uppercase, letter-spacing 0.1em
- Subtle primary glow shadow

### Glass Panels (Landing)

| Element    | Class/Style                                        | Shape             |
| ---------- | -------------------------------------------------- | ----------------- |
| Hero       | `bg-white/[0.03] border-white/[0.06]`             | `rounded-b-[40px]` |
| CTA        | `bg-white/[0.03] border-white/[0.06]`             | `rounded-t-[40px]` |
| Nav pill   | `bg-white/[0.07] border-white/[0.12]`             | `rounded-full`     |

---

## Orbs (EvervaultGlow)

5 fixed-position blurred orbs behind all content at `z-0`:

| #  | Color   | HSL                           | Opacity | Position        | Size (md)     |
| -- | ------- | ----------------------------- | ------- | --------------- | ------------- |
| 1  | Purple  | `hsl(276 51% 47% / 0.18)`   | 18%     | top-left        | 500 x 500     |
| 2  | Orange  | `hsl(35 97% 63% / 0.16)`    | 16%     | upper-right     | 500 x 500     |
| 3  | Red     | `hsl(0 98% 55% / 0.14)`     | 14%     | mid-left        | 400 x 400     |
| 4  | Purple  | `hsl(276 51% 47% / 0.16)`   | 16%     | lower-right     | 500 x 500     |
| 5  | Orange  | `hsl(35 97% 63% / 0.12)`    | 12%     | bottom-left     | 350 x 350     |

Blur: 80px (mobile) / 100–120px (desktop).

---

## Liserés (Gradient Lines)

Horizontal 1px gradient lines connecting sections:

```css
background: linear-gradient(90deg,
  transparent,
  hsl(276 51% 47% / 0.30) 20%,
  hsl(0 98% 55% / 0.25) 50%,
  hsl(35 97% 63% / 0.30) 80%,
  transparent
);
```

---

## Buttons

### Primary (`.ev-btn-primary`)

```css
background:      linear-gradient(135deg, purple, red, orange);
background-size: 200% 200%;
border-radius:   12px;
font-family:     var(--font-display);
font-weight:     600;
```

- Hover: `background-position` shifts to 100%, creating a color-sweep animation
- Hover glow: combined purple + red shadows

### Glass (`.ev-btn-glass`)

```css
background:      hsl(0 0% 100% / 0.05);
border:          1px solid hsl(0 0% 100% / 0.10);
backdrop-filter: blur(12px);
border-radius:   12px;
font-family:     var(--font-display);
```

- Hover: bg increases to 8%, border to 15%, subtle lift

### Outline (`.ev-btn-outline`)

```css
background: transparent;
border:     1px solid hsl(276 51% 47% / 0.4);
color:      hsl(276 51% 57%);
border-radius: 12px;
font-family: var(--font-display);
```

- Hover: border 60%, bg primary/8%, purple glow

### Secondary (`.ev-btn-secondary`)

```css
background: hsl(0 0% 100% / 0.08);
border:     1px solid hsl(0 0% 100% / 0.08);
color:      hsl(0 0% 95%);
border-radius: 12px;
font-family: var(--font-display);
```

- Hover: bg increases to 12%, subtle lift

---

## Shadows & Glows

| Name               | Value                                                           |
| ------------------ | --------------------------------------------------------------- |
| `shadow-card`      | `0 4px 24px black/0.30, 0 1px 3px black/0.20`                 |
| `shadow-card-hover`| `0 12px 40px black/0.40, 0 2px 6px black/0.25`                |
| `glow-primary`     | `0 0 60px hsl(276 51% 47% / 0.30)`                            |
| `glow-secondary`   | `0 0 40px hsl(35 97% 63% / 0.25)`                             |
| `glow-pulse`       | Animates between 20px and 28px primary glow (6s loop)          |

---

## Animations

| Name            | Duration | Easing   | Description                  |
| --------------- | -------- | -------- | ---------------------------- |
| `fade-in-up`    | 0.8s     | ease-out | Opacity 0→1, Y 30px→0       |
| `scale-in`      | 0.6s     | ease-out | Opacity 0→1, scale 0.95→1   |
| `float`         | 6s       | ease-io  | Y 0→-20px→0 (infinite)      |
| `glow-pulse`    | 6s       | ease-io  | Box-shadow pulse (infinite)  |
| `shimmer`       | 2s       | ease-io  | Background-position sweep    |
| `ev-border-spin`| 4s       | linear   | Conic gradient rotation      |
| `orbit-fill`    | 3s       | linear   | Orbit ring rotation          |

### Delay Utilities

`.animate-delay-100` through `.animate-delay-600` (100ms increments)

---

## Z-Layering

| Layer           | z-index | Position | Element                        |
| --------------- | ------- | -------- | ------------------------------ |
| Orbs            | `z-0`   | fixed    | `EvervaultGlow` component      |
| Content         | `z-[1]` | relative | Main page content wrapper      |
| Navbar          | `z-50`  | fixed    | Top navigation bar             |

---

## Radius

| Token       | Value               |
| ----------- | ------------------- |
| `radius-lg` | `0.75rem` (12px)    |
| `radius-md` | `0.625rem` (10px)   |
| `radius-sm` | `0.5rem` (8px)      |

Special: Hero panel `rounded-b-[40px]`, CTA panel `rounded-t-[40px]`, Nav pill `rounded-full`.

---

## Component Classes

| Class                    | Type        | Description                                      |
| ------------------------ | ----------- | ------------------------------------------------ |
| `.glass-card`            | Static      | Glass surface with blur + highlight overlay       |
| `.glass-card-interactive`| Interactive | Glass card with hover lift + glow border          |
| `.glass-badge`           | Static      | Pill badge with glass background                  |
| `.ev-input`              | Interactive | Glass input with focus glow ring                  |
| `.ev-card`               | Animated    | Card with spinning conic-gradient border          |
| `.ev-card-static`        | Interactive | Card with hover glow (no spin)                    |
| `.ev-btn-primary`        | Interactive | Gradient button with color-sweep hover            |
| `.ev-btn-glass`          | Interactive | Glass button with blur backdrop                    |
| `.ev-btn-outline`        | Interactive | Transparent button with primary border             |
| `.ev-btn-secondary`      | Interactive | Subtle filled button for dashboard actions         |
| `.text-gradient-primary` | Static      | Text with brand gradient fill                     |
| `.ev-dot-grid`           | Static      | 24px dot grid background pattern                  |
| `.ev-table-row`          | Interactive | Table row with hover highlight                    |
| `.orbit-ring`            | Static      | Conic gradient ring (activated on group hover)     |
| `.orbit-loader`          | Animated    | Container that auto-animates orbit rings           |

---

## File Map

| File                                        | Responsibility                          |
| ------------------------------------------- | --------------------------------------- |
| `frontend/src/app/globals.css`              | All tokens, classes, keyframes          |
| `frontend/src/components/ui/evervault-glow.tsx` | Background orbs component           |
| `frontend/src/app/(public)/page.tsx`        | Landing page (hero, features, CTA)      |
| `frontend/src/app/(public)/login/page.tsx`  | Login page                              |
| `frontend/src/app/(public)/signup/page.tsx` | Signup page                             |
| `frontend/src/app/(public)/brand/page.tsx`  | Brand kit page (internal, /brand)       |
| `frontend/src/app/layout.tsx`               | Root layout (z-layering, metadata)      |
| `frontend/DESIGN_SYSTEM.md`                | This file (markdown reference)          |
