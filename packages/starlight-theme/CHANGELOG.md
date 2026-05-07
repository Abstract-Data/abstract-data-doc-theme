# Changelog

All notable changes to `@abstractdata/starlight-theme` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the package adheres to [Semantic Versioning](https://semver.org/).

This file is maintained by [release-please](https://github.com/googleapis/release-please) going forward — do not hand-edit beyond bootstrapping.

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
