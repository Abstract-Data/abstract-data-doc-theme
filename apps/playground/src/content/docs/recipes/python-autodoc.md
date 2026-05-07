---
title: Python autodoc
description: Generate API reference pages from a Python project's docstrings using pydoc-markdown, rendered in this theme's brand.
---

If your project ships a Python package, you can generate API reference pages directly from your module docstrings — Google, NumPy, or Sphinx style — and have them rendered in the Abstract Data brand alongside your hand-written docs.

This page is the recipe. It uses [`pydoc-markdown`](https://niklasrosenstein.github.io/pydoc-markdown/) as the introspection tool because it has a stable Markdown renderer, configurable processors, and broad docstring-style support. No special Astro plugin required — just a build script that runs before `astro build`.

## What you'll have when you're done

- `bun run docs:python` regenerates API pages from your Python source.
- Generated `.md` files land under `src/content/docs/api/` with proper Starlight frontmatter.
- Each Python module becomes a doc page; classes, methods, and functions get headings inside it.
- Code signatures use the brand-tinted Shiki theme automatically.
- Sidebar autogenerates an "API Reference" group from the directory.

## Prerequisites

- **Python ≥ 3.9** with `pydoc-markdown` installed:

  ```bash
  pipx install pydoc-markdown
  # or
  pip install --user pydoc-markdown
  ```

- Your Python source under a known path (e.g. `python-package/src/your_module/`).
- Docstrings in Google, NumPy, or reStructuredText style. (Google is the cleanest for `pydoc-markdown`'s default formatter.)

## Step 1 — Drop in the recipe files

This playground ships two files under `scripts/`:

- `scripts/pydoc-markdown.yml` — the pydoc-markdown config. Heavily commented; adapt the `loaders[0].search_path` and `modules` entries to point at your Python source.
- `scripts/build-python-docs.mjs` — orchestrator. Runs pydoc-markdown, then post-processes generated files to add Starlight frontmatter (lifts the first H1 into `title:` so Starlight doesn't render it twice).

Copy both to your own docs project's `scripts/` folder.

## Step 2 — Wire the script into `package.json`

```json
{
  "scripts": {
    "docs:python": "node scripts/build-python-docs.mjs",
    "build": "bun run docs:python && astro check && astro build"
  }
}
```

The chained `build` script means CI gets fresh API pages on every deploy. For local dev, run `bun run docs:python` once when you want them refreshed. (Optionally add `docs:python:watch` with `nodemon` if you're iterating on docstrings.)

## Step 3 — Add the sidebar entry

In `astro.config.mjs`:

```js
sidebar: [
  // ...your existing groups...
  {
    label: 'API Reference',
    autogenerate: { directory: 'api' },
  },
],
```

`autogenerate` walks `src/content/docs/api/` and builds nested groups from the directory structure. Module name → page; package → folder.

## Step 4 — Run it

```bash
bun run docs:python
```

You should see:

```
→ checking pydoc-markdown
→ running pydoc-markdown
→ adding Starlight frontmatter

✓ Generated 12 API pages in src/content/docs/api/
```

Restart `bun dev` and the new pages appear under "API Reference" in the sidebar.

## What the output looks like

For a Python function like:

```py
def normalize(value: float, lo: float = 0.0, hi: float = 1.0) -> float:
    """Clamp ``value`` to the inclusive ``[lo, hi]`` range.

    Args:
        value: The number to clamp.
        lo: Lower bound.
        hi: Upper bound.

    Returns:
        The clamped value.

    Raises:
        ValueError: If ``lo > hi``.
    """
```

`pydoc-markdown` produces a Starlight-rendered page with:

- A heading: `normalize`
- A code-fenced Python signature block (cyan keywords, gold strings, light-cyan function names from our Shiki theme)
- The summary sentence as the lead
- An "Arguments" definition list
- A "Returns" line
- A "Raises" line

See [`/api/example_module/`](/api/example_module/) for a hand-written example of what one of these pages renders like in the brand.

## Customizing the output

The `pydoc-markdown.yml` is a pipeline of `loaders → processors → renderer`. Tweaks:

- **Filter what's included.** The `filter` processor's `expression` is a Python expression evaluated per member. Default: `not name.startswith('_')`. To include `__init__`, list it explicitly.
- **Different docstring style.** Add a `google` / `numpy` / `sphinx` processor before the smart processor:

  ```yaml
  processors:
    - type: filter
    - type: google      # or numpy / sphinx
    - type: smart
    - type: crossref
  ```

- **Cross-references between modules.** The `crossref` processor turns ``` `module.ClassName` ``` into clickable links inside generated pages. Already enabled in the recipe.

## Wiring it into CI

If you deploy via the included GitHub Pages workflow, add Python setup to `.github/workflows/deploy.yml`:

```yaml
- name: Setup Python
  uses: actions/setup-python@v5
  with:
    python-version: '3.12'

- name: Install pydoc-markdown
  run: pipx install pydoc-markdown
```

Place these steps before the `Install dependencies` (Bun) step. The build script will then run during `bun run build`.

For Vercel and Cloudflare Pages, the build environment doesn't have Python by default — you'll either need a custom build image or to run `docs:python` locally and commit the generated `.md` files. Most teams commit them; the diff is human-readable and reviewable.

## Common questions

**Can I document a Python project that lives in a separate repository?**

Yes — the `loaders[0].search_path` accepts any path. Either include the source as a git submodule, or use a `pre-build` step in CI that clones the source repo before running `pydoc-markdown`.

**Can I mix hand-written docs with generated ones in the same sidebar group?**

Yes. Replace `autogenerate` with explicit entries:

```js
{
  label: 'API Reference',
  items: [
    'api/overview',          // hand-written
    'api/example_module',    // generated
    'api/another_module',    // generated
  ],
}
```

**Does this work for TypeScript projects too?**

Different tool. For TS, look at [`typedoc`](https://typedoc.org/) with `typedoc-plugin-markdown` — same architectural pattern, different binary.

**What if my Python project doesn't have docstrings?**

`pydoc-markdown` will still emit signature pages, just without descriptions. Consider it motivation to write the docstrings — your future self will thank you.
