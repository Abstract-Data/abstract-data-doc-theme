# Changelog

All notable changes to `@abstractdata/create-docs` are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/) and the package adheres to [Semantic Versioning](https://semver.org/).

This file is maintained by [release-please](https://github.com/googleapis/release-please) going forward — do not hand-edit beyond bootstrapping.

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
