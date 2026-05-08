# Changelog

All notable changes to `@abstractdata/starlight-theme` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the package adheres to [Semantic Versioning](https://semver.org/).

This file is maintained by [release-please](https://github.com/googleapis/release-please) going forward — do not hand-edit beyond bootstrapping.

## 0.4.0 (2026-05-07)

A theming + DX release focused on the rough edges that show up after consumers ship a real client docs site. No breaking API changes; user CSS keeps working but now wins more cleanly.

### Features

- **Cascade layer (`@layer abstract-data`).** All theme styles in `theme.css` and `hud.css` are wrapped in a named cascade layer. Unlayered user CSS in `customCss` automatically wins without `!important`. The biggest visual-customization unlock per Starlight 0.34+ best practice.
- **Versioned API reference (source-driven pattern).** `build-python-docs.mjs` and `build-ts-docs.mjs` accept a `versions: [{ tag, label, default }]` array. Each tag is checked out via `git worktree add` and regenerated into `<outputDir>/<safeTag>/`. The default version is also aliased at the un-versioned URL so existing links keep working. Pages get `version:` + `versionLabel:` frontmatter and a `:::caution[Older version]` banner on non-default builds. See `apps/playground/src/content/docs/recipes/versioned-docs.md`.
- **`<VersionPicker>` component, zero-config.** As soon as the autodoc orchestrator emits versioned pages, the picker appears in the topbar automatically — the plugin's existing `SocialIcons` override now composes it with the version chip and social links. The picker walks `getCollection('docs')` at build time for pages with `version:` frontmatter, dedupes by tag, and detects the default via `versionDefault: true`. No user override file required, no separate `versions` prop to maintain — the autodoc JSON is the single source of truth. New `abstractData({ apiBase })` plugin option points the picker at the right base URL when `outputDir` differs from `/api`. Vanilla JS custom element on the client side; no React, no hydration cost. The `<VersionPicker>` component is also importable directly from `@abstractdata/starlight-theme/components/VersionPicker.astro` for users who want to curate the dropdown manually.
- **`abstract-data-docs-author` skill — Phase 1.5 (prose inventory).** New phase that audits the source project's `README.md`, `CHANGELOG.md`, ADRs, and existing docstrings before writing new prose. The skill now lifts existing wording with attribution rather than fabricating from scratch.
- **`abstract-data-docs-author` skill — route-middleware section.** Documents that JSON-LD, dynamic OG meta, and breadcrumb structured data belong in `routeMiddleware`, not `<Head>` overrides. Includes a working `defineRouteMiddleware()` snippet.
- **`abstract-data-setup` skill — TSDoc coverage audit (Phase 5a).** Mirrors Phase 4a's `interrogate` Python audit using TypeDoc's `--validation.notDocumented`. Categorizes per-file as green/yellow/red. Phase 12 expanded to install pre-commit hooks for both stacks.
- **`abstract-data-setup` skill — Phase 7.5 (optional plugin offers).** Multi-select prompt for `starlight-llms-txt`, `@expressive-code/plugin-package-managers`, and `starlight-image-zoom` with smart per-project defaults.
- **`abstract-data-setup` skill — Phase 8 contributor-loop config.** Now also asks about `lastUpdated: true` and `editLink.baseUrl` (auto-derives the repo URL from `package.json` or `git remote`).
- **`abstract-data-setup` skill — Phase 9 light/dark logo branching.** When Phase 6 detected a light/dark file pair, Phase 9 now writes `logo: { light, dark }` directly instead of asking which file to use as the default.
- **`abstract-data-setup` skill — Phase 10(f) per-stack quickstart pruning.** Strips the irrelevant Python/TypeScript autodoc subsection from the scaffolded `quickstart.md` based on detected stacks.
- **`abstract-data-setup` skill — Phase 11.7 (versioning strategy chooser).** Fires when source has 2+ tags. Multi-choice between source-driven (recommended), `starlight-versions` plugin, branch-per-version, or single version.
- **`abstract-data-setup` skill — Phase 12.5 (links-validator verification).** Confirms `starlight-links-validator` is wired in the docs project and CI workflow.
- **Thin-page post-processor (Python + TS autodoc).** Detects empty package landing pages and auto-generates a `## Submodules` section linking to siblings with descriptions. Detects truly-empty leaf pages and injects a `:::note[This page is sparse]` banner. Optional "View source on GitHub" footer when `repoUrl` is configured (and `repoBranch` honors versioned-build tags automatically).
- **Per-stack quickstart in template.** `packages/template/src/content/docs/quickstart.md` ships with both Python and TypeScript autodoc subsections wrapped in `<!-- abstract-data-setup:python-autodoc -->` / `<!-- abstract-data-setup:ts-autodoc -->` markers; the setup skill prunes the irrelevant block.

### Bug Fixes

- **Sandbox CI: pin Bun to 1.1.45.** Workflow files now use `bun-version: 1.1.45` instead of `latest`. Matches `packageManager` in root `package.json` (1.1.45 is the minimum version with text-lockfile support).
- **`bun.lock` workspace versions resynced** to match each workspace's actual `package.json` (`@abstractdata/create-docs` 0.3.0, `@abstractdata/starlight-theme` 0.4.0).

## [0.3.2](https://github.com/Abstract-Data/abstract-data-doc-theme/compare/starlight-theme-v0.3.1...starlight-theme-v0.3.2) (2026-05-07)


### Documentation

* clarify branding and rename skill/title ([#11](https://github.com/Abstract-Data/abstract-data-doc-theme/issues/11)) ([9638dbd](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/9638dbd26cdf260f92c66058f326baa41bc9f8da))

## [0.3.1](https://github.com/Abstract-Data/abstract-data-doc-theme/compare/starlight-theme-v0.3.0...starlight-theme-v0.3.1) (2026-05-07)


### Features

* add custom404 page and style search modal ([cb4bd21](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/cb4bd212c472efc19f8d0583cc3049bb8bdd20f2))
* **starlight-theme:** add branding, glitch component, and version chipIntroduce UI branding and motion assets for the starlight theme: ([a61d336](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/a61d3367401aeffb07ac72b684857e6f5d9f5a66))
* **starlight-theme:** add branding, glitch component, and version chipIntroduce UI branding and motion assets for the starlight theme: ([c404718](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/c404718b0f58d65be48b6b3f783f66d8c810383c))

## 0.3.0

### Features

- **Branded Shiki/expressive-code themes** (light + dark) so code blocks use the brand palette: cyan keywords, gold strings, light-cyan functions in dark mode; burgundy keywords, gold-deep strings, teal-deep functions in light mode. Exported from `@abstractdata/starlight-theme/shiki`.
- **Custom `<Hero>` component** using Astro's `<Image>` for optimized splash logos. Cyan/gold gradient bracket bar on the H1, primary cyan + gold-ghost secondary action buttons, drop-shadow glow on the image.
- **Branded search modal** — cyan focus ring on the input, blurred backdrop, brand-themed pagefind result links and excerpt highlights. Targets `site-search dialog` selectors directly.
- **Self-hosted variable fonts** — Inter, Orbitron, JetBrains Mono via `@fontsource-variable/*` packages. No more Google Fonts CDN dependency. GDPR-friendly, faster first paint, smaller bundles than the equivalent static-weight @fontsource imports.
- **Branded TOC right sidebar** — Orbitron group labels, cyan-deep active indicator, refined typography matching the rest of the brand.
- **Light-mode hexagon backdrop** bumped to opacity 0.18 (from 0.10) so it's visible without dominating.
- **Hero secondary button** now correctly styled as a gold ghost button (was previously rendering as a default cyan secondary).
- **`shiki: false` plugin option** to opt out of auto-applying the branded Shiki themes (recommended pattern when consumers configure `expressiveCode.themes` directly in `astro.config.mjs`).

### Bug Fixes

- Fixed `prefers-reduced-motion` block to also clear `.hero h1` text-shadow and the search input cyan glow halo.
- Pydoc-markdown's escaped underscores in module titles now render cleanly in the sidebar.

### Documentation

- New 404 page using `<Glitch text="404" />` as the centerpiece, with a "Back to home" cyan ghost button. Renders correctly in light (burgundy glitch) and dark (cyan glitch) modes.
- Kitchen-sink showcase page demonstrating every component, callout, code language, table, tab group, steps, cards, and primitive in one place.
- Migration guide for adopting the theme into existing Starlight projects.
- Vercel and Cloudflare Pages deploy workflow variants alongside the existing GitHub Pages workflow.

## [0.2.1](https://github.com/Abstract-Data/abstract-data-doc-theme/compare/starlight-theme-v0.2.0...starlight-theme-v0.2.1) (2026-05-07)


### Features

* add custom404 page and style search modal ([cb4bd21](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/cb4bd212c472efc19f8d0583cc3049bb8bdd20f2))
* **starlight-theme:** add branding, glitch component, and version chipIntroduce UI branding and motion assets for the starlight theme: ([a61d336](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/a61d3367401aeffb07ac72b684857e6f5d9f5a66))
* **starlight-theme:** add branding, glitch component, and version chipIntroduce UI branding and motion assets for the starlight theme: ([c404718](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/c404718b0f58d65be48b6b3f783f66d8c810383c))

## 0.2.0

### Features

- Custom `SocialIcons` override that renders an optional version chip in the header.
- Custom `Footer` override with configurable Abstract Data credit (`credit: 'auto' | 'hide'`).
- New `<Glitch />` MDX component with RGB-channel split + clip-path animation; respects `prefers-reduced-motion`.
- Plugin now exposes its config to components via the `virtual:abstractdata/config` Vite virtual module.

## 0.1.0

### Features

- Initial release. Bun-workspaces monorepo scaffold, theme package skeleton, working playground.
- HUD and Calm motion modes, light + dark surfaces, Orbitron/Inter/JetBrains Mono typography.
- H1 cyan→gold bracket bar, animated hexagon backdrop, holographic shimmer on code blocks, branded callouts.
