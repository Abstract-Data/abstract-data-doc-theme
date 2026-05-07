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

- ✅ **Round 3a (current):** monorepo scaffold, theme package with core + HUD CSS, working playground.
- ⏳ **Round 3b:** custom `<Glitch>` MDX component, custom Header with version chip, Footer with credit toggle, full callout variants, expressive-code Shiki theme.
- ⏳ **Round 3c:** `packages/template/` GitHub-template companion, deployment workflows (Pages/Vercel/Cloudflare), publish setup.

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
