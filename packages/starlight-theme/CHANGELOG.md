# Changelog

All notable changes to `@abstractdata/starlight-theme` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the package adheres to [Semantic Versioning](https://semver.org/).

This file is maintained by [release-please](https://github.com/googleapis/release-please) going forward — do not hand-edit beyond bootstrapping.

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
