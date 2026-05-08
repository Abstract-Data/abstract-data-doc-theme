---
name: abstract-data-setup
description: Set up the Abstract Data Documentation Theme (built on Astro Starlight) for a project. Detect source code across stacks (Python, TypeScript, Next.js, TanStack, OpenAPI, Prisma, Drizzle), audit docstring coverage for Python, sniff docstring style (Google/NumPy/Sphinx), detect or pick a logo asset, ask configuration questions (modules/entry points, motion, credit, version), wire up config files (scripts/python-autodoc.json, scripts/ts-autodoc.json, astro.config.mjs sidebar + plugin options, package.json scripts), and optionally install a docstring-coverage pre-commit hook. Use when the user says "set up docs", "configure docs", "wire up Python autodoc", "wire up TypeScript autodoc", "scan my project for docs", "set up Abstract Data docs", "add API reference", "audit docstrings", or similar phrases inside a docs project that uses @abstractdata/starlight-theme (the npm package name; product is the Abstract Data Documentation Theme).
---

# Abstract Data Documentation Theme — Setup

Bootstrap the Abstract Data Documentation Theme — the branded docs system Abstract Data uses across client projects, built on Astro Starlight and shipped as the npm package `@abstractdata/starlight-theme`. Round 2 covers Python and TypeScript autodoc with full automation, plus detection-and-recipe handling for Next.js, TanStack Router, OpenAPI, Prisma, and Drizzle.

## When to invoke

Run this skill when the user says "set up docs", "configure docs", "wire up Python autodoc", "wire up TypeScript autodoc", "scan my project for docs", "audit docstrings", or similar inside a project that has `@abstractdata/starlight-theme` in its `package.json`. If the cwd doesn't have that dep, stop and point them at `bun create @abstractdata/docs`.

## Workflow

Use interactive prompts for every choice — never assume.

### Phase 1 — Confirm context

Read `package.json`. Verify `@abstractdata/starlight-theme` is in deps; verify `astro.config.mjs` and `src/content/docs/` exist. Stop with a clear message if any check fails. Don't ask the user to confirm — just announce findings and move on.

### Phase 2 — Locate the source project(s)

Ask via interactive prompt: where does the source project live?
- "This directory" — docs ARE the source (rare)
- "Parent directory (..)" — docs sit inside the source repo
- "Sibling directory" — separate repos at the same level
- "Custom path" — prompt for it

Validate the path exists. Reprompt on invalid.

### Phase 3 — Detect all stack signals

In the source path, scan for these signals in parallel. Report what you find before asking any per-stack questions.

**Python:**
- `pyproject.toml`, `setup.py`, `requirements.txt`, `Pipfile`
- `src/<pkg>/__init__.py` or `<pkg>/__init__.py`

**TypeScript library:**
- `tsconfig.json` AND `package.json` with `main`/`exports`/`types` fields
- `src/index.ts` or similar entry point

**Next.js:**
- `next.config.{js,mjs,ts}`
- `app/` directory (App Router) or `pages/` directory (Pages Router)
- `next` in dependencies

**TanStack Router / Start:**
- `@tanstack/react-router`, `@tanstack/react-start`, or `@tanstack/start` in dependencies
- `src/routes/` directory
- `src/routeTree.gen.ts` (generated route tree)

**OpenAPI:**
- `openapi.yaml`, `openapi.json`, `swagger.yaml`, `swagger.json`
- Files matching `*.openapi.{yaml,json}`

**Prisma:**
- `prisma/schema.prisma`

**Drizzle:**
- `drizzle.config.{ts,js}`
- Files in a `schema/` directory exporting `pgTable` / `mysqlTable` / `sqliteTable`

**Logo asset (in the docs project, not the source):**
- `src/assets/*.{png,svg,jpg,jpeg,webp}` — anything that looks like a logo (`logo.*`, `*-logo.*`, `brand.*`)

Display the detection summary in a table:

```
Stack          Detected   Action
Python         yes        will offer Python autodoc
TypeScript     yes        will offer TypeScript autodoc
Next.js        no         —
TanStack       yes        recipe-only (no auto-config)
OpenAPI        no         —
Prisma         yes        recipe-only (no auto-config)
Drizzle        no         —
Logo           1 file     will confirm choice
```

If no source signals at all → exit politely.

### Phase 4 — Python: audit + style (only if Python detected)

#### 4a — Audit docstring coverage

Preferred tool: `interrogate` (`pipx install pydoc-markdown` first if not installed). Fall back to a Python AST one-liner. Categorize per-module:
- **≥ 80%** green
- **50-79%** yellow
- **< 50%** red

Show the table; don't editorialize.

#### 4b — Detect docstring style

Sample 10–20 docstrings, count distinctive markers (Google `Args:`/`Returns:`, NumPy `Parameters\n----`, Sphinx `:param x:`). Pick the leader if it has ≥60% of markers; otherwise call it "mixed."

### Phase 5 — TypeScript: entry-point detection (only if TS library detected)

Read `package.json` `main`/`exports`/`types` fields. Walk `src/` for `index.ts` files. Build a candidate list of entry points (one per public module surface).

Common shapes:
- Single entry: `src/index.ts` → one entry point
- Multi-entry: `package.json` `exports` lists multiple → one entry per exported subpath
- Monorepo: each package has its own entry

#### 5a — Audit TSDoc coverage

Mirror Phase 4a for TypeScript. Run TypeDoc in **validation-only** mode against the chosen entry points:

```bash
bunx typedoc \
  --plugin typedoc-plugin-markdown \
  --validation.notDocumented \
  --treatValidationWarningsAsErrors false \
  --emit none \
  <entryPoints>
```

Parse the resulting warnings — TypeDoc emits one line per undocumented symbol with `[warning]` prefix. Group by source file and report per-file coverage as a percentage of public exports that have at least one TSDoc block. Use the same color thresholds as the Python audit:

- **≥ 80%** green
- **50–79%** yellow
- **< 50%** red

If TypeDoc isn't installed yet, fall back to a quick AST sniff: count files in `src/` with `/**` blocks vs total exported declarations. Coarser, but no install required.

Show the table; don't editorialize. The result feeds Phase 12 (pre-commit hook offer).

### Phase 6 — Logo detection

Scan `src/assets/**/*.{png,svg,jpg,jpeg,webp}` recursively. Build candidate categories:

- **Topbar mark candidates**: filename matches `(logo|brand|mark|icon)\.(svg|png|webp)$` (case-insensitive). SVG preferred.
- **Light/dark pair**: filenames contain `light` or `dark` and otherwise match logo conventions (e.g. `logo-light.svg` + `logo-dark.svg`). Starlight supports both via `logo.light` + `logo.dark`.
- **Hero candidates**: any image larger than ~80KB or with `hero` / `splash` in the name — usually a bigger variant for the splash page.
- **Other images**: no logo conventions; treat as miscellaneous.

For each candidate, gather:
- File size in bytes
- Format (extension)
- Whether the filename indicates light/dark intent

Display a 4-7 line summary table:

```
File                              Size      Format     Suggested role
src/assets/logo.svg               12 KB     SVG        topbar mark (recommended)
src/assets/logo-light.svg         12 KB     SVG        topbar (light mode)
src/assets/logo-dark.svg          12 KB     SVG        topbar (dark mode)
src/assets/hero-mark.png          145 KB    PNG        splash hero image
```

Branch on what you found:

- **One mark + light/dark pair** → propose using the pair (Starlight handles auto-switching by `data-theme`)
- **One mark, no pair** → propose using it for both modes
- **Multiple marks, no clear winner** → multiselect: which for topbar? Which for hero? `multiSelect: true` interactive prompt.
- **Zero candidates** → ask: "I don't see a logo in `src/assets/`. Drop one in (SVG preferred, ~256x256 minimum), tell me where it is, or skip for now and configure manually later."

Format guidance to surface alongside the prompt:
- SVG renders crispest at any size; preferred for both topbar and hero.
- PNG works fine; 256×256 minimum for the topbar (Astro will downscale via the asset pipeline).
- JPG is fine for hero photos but bad for marks (compression artifacts on edges).
- Files > 200KB will bloat first-paint; suggest optimizing or using a smaller source.

### Phase 7 — Recommend documentation surfaces

For each detected stack, ask whether to wire it up. Stack questions are per-stack, not lumped together.

#### Python (if detected)

Interactive prompt with up to 4 options:
- "Top-level package only" (Recommended)
- "All green-coverage modules" (≥80%)
- "Specific submodules I'll pick" → multiselect
- "Everything" (warn about red-coverage modules)

#### TypeScript (if detected)

Interactive prompt:
- "Single root entry point (src/index.ts)" (Recommended for libs with one public API)
- "All paths in package.json `exports`" (Recommended for multi-entry libs)
- "I'll pick specific entry points" → free-form

#### Other detected stacks (Next.js, TanStack, OpenAPI, Prisma, Drizzle)

Don't auto-configure. Tell the user the recipe and let them follow up:

- **Next.js**: "I detected Next.js. There isn't a standard one-shot route documenter, but you can write a small build script that walks `app/` or `pages/` and emits a `routes.md`. Want me to draft one?"
- **TanStack Router**: "I detected TanStack Router. Generate a route map by importing `routeTree.gen.ts` and walking it in a build script. Want a starter?"
- **OpenAPI**: "I detected an OpenAPI spec. Recommend `@astrojs/starlight-openapi` for the cleanest integration. Want me to install it and wire it up?"
- **Prisma**: "I detected a Prisma schema. Try `prisma-markdown` for schema docs. Want me to add it to dev deps and wire a script?"
- **Drizzle**: "I detected a Drizzle config. There isn't a mature schema-to-markdown tool yet — most teams write their own walker over the schema exports. Want me to draft a starter?"

If the user says yes to any of these, fall back to free-form work — these aren't covered by the main config files.

### Phase 8 — Gather brand configuration

Read existing `astro.config.mjs`. If `motion`, `credit`, and `version` are already set and the user hasn't asked to change them, skip this phase.

Otherwise, batch into one prompt:
1. Motion: full | calm (Recommended)
2. Credit: auto | hide
3. Version chip: show with version string | omit

### Phase 9 — Configure logo

Two surfaces need updating:

**a) Topbar logo — `astro.config.mjs` `starlight.logo`**

Ask the user one final question if not already known: does this logo image include the project name as text/wordmark?

- **Yes** (logo + wordmark in one image) → `replacesTitle: true` — Starlight hides the text title and shows just the logo.
- **No** (just a mark/icon, no text) → `replacesTitle: false` — Starlight shows the mark beside the text title.

Then write the config:

```js
// Single mark
logo: {
  src: './src/assets/logo.svg',
  replacesTitle: false,
}

// Light/dark pair
logo: {
  light: './src/assets/logo-light.svg',
  dark: './src/assets/logo-dark.svg',
  replacesTitle: true,
}
```

If a `logo:` block already exists in the config, edit it in place — don't add a duplicate. If `logo:` is in a comment or commented-out, uncomment and update.

**b) Splash hero image — `src/content/docs/index.mdx` `hero.image.file`**

Default Starlight splash hero supports a separate (usually larger) image. Check the existing `index.mdx` frontmatter:

```yaml
hero:
  image:
    file: ../../assets/hero-mark.png
    alt: <project name>
```

If a hero candidate was identified in Phase 6, update this path. If the same logo serves both roles, point both at the same file. If the user wants to use the branded `<Hero>` MDX component (richer than the frontmatter hero), point them at the migration guide section that covers it.

**Verify after writing:**

After both surfaces are updated, encourage the user to run `bun dev` and visually confirm the logo renders correctly in both light and dark modes (toggle from the topbar). Common issues:
- Logo is white-on-white in light mode → need a dark variant or use the `light`/`dark` pair pattern
- Logo is way too small/large → adjust the source dimensions or add CSS overrides via `customCss`
- File path is wrong → relative paths in `astro.config.mjs` are relative to the project root, not the file itself

### Phase 10 — Write configs

Show diffs in your reasoning before writing.

#### a) `scripts/python-autodoc.json` (if Python wired up)

```json
{
  "searchPath": "<relative path>",
  "modules": [...],
  "outputDir": "src/content/docs/api"
}
```

#### b) `scripts/ts-autodoc.json` (if TypeScript wired up)

```json
{
  "entryPoints": [...],
  "tsconfig": "<relative path>",
  "outputDir": "src/content/docs/api/ts"
}
```

#### c) `astro.config.mjs`

Multi-edit:

1. Sidebar — ensure entries exist for each enabled generator:
   - `{ label: 'Python API', autogenerate: { directory: 'api' } }` — if Python
   - `{ label: 'TypeScript API', autogenerate: { directory: 'api/ts' } }` — if TS
2. Plugin call — update `motion`/`credit`/`version` from Phase 8.
3. Logo — update `logo.src` from Phase 9.

Don't duplicate sidebar entries. Don't add a second `abstractData(...)` plugin call.

#### d) `package.json`

Add scripts conditionally:
- `"docs:python": "node scripts/build-python-docs.mjs"` — if Python wired up
- `"docs:ts": "node scripts/build-ts-docs.mjs"` — if TS wired up

Update the `build` script to chain them:
```json
"build": "bun run docs:python && bun run docs:ts && astro check && astro build"
```
(Skip the chains for stacks not enabled.)

#### e) Required dev deps for TS

If TS wired up, add to dev deps:
```bash
bun add -d typedoc typedoc-plugin-markdown
```

Tell the user to run this; don't run it yourself.

#### f) Tailor `src/content/docs/quickstart.md` to the detected stack

The scaffolded `quickstart.md` ships with both Python and TypeScript autodoc subsections wrapped in HTML comment markers:

```html
<!-- abstract-data-setup:python-autodoc -->
…Python instructions…
<!-- /abstract-data-setup:python-autodoc -->

<!-- abstract-data-setup:ts-autodoc -->
…TypeScript instructions…
<!-- /abstract-data-setup:ts-autodoc -->
```

After you've finalized the stack(s) for this project (Phase 7), edit `quickstart.md` to remove the irrelevant block:

- **Python only** → strip everything between `<!-- abstract-data-setup:ts-autodoc -->` and `<!-- /abstract-data-setup:ts-autodoc -->` (inclusive).
- **TypeScript only** → strip the Python block similarly.
- **Both** → leave both blocks; remove only the comment markers themselves so the published page is clean.
- **Neither** (no autodoc wired up) → strip both blocks plus the "## Add API reference" heading and intro paragraph.

This is idempotent: re-runs of the skill check whether the markers still exist before pruning. If the user has already removed the markers (or hand-edited the file), leave it alone — never re-inject content into a customized quickstart.

### Phase 11 — Optionally run generators

Per enabled generator, ask: "Generate now? [Yes / No]"

- Python → `bun run docs:python`
- TypeScript → `bun run docs:ts`

Pass through any tool-not-installed errors verbatim.

### Phase 11.5 — Offer docs-author dispatch (if generators ran)

After generation, scan `src/content/docs/api/` for **thin pages** — auto-generated files whose body (after frontmatter and the auto-rendered H1) is fewer than ~200 bytes, OR pages that consist of just signatures with no descriptive prose. These are the "what the heck is this?" pages — the source's docstrings are too sparse for the mechanical autodoc to produce useful output.

If any thin pages are found, surface this to the user:

> "I noticed N of the generated API pages are sparse — your source's docstrings are thin. The companion skill `abstract-data-docs-author` reads the source code itself and writes narrative prose to enrich those pages (module overview, usage example from tests, related-modules cross-references). Want me to invoke it now?"

If yes: hand off to the `abstract-data-docs-author` skill (Claude Code: load the skill at `.claude/skills/abstract-data-docs-author/SKILL.md`; Cursor: refer to `.cursor/rules/abstract-data-docs-author.mdc`). Pass along the project profile and detected stack info so the docs-author skill doesn't have to re-discover.

If no thin pages found, skip this phase silently. Don't push the docs-author skill on a project that doesn't need it.

### Phase 12 — Optional pre-commit hook (per-stack)

Fires only if Phase 4a (Python) or Phase 5a (TypeScript) found modules below the 80% coverage threshold.

**Python branch** — if Phase 4a found yellow/red modules, offer:

- Tool: `interrogate` (lightweight, no project changes beyond the hook entry).
- Config: append a `[tool.interrogate]` table to `pyproject.toml` setting `fail-under = 80`, `exclude = ["tests"]`, etc.
- `.pre-commit-config.yaml`: add the `econchick/interrogate` repo with the chosen revision.

**TypeScript branch** — if Phase 5a found yellow/red entry points, offer either:

- **Local script hook (preferred)**: a one-liner `pre-commit` config that runs the docs build script with `--validation.notDocumented` and fails the commit if any new warnings appear. No extra dependencies beyond `typedoc` (already a dev dep).

  ```yaml
  # .pre-commit-config.yaml fragment
  - repo: local
    hooks:
      - id: tsdoc-coverage
        name: TSDoc coverage
        entry: bunx typedoc --plugin typedoc-plugin-markdown --validation.notDocumented --treatValidationWarningsAsErrors true --emit none
        language: system
        types: [ts]
        pass_filenames: false
  ```

- **`tsdoc-coverage` package** (if the user prefers a dedicated tool): npm install `tsdoc-coverage` as a dev dep and wire it as the hook entry instead. Threshold defaults to 80% to match the Python side.

In both stacks: show the user the exact config diff before writing. The pre-commit hook lives in the **source repo**, not the docs repo — extra caution since it's a different project.

### Phase 13 — Summary

6–10 line markdown summary covering: detected stacks, what got wired up per stack, logo update, mode (motion/credit/version), files updated, generated counts (if Phase 11 ran), next steps.

## Idempotency

- Don't duplicate sidebar entries — check before adding.
- Don't append to `modules`/`entryPoints` arrays — replace cleanly.
- Don't add a second `abstractData(...)` call — update the existing one.
- Don't overwrite content under `src/content/docs/` (only `api/` pages, regenerated by the script).
- Don't add a second logo line — replace.

## Out of scope (this round)

- TanStack route detection auto-config (recipe-only)
- Next.js route map auto-config (recipe-only)
- Prisma schema-doc auto-config (recipe-only)
- Drizzle schema-doc auto-config (recipe-only — no mature tooling)
- README/CHANGELOG/ADR auto-import into the sidebar

## Files this skill reads / writes

**Reads (docs project):** `package.json`, `astro.config.mjs`, `src/assets/`.
**Reads (source project):** `pyproject.toml`, `setup.py`, source tree, `tsconfig.json`, `next.config.*`, dependency manifests, schema files, OpenAPI specs.

**Writes (docs project):** `scripts/python-autodoc.json`, `scripts/ts-autodoc.json`, `astro.config.mjs` (edits), `package.json` (scripts only).

**Writes (source project, with explicit pre-commit consent only):** `.pre-commit-config.yaml`, `pyproject.toml` (dev deps section), `requirements-dev.txt`, or `package.json` (TS dev deps for `tsdoc-coverage` if chosen).

## Notes for the agent

- Be conservative with edits. Show diffs in your reasoning before writing.
- Phase 12 modifies a different repo than the docs project — extra caution.
- For TypeScript: TypeDoc requires `typescript` AND `typedoc` AND `typedoc-plugin-markdown`. If any are missing, the orchestrator will tell the user via the script output. Don't try to install them yourself unless the user explicitly asks.
- For OpenAPI: prefer `@astrojs/starlight-openapi` (mature plugin) over building from scratch.
- Keep conversation tight: detection in 1–3 sentences, audit table 5–8 lines, questions one round at a time, summary 6–10 lines.
