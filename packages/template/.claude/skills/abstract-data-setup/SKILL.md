---
name: abstract-data-setup
description: Set up the Abstract Data Documentation Theme (built on Astro Starlight) for a Python project. Detect source code, audit docstring coverage, sniff docstring style (Google/NumPy/Sphinx), ask configuration questions (modules, motion, credit, version), wire up config files (scripts/python-autodoc.json, astro.config.mjs sidebar + plugin options, package.json scripts), and optionally install a docstring-coverage pre-commit hook in the source project. Use when the user says "set up docs", "configure docs", "wire up Python autodoc", "scan my project for docs", "set up Abstract Data docs", "add API reference", "audit docstrings", or similar phrases inside a docs project that uses @abstractdata/starlight-theme (the npm package name; product is the Abstract Data Documentation Theme).
---

# Abstract Data Documentation Theme — Setup

Bootstrap the Abstract Data Documentation Theme — the branded docs system Abstract Data uses across client projects, built on Astro Starlight and shipped as the npm package `@abstractdata/starlight-theme`. Round 1.5 covers Python projects with docstring-coverage and style awareness. Future rounds will add TypeScript, Next.js, TanStack, OpenAPI.

## When to invoke

Run this skill when:

- The user says "set up docs", "configure docs", "wire up Python autodoc", "scan my project for docs", "audit docstrings", or similar.
- The cwd has `@abstractdata/starlight-theme` in `dependencies` or `devDependencies` of `package.json`.

If the cwd doesn't have that dep, stop and tell the user this skill only runs in Abstract Data documentation projects (point them at `bun create @abstractdata/docs`).

## Workflow (11 phases)

Use `AskUserQuestion` for every choice — never assume.

### Phase 1 — Confirm context

Read `package.json`. Verify `@abstractdata/starlight-theme` is in deps; verify `astro.config.mjs` and `src/content/docs/` exist. Stop with a clear message if any check fails. Don't ask the user to confirm — just announce findings and move on.

### Phase 2 — Locate the source project

AskUserQuestion: where does the source project live?
- "This directory" — docs ARE the source (rare)
- "Parent directory (..)" — docs sit inside the source repo
- "Sibling directory" — separate repos at the same level
- "Custom path" — prompt for it

Validate the path exists. Reprompt on invalid.

### Phase 3 — Detect Python signals

Look for `pyproject.toml`, `setup.py`, `requirements.txt`, `src/<pkg>/__init__.py`, `<pkg>/__init__.py`. If none, exit: "I didn't find Python source at <path>. Round 1 only handles Python projects."

If found, identify:
- **Package root** (directory with top-level `__init__.py`)
- **Package name** (from `pyproject.toml [project] name`, or directory name)
- **Submodules** (one level deep, exclude dunders, cap at ~30)

### Phase 4 — Audit docstring coverage

For each candidate module, compute the percentage of public callables (functions, methods, classes) that have docstrings.

**Preferred tool: `interrogate`.** Check if it's available:

```bash
which interrogate
```

If yes, run:

```bash
interrogate -v <package_root> --omit-covered-files --output json 2>/dev/null | jq .
```

If `interrogate` is unavailable, fall back to a quick AST walk via `python3 -c`:

```bash
python3 -c "
import ast, sys, os
def cov(path):
    with open(path) as f:
        tree = ast.parse(f.read())
    items = [n for n in ast.walk(tree)
             if isinstance(n, (ast.FunctionDef, ast.AsyncFunctionDef, ast.ClassDef))
             and not n.name.startswith('_')]
    if not items: return None
    have = sum(1 for n in items if ast.get_docstring(n))
    return have, len(items)
# walk a directory ...
"
```

Compute per-module coverage. Categorize:
- **≥ 80%** — green, ready to document
- **50-79%** — yellow, usable but gaps
- **< 50%** — red, autodoc output will be sparse

Show the user a table-style report:

```
Module                              Coverage   Status
auditkit.config                     12/12 100% ✓ green
auditkit.bootstrap                  3/3   100% ✓ green
auditkit.modules.ssl                2/11  18%  ✗ red — consider adding docstrings first
```

Don't editorialize too much — just the data. Then move on.

### Phase 5 — Detect docstring style

Sample 10–20 docstrings across the source tree (e.g., grep for `"""` and read context). Count distinctive markers:

- **Google**: `^\s+Args:\s*$`, `^\s+Returns:\s*$`, `^\s+Raises:\s*$`, `^\s+Yields:\s*$`
- **NumPy**: `^\s+Parameters\s*\n\s+-+\s*$`, `^\s+Returns\s*\n\s+-+\s*$`
- **Sphinx/reST**: `:param \w+:`, `:returns:`, `:raises \w+:`, `:type \w+:`

Whichever style has the highest hit count wins. If the leader is < 60% of total markers, call it "mixed" and warn.

Report findings:

```
Docstring style: Google (32 markers, 0 NumPy, 4 Sphinx)
```

If mixed, mention that pydoc-markdown will produce inconsistent output until the style is unified, but don't force a decision — proceed with the most common style.

(Note: pydoc-markdown's CLI doesn't accept processor flags, so the orchestrator can't auto-apply the matching processor. Style detection is informational unless the user opts into a YAML pipeline.)

### Phase 6 — Recommend modules to document

Show coverage findings. AskUserQuestion (max 4 options, first recommended):
- "Top-level package only" (Recommended)
- "All green-coverage modules" (≥80%)
- "Specific submodules I'll pick" → follow up with `multiSelect: true`
- "Everything" (warn about red modules: empty pages)

Build the final modules array as fully-qualified names.

### Phase 7 — Gather brand configuration

Read existing `astro.config.mjs`. If `motion`, `credit`, `version` are already set and the user didn't ask to change them, skip this phase.

Otherwise, batch into one AskUserQuestion call:
1. Motion: full | calm (Recommended)
2. Credit: auto | hide
3. Version chip: show (then ask for string) | omit

### Phase 8 — Write configs

Show diffs in your reasoning before writing.

**a) `scripts/python-autodoc.json`** — resolve searchPath relative to the docs project root. If file exists, merge: keep outputDir, replace searchPath/modules.

```json
{
  "searchPath": "<relative path>",
  "modules": [...],
  "outputDir": "src/content/docs/api"
}
```

**b) `astro.config.mjs`** — two edits:
1. Ensure sidebar has `{ label: 'API Reference', autogenerate: { directory: 'api' } }`. Don't duplicate.
2. Update the `abstractData(...)` call's `motion`/`credit`/`version`. Preserve other options.

**c) `package.json`** — ensure `scripts["docs:python"]` is `"node scripts/build-python-docs.mjs"`.

**d) `scripts/build-python-docs.mjs`** — should already exist from the template. If missing, tell the user to scaffold a fresh project via `bun create @abstractdata/docs` and copy it over.

### Phase 9 — Optionally run

AskUserQuestion: generate API pages now?
- "Yes, run bun run docs:python" (Recommended)
- "No, I'll run it later"

If yes, invoke via Bash. Pass through any pydoc-markdown install instructions verbatim if missing.

### Phase 10 — Offer pre-commit hook in source project

Only run this phase if Phase 4 found at least one module below 80% coverage. Otherwise skip.

AskUserQuestion:

```
Want me to add a docstring-coverage pre-commit hook to your source project at <path>?
- "Yes, install interrogate hook" (Recommended)
- "Yes, but with a lower threshold (60%)" — for projects that need to ramp up
- "No, skip"
```

If yes:

1. Check for existing `.pre-commit-config.yaml` in the source project root.
2. If absent, create:

```yaml
repos:
  - repo: https://github.com/econchick/interrogate
    rev: 1.7.0
    hooks:
      - id: interrogate
        args: [--fail-under=80, -v, src/]
```

3. If present, append the interrogate hook to the `repos` array. Don't duplicate if already present.
4. Add `interrogate` to dev deps:
   - `pyproject.toml` — add to `[project.optional-dependencies] dev` if that table exists
   - `requirements-dev.txt` — append if it exists
   - Otherwise mention to the user that they need to install it manually
5. Tell the user to run `pre-commit install` in the source project root to activate the hook (don't run it yourself — that's the source repo, not the docs repo, and it modifies their git hooks).

### Phase 11 — Summary

Print a 6–10 line markdown summary:

```
## Set up complete

**Configured for**: <package> at <path>
**Modules**: <count> · <green/yellow/red breakdown>
**Docstring style**: <style> (<confidence>)
**Mode**: <motion> · <credit> · <version chip status>

**Files updated**:
- scripts/python-autodoc.json
- astro.config.mjs
- package.json
<if hook installed:>
- <source-path>/.pre-commit-config.yaml (added interrogate hook)
- <source-path>/pyproject.toml (added interrogate to dev deps)

<if Phase 9 ran:>
**Generated**: <count> API pages in src/content/docs/api/

**Next**:
1. `bun dev`
2. Visit /api/ to see the generated pages
3. Address any red-coverage modules in your source, then re-run `bun run docs:python`
<if hook installed:>
4. `cd <source-path> && pre-commit install` to activate the docstring hook
```

## Idempotency

- Don't duplicate sidebar entries — check before adding.
- Don't append to `modules` array — replace cleanly.
- Don't add a second `abstractData(...)` call — update the existing one.
- Don't add a second interrogate hook to `.pre-commit-config.yaml` — check first.
- Don't overwrite content under `src/content/docs/` (only `api/` pages, regenerated by the script).

## Out of scope (this round)

- TypeScript/TypeDoc autodoc
- Next.js / TanStack / OpenAPI / Prisma / Drizzle
- Architecture diagrams
- README/CHANGELOG/ADR import
- Forcing the docs build to fail on coverage drop (deliberate — coverage policy belongs to the source project's pre-commit hook, not the docs build)
- Auto-applying a pydoc-markdown processor pipeline based on detected style (CLI doesn't support it; would require switching to YAML config)

## Files this skill reads / writes

**Reads:** docs project's `package.json`, `astro.config.mjs`; source project's `pyproject.toml`, `setup.py`, source tree, existing `.pre-commit-config.yaml`.

**Writes (docs project):** `scripts/python-autodoc.json`, `astro.config.mjs` (edits), `package.json` (scripts only).

**Writes (source project, only with Phase 10 consent):** `.pre-commit-config.yaml`, `pyproject.toml` (dev deps section), `requirements-dev.txt`.

## Notes for the agent

- Be conservative with edits. Show diffs in your reasoning before writing.
- Use `Edit` for in-place updates. Use `Write` for `python-autodoc.json` (full replace).
- Phase 10 modifies a different repo than the docs project — extra caution. Show the user exact diffs before applying.
- If interrogate isn't installed in the source's Python env, the audit falls back to AST. Note in the summary that interrogate would give richer reports.
- Keep conversation tight: detection in 1–3 sentences, audit table 5–8 lines, questions one round at a time, summary 6–10 lines.
