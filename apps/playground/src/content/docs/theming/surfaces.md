---
title: Surfaces
description: HUD vs Calm — the two motion modes Abstract Data ships.
---

The theme ships two motion surfaces. Same palette, same components, same content — different visual energy.

## HUD (default)

The full Abstract Data look. Animated hexagon grid, scanline drift on the hero, holographic shimmer on code blocks, glow on H1 and active sidebar items, glitch-pulse on version chip _(Round 3b)_.

```js
abstractData({ motion: 'full' })
```

Recommended for:

- abstractdata.io and adjacent properties
- Marketing-flavored docs and landing pages
- Project sites where the brand should be loud

## Calm

A one-line flag flips off every animation. Same palette and fonts, no hex grid, no scanline, no shimmer, no glitch. Glow only on focus/hover.

```js
abstractData({ motion: 'calm' })
```

Recommended for:

- Long-form prose-heavy documentation
- Client internal wikis
- Anywhere reading volume matters more than brand swagger

## Reduced motion

HUD mode automatically collapses to Calm behavior when the user's OS reports `prefers-reduced-motion: reduce`. No extra config required — the same site serves the right experience for the user.

:::tip
Calm is also what HUD becomes under reduced motion. Two paths, one quiet result.
:::

## Light + dark

Both surfaces work in light and dark, follow `prefers-color-scheme` by default, and honor the user's manual toggle in the top bar.

| | Dark | Light |
|---|---|---|
| Background | `#0A0A0A` charcoal | `#FAF7F2` cream |
| Primary accent | `#00D9FF` cyan | `#007A8E` teal |
| Inline code | `#D4AF37` gold | `#7A1F2C` burgundy |
| H1 underline | Cyan glow | Burgundy fade |
