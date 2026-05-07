# Changelog

All notable changes to `@abstractdata/starlight-theme` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the package adheres to [Semantic Versioning](https://semver.org/).

This file is maintained by [release-please](https://github.com/googleapis/release-please) — do not hand-edit.

## [0.2.1](https://github.com/Abstract-Data/abstract-data-doc-theme/compare/starlight-theme-v0.2.0...starlight-theme-v0.2.1) (2026-05-07)


### Features

* add custom404 page and style search modal ([cb4bd21](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/cb4bd212c472efc19f8d0583cc3049bb8bdd20f2))
* **starlight-theme:** add branding, glitch component, and version chipIntroduce UI branding and motion assets for the starlight theme: ([a61d336](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/a61d3367401aeffb07ac72b684857e6f5d9f5a66))
* **starlight-theme:** add branding, glitch component, and version chipIntroduce UI branding and motion assets for the starlight theme: ([c404718](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/c404718b0f58d65be48b6b3f783f66d8c810383c))

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
