# Changelog

All notable changes to `@abstractdata/starlight-theme` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the package adheres to [Semantic Versioning](https://semver.org/).

This file is maintained by [release-please](https://github.com/googleapis/release-please) — do not hand-edit.

## 0.2.0 (unreleased)

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
