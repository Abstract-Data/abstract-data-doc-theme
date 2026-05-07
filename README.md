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

Fonts ship self-hosted (variable woff2 files via `@fontsource-variable/*`) — no Google Fonts CDN dependency, GDPR-friendly, faster first paint.

See `docs/round-2-mockup.html` for the round-two visual reference this scaffold was built against.

## Releasing

Releases are automated by [release-please](https://github.com/googleapis/release-please). Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `feat!:`, etc.) and merge to `main` — release-please will:

1. Open a release PR with version bump + CHANGELOG entry.
2. On merge, tag the release as `starlight-theme-v0.x.y`.
3. Publish `@abstractdata/starlight-theme` to npm with provenance.

### One-time GitHub setup

To enable the workflow:

1. **Allow Actions to create PRs.** Settings → Actions → General → "Workflow permissions" → check **"Allow GitHub Actions to create and approve pull requests"**.
2. **Add an `NPM_TOKEN` secret.** Settings → Secrets and variables → Actions → New repository secret. Generate an npm automation token at npmjs.com → Account → Access Tokens → Granular Access Token (read+write to `@abstractdata` scope).
3. **Claim the npm scope.** First publish must be a human one — `cd packages/starlight-theme && bun publish --access public` (or `npm publish --access public`) — to register `@abstractdata/starlight-theme`. After that, the workflow can publish on its own.

## Repo conventions

See `AGENTS.md` for what agents should and should not touch in this repo, including the Conventional Commits requirement.
