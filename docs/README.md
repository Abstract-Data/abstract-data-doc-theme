# Abstract Data Starlight Theme — Internal Docs

This folder contains design and decision artifacts for the theme. None of it ships in the published npm package.

## Files

- **`round-2-mockup.html`** — the static HTML mockup we built in round two as the visual reference. The actual rendered Starlight theme is built against this. Keep it for visual regression and historical context.

## Round history

- **Round 1** — Brainstorm: visual direction, palette, typography, dual-mode plan.
- **Round 2** — Visual mockup (this folder's `round-2-mockup.html`). HUD vs Calm side-by-side. Locked the design language.
- **Round 3a** — Monorepo scaffold. `@abstractdata/starlight-theme` package + playground app rendering HUD Dark.
- **Round 3b** — Component overrides (SocialIcons + version chip, Footer + credit toggle), Glitch MDX component, virtual config module, release-please wiring.
- **Round 3c** — Branded Shiki/expressive-code themes, custom Hero component using `<Image>`, button polish, light-mode hex visibility, branded TOC, template package with deploy workflows.
- **Round 3.5** — QA pass: 404 page with Glitch, search modal styling, mobile/light/calm walkthrough, prefers-reduced-motion coverage.
- **Round 4** — Self-hosted fonts, Vercel/Cloudflare deploy variants, kitchen-sink showcase page, migration guide.
