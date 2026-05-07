# AGENTS.md — abstract-data-doc-theme

> Operating instructions for AI agents working in this repo. Humans should read this too.

## What this repo is

A Bun-workspaces monorepo containing the Abstract Data Starlight documentation theme, a local playground that consumes it, and (eventually) a GitHub template repo for client project scaffolding.

- `packages/starlight-theme/` — the `@abstractdata/starlight-theme` npm package. **This is the deliverable.**
- `apps/playground/` — private dev site, never published. Consumes the theme via `workspace:*`.
- `mockup.html` — round-two static HTML mockup. Source of truth for visual decisions until Round 3 lands. Don't delete.

## Package manager

**Bun, always.** Do not switch to npm, yarn, or pnpm.

```bash
bun install                    # install all workspaces
bun dev                        # run the playground
bun --filter '*' typecheck     # typecheck every workspace
```

Lockfile is `bun.lock` (text-based). Commit it.

## Directory write rules

- **Read freely:** the entire repo.
- **Write freely:** `packages/starlight-theme/src/`, `apps/playground/src/`, `apps/playground/public/`, `packages/template/` (when it exists), root configs.
- **Don't touch without explicit ask:** `mockup.html` (visual reference), `.git/`, `bun.lock` directly (let bun manage it), `node_modules/`.

## Brand & design rules

- Palette and fonts are locked. See `README.md` for hex values and font stack. **Do not introduce new colors or fonts** without explicit approval.
- Two motion modes only: `full` (HUD) and `calm` (Blueprint). No third intensity.
- HUD mode must respect `prefers-reduced-motion` and gracefully collapse to Calm. Already wired in `styles/hud.css`.
- Light mode shifts cyan to a darker teal (`#007A8E`) for AA contrast. Don't use raw `#00D9FF` on cream backgrounds.

## Code conventions

- TypeScript everywhere. No `any` unless commented and justified.
- The plugin entry (`packages/starlight-theme/src/index.ts`) stays small. Heavy lifting goes in CSS or Astro components.
- CSS uses Starlight's CSS custom properties (`--sl-color-*`, `--sl-font*`) for theming. Custom decoration (bracket bars, glows, scanlines) layers on top via additional selectors.
- Components live in `packages/starlight-theme/src/components/` and override Starlight's component slots via the plugin's `updateConfig({ components })` call.

## What's done / what's next

- ✅ **Round 3a:** monorepo scaffold, theme package with core + HUD CSS, working playground.
- ✅ **Round 3b:** `<Glitch>` MDX component, `SocialIcons` override with version chip, `Footer` override with credit toggle, virtual config module via `addIntegration` + Vite plugin, release-please workflow.
- ✅ **Round 3c:** branded Shiki/expressive-code themes (cyan/gold/burgundy), custom `<Hero>` component using Astro's `<Image>`, gold ghost button polish, light-mode hex visibility bumped, branded TOC right sidebar, `packages/template/` template package with GitHub Pages workflow.
- ✅ **Round 3.5 (QA):** branded `404.astro` with Glitch headline, search modal styling (`site-search dialog` + `::backdrop`), expanded `prefers-reduced-motion` block, mobile/light/calm walkthrough confirmed.
- ✅ **Round 4:** self-hosted variable fonts via `@fontsource-variable/*` (no Google Fonts CDN), Vercel + Cloudflare Pages workflow variants in template, kitchen-sink showcase page, migration guide for existing Starlight users, `mockup.html` archived to `docs/`.
- ⏳ **Future:** `bun create @abstractdata/docs` CLI scaffolder (separate `create-abstractdata-docs` package).

## Non-obvious gotchas — read before adding features

These are mistakes round 3 stepped on so you don't have to:

- **Set `expressiveCode.themes` in the user's `astro.config.mjs`, not via the plugin's `updateConfig`.** Starlight's expressive-code integration locks its config before plugin `config:setup` hooks run — passing `expressiveCode` from the plugin gets silently overridden. The plugin still ships the themes via `./shiki` export and tries to set them by default (`shiki: true`), but the reliable path is explicit user config + `shiki: false` to opt out of the plugin's attempt. Both the playground and template demonstrate this.
- **Starlight's page title is `<h1 id="_top">` inside `.sl-container`, not `h1[data-page-title]`.** When hiding or styling the auto-rendered title (e.g., on the 404 page), use the right selector.
- **Starlight's hero buttons use `.sl-link-button.primary` / `.sl-link-button.secondary`,** not `.action.primary`. Target those for hero-button styling.
- **Starlight's search modal DOM is `<site-search> → <dialog> → <div.dialog-frame>`,** not a dialog with `aria-label="Search"`. Use `site-search dialog` as the root selector.
- **Expressive-code requires hex colors (including hex+alpha like `#00d9ff2e`) in theme `colors` blocks** — `rgba()` is rejected with "Invalid color value, expected a hex color." CSS files outside the Shiki theme can use `rgba()` freely.
- **The `<Image>` component must import the asset as ImageMetadata.** Use `import { Image } from 'astro:assets'` for the value and `import type { ImageMetadata } from 'astro'` for the type — they live in different modules.

## Commit messages — Conventional Commits

Releases are automated via [release-please](https://github.com/googleapis/release-please). Commit messages MUST follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat: add Glitch MDX component` → minor bump
- `fix: callout border color in light mode` → patch bump
- `feat!: rename motion 'full' to 'hud'` (or `BREAKING CHANGE:` in body) → major bump
- `docs:`, `chore:`, `refactor:`, `style:`, `test:`, `build:`, `ci:` → no version bump
- Scope is optional but recommended: `feat(theme): ...`, `fix(plugin): ...`

`release-please` opens a release PR on every push to `main`. Merging it tags the release and triggers the npm publish workflow.

## Loop closure

Before claiming any task complete:

1. `bun --filter @abstract-data/playground build` succeeds.
2. `bun --filter '*' typecheck` succeeds.
3. The playground renders in both `motion: 'full'` and `motion: 'calm'` configs.
4. Commits use Conventional Commits format (verified by reviewer).

## Compaction trigger

If the agent's context is approaching limits, re-read this file and `mockup.html` before proceeding.
