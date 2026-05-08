# Changelog

All notable changes to `@abstractdata/create-docs` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the package adheres to [Semantic Versioning](https://semver.org/).

This file is maintained by [release-please](https://github.com/googleapis/release-please) going forward — do not hand-edit beyond bootstrapping.

## [0.2.1](https://github.com/Abstract-Data/abstract-data-doc-theme/compare/create-docs-v0.2.0...create-docs-v0.2.1) (2026-05-08)


### Features

* **docs:** add source-driven versioned API reference docs ([#17](https://github.com/Abstract-Data/abstract-data-doc-theme/issues/17)) ([76312f0](https://github.com/Abstract-Data/abstract-data-doc-theme/commit/76312f0ff8f9478538e231ed18d5fac70b835361))

## 0.3.0 (2026-05-07)

Scaffold-shape changes — projects created on `0.3.0` ship a richer baseline. No CLI flag changes.

### Features

- **`starlight-links-validator` baked in.** New scaffolds include the plugin in `dependencies` and registered in `astro.config.mjs` so CI builds fail on broken internal links by default.
- **`docsSchema({ extend })` scaffold** in `src/content.config.ts` with example fields (`category`, `audience`, `lastReviewed`) and JSDoc explaining the pattern. Replaces the bare `docsSchema()` from 0.2.x.
- **Contributor-loop config in `astro.config.mjs`.** `lastUpdated: true` enabled by default; commented `editLink: { baseUrl: '...' }` scaffold ready to uncomment once the user's repo URL is final.
- **Per-stack quickstart.** `src/content/docs/quickstart.md` ships with both Python and TypeScript autodoc subsections wrapped in HTML comment markers; the `abstract-data-setup` skill prunes the irrelevant block based on detected stacks.
- **Bundled TypeScript autodoc orchestrator.** `scripts/build-ts-docs.mjs` and `scripts/ts-autodoc.json` ship in the template so TypeScript projects can wire `bun run docs:ts` immediately.
- **Versioned API reference support.** Both autodoc orchestrators accept a `versions: [{ tag, label, default }]` array. When set, each tag is checked out via `git worktree` and the API reference is regenerated per tag into `<outputDir>/<safeTag>/`. The default version is also aliased at the un-versioned URL.
- **`<VersionPicker>` component** importable from `@abstractdata/starlight-theme/components/VersionPicker.astro` for topbar version-switching.
- **`abstract-data-docs-author` skill** (companion to `abstract-data-setup`) ships in all three tool formats. Reads source code and writes narrative prose to enrich auto-generated API pages.
- **THEME_VERSION pinning.** The CLI now pins `@abstractdata/starlight-theme` to `^0.4.0` (auto-synced via `scripts/sync-theme-version.mjs` during `prepack`).

### Bug Fixes

- **Workflows pinned to `bun-version: 1.1.45`** to match `packageManager` in root `package.json` (1.1.45 is the minimum version with text-lockfile support; previously CI ran whatever `bun-version: latest` resolved to and `--frozen-lockfile` errored on any drift).

## 0.2.0

### Features

- **Multi-tool skill distribution.** Scaffolded projects now include the `abstract-data-setup` workflow in three formats out of the box:
  - `.claude/skills/abstract-data-setup/SKILL.md` — Claude Code procedural skill (full fidelity)
  - `.cursor/rules/abstract-data-setup.mdc` — Cursor MDC rule (full fidelity)
  - `.github/copilot-instructions.md` — GitHub Copilot static reference
- **Skill compiler.** New `scripts/compile-skill.mjs` in the monorepo (run by `bun run sync-skills`) treats the Claude Code SKILL.md as source-of-truth and emits the Cursor MDC and Copilot variants automatically. The `prepack` script invokes the compiler before bundling so every published version of `@abstractdata/create-docs` ships fresh, consistent adapters across all three tools.
- **Bundled `abstract-data-setup` workflow** with 11 phases:
  1. Confirm context (verify project has `@abstractdata/starlight-theme`)
  2. Locate source project
  3. Detect Python signals
  4. Audit docstring coverage (`interrogate` or AST fallback) — green/yellow/red classification
  5. Detect docstring style (Google / NumPy / Sphinx / mixed)
  6. Recommend modules to document
  7. Gather brand configuration (motion, credit, version)
  8. Write configs (`scripts/python-autodoc.json`, `astro.config.mjs` sidebar + plugin, `package.json` scripts)
  9. Optionally run `bun run docs:python`
  10. Optional pre-commit hook installation in the source project (interrogate)
  11. Summary
- **CLI "next steps" output** now lists all three tool installations and tells the user which folders to delete if they don't use a given tool.

## 0.1.0

### Features

- Initial release. CLI scaffolder for new Abstract Data documentation projects.
- Copies the `@abstractdata/docs-template` files into a user-named folder.
- Patches `package.json` (replaces `workspace:*` with the published theme version, sets project name + version + private), patches `astro.config.mjs` (project title), runs `git init` + initial commit.
- Branded ANSI banner and "next steps" output.
