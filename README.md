# Abstract Data · Starlight Theme

Branded documentation theme by Abstract Data, built on [Astro Starlight](https://starlight.astro.build/). Drop in for any client project — premium polish, brand-locked surfaces, opinionated defaults.

This is a Bun-workspaces monorepo:

- `packages/starlight-theme/` — the published `@abstractdata/starlight-theme` npm package.
- `apps/playground/` — local Starlight site that consumes the package end-to-end (this is what `bun dev` runs).
- `packages/template/` — _(coming in round 3c)_ the GitHub template clients clone for new projects.

## Quickstart (local development)

```bash
bun install
bun dev
```

The playground will boot at `http://localhost:4321`. Edit any file under `packages/starlight-theme/src/` or `apps/playground/src/content/docs/` and the page hot-reloads.

## Surfaces

The theme ships two motion modes:

| Mode | Config | Use for |
|------|--------|---------|
| **HUD** _(default)_ | `motion: 'full'` | Marketing-y docs, abstractdata.io, landing pages |
| **Calm** | `motion: 'calm'` | Long-form client docs, internal wikis |

Both modes work in light and dark, follow the user's system preference by default, and respect `prefers-reduced-motion` (HUD auto-collapses to Calm when the OS requests it).

## Configuration

```js
// astro.config.mjs
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Acme Docs',
      logo: { src: './src/assets/your-logo.png', replacesTitle: true },
      plugins: [
        abstractData({
          motion: 'full', // 'full' | 'calm'
          credit: 'auto', // 'auto' | 'hide'  (Built-by-Abstract-Data footer)
        }),
      ],
    }),
  ],
});
```

## Brand reference

The theme palette and motion vocabulary are extracted from the live abstractdata.io site:

- **Cyan** `#00D9FF` — primary accent, links, active state
- **Gold** `#D4AF37` — secondary accent, inline code, version chip
- **Burgundy** `#8B2635` / `#7A1F2C` — danger callouts, light-mode headlines
- **Charcoal** `#0A0A0A` / `#101116` — dark surfaces
- **Cream** `#FAF7F2` — light surface
- **Magenta** `#FF00DE` — glitch overlay (HUD only, used sparingly)
- Display: **Orbitron** · Body: **Inter** · Mono: **JetBrains Mono**

See `mockup.html` (in the repo root) for the round-two visual reference this scaffold was built against.

## Repo conventions

See `AGENTS.md` for what agents should and should not touch in this repo.
