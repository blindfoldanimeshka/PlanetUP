# Neumorphism (Soft UI) — Production Research for PlanetUP

> **Date**: 2026-07-31
> **Context**: React 19 + Vite 8 + Tailwind CSS v4.3 + framer-motion 12
> **Current theme**: Dark (#0a0a0a bg, #141414 surface, #A855F7 accent)
> **Background**: Iris Petal gradient (PageBackground.tsx)
> **Sources**: [CSS-Tricks](https://css-tricks.com/neumorphism-and-css/), [Superdesign](https://superdesign.dev/styles/neumorphism), [Tailwind CSS v4 docs](https://tailwindcss.com/docs/functions-and-directives)

---

## 1. Neumorphism Core: The Dual Box-Shadow Technique

Neumorphism uses two box-shadows on an element whose background color is identical to the page/surface behind it.

Light source: top-left (convention). Everything must be consistent.

The math:
- Dark shadow: base dark ~15%, positive offset
- Light shadow: base light ~10-15%, negative offset
- Offset:blur ratio = 1:2

Source: [CSS-Tricks](https://css-tricks.com/neumorphism-and-css/)

---

## 2. Dark Neumorphism — Exact Values

Critical: Never invert light-mode shadows. Both must be retuned.

### For your #141414 surface

Raised:
  box-shadow: 7px 7px 14px #0b0b0b, -7px -7px 14px #222222;

Pressed:
  box-shadow: inset 5px 5px 10px #0b0b0b, inset -5px -5px 10px #222222;

### Canonical dark ref (Superdesign)

bg: #2d3239
box-shadow: 9px 9px 18px #23272d, -9px -9px 18px #373d46;

---

## 3. Tailwind CSS v4 - @theme + @utility

Add to existing @theme block in index.css:

  --shadow-neu-sm:  4px  4px  8px #0b0b0b,  -4px -4px  8px #222222;
  --shadow-neu-md:  7px  7px 14px #0b0b0b,  -7px -7px 14px #222222;
  --shadow-neu-lg: 10px 10px 20px #0b0b0b, -10px -10px 20px #2a2a2a;
  --shadow-neu-inset-md:  inset 5px 5px 10px #0b0b0b,  inset -5px -5px 10px #222222;

Usage: shadow-neu-md / active:shadow-neu-inset-md

Or with @utility directive:

  @utility surface-neu {
    background: var(--color-min-surface);
    box-shadow: var(--shadow-neu-md);
  }

---

## 4. Gradient Conflict — Resolution

Your PageBackground.tsx has a strong Iris Petal gradient. Neumorphism requires element bg == surface bg.

### Recommended: Solid panels over gradient

Wrap neumorphic elements in a solid bg-[#141414] panel:

  <div class="bg-[#141414] rounded-2xl p-8">
    <div class="shadow-neu-md bg-[#141414]">Neu content</div>
  </div>

The gradient wraps around the panels. Neumorphism works on the solid surface.

### Alternative: Section-level solid bg

  section.neu-section { background: #141414; }

### Two-tone (experimental, CSS-Tricks)

  background: linear-gradient(145deg, #1a1a1a, #0f0f0f);

---

## 5. Accessibility — WCAG 2.2 SC 1.4.11

Neumorphic shadow edges achieve ~1.4:1 contrast. WCAG requires 3:1. Cannot fix by tuning.

### Non-negotiable rules
- Text must be 4.5:1 (your #f2f2f2 on #141414 = ~15:1 — ok)
- Focus-visible outlines always
- Pair shadow swap with color/icon changes (never shadow-only)
- Flat CTAs (accent bg, not neumorphic)

### When NOT to use
Navigation, inputs, CTAs, tables, small elements, text-heavy pages

### When to use
Decorative cards, stat panels, toggles, badges

---

## 6. React / Framer-Motion

### Button with pressed state

  <motion.button
    class="shadow-neu-md active:shadow-neu-inset-md ..."
    whileHover={reduced ? undefined : { scale: 1.02 }}
    whileTap={reduced ? undefined : { scale: 0.98 }}
  >
    {children}
  </motion.button>

### Card with hover lift

  <motion.div
    class="shadow-neu-md"
    whileHover={reduced ? undefined : {
      boxShadow: '12px 12px 24px #0b0b0b, -12px -12px 24px #2a2a2a',
      y: -2,
    }}
  >
    {children}
  </motion.div>

### Reduced motion
Your useReducedMotion hook + CSS @media (prefers-reduced-motion: reduce) handles it.

---

## Summary: Implementation Order

1. Add --shadow-neu-* tokens to @theme in index.css
2. Create solid bg-[#141414] panels over gradient
3. Build NeuButton/NeuCard components with framer-motion
4. Use sparingly — decorative cards only, never CTAs/inputs
5. Always add focus-visible outlines + redundant state cues

### References
- CSS-Tricks: https://css-tricks.com/neumorphism-and-css/
- Superdesign: https://superdesign.dev/styles/neumorphism
- Tailwind v4 docs: https://tailwindcss.com/docs/functions-and-directives
- WCAG 2.2: https://www.w3.org/TR/WCAG22/#non-text-contrast
- Generator: https://neumorphism.io
