# @abstractdata/starlight-theme

Branded Astro Starlight theme by Abstract Data. HUD and Calm surfaces, light + dark, motion-aware.

## Install

```bash
bun add @abstractdata/starlight-theme
```

## Use

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Your Docs',
      plugins: [abstractData({ motion: 'full' })],
    }),
  ],
});
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `motion` | `'full' \| 'calm'` | `'full'` | HUD = animated hexagon grid, scanline, holographic shimmer, glitch. Calm = same palette, no animations. |
| `credit` | `'auto' \| 'hide'` | `'auto'` | _(Round 3b)_ Show "Built by Abstract Data" in footer. Set `'hide'` for white-label client work. |

`motion: 'full'` automatically collapses to Calm behavior when the user's OS reports `prefers-reduced-motion: reduce`. No additional config required.

## Brand

- Cyan `#00D9FF` · Gold `#D4AF37` · Burgundy `#8B2635`
- Display Orbitron · Body Inter · Mono JetBrains Mono

See the repo root `README.md` for full brand reference.
