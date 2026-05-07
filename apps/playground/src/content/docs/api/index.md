---
title: API Reference
description: Auto-generated API documentation from Python module docstrings via pydoc-markdown.
---

The pages under this section are generated from a Python project's source code by `pydoc-markdown`. The recipe that produces them lives in [Recipes → Python autodoc](/recipes/python-autodoc/).

This index is hand-written — the pages below are auto-generated. Add a short note here for navigation and you're done.

## Modules

- [`example_module`](/api/example_module/) — a sample module showing how generated output renders in the brand.

## Regenerating

```bash
bun run docs:python
```

Walks the configured Python sources, runs `pydoc-markdown`, post-processes generated `.md` files with Starlight frontmatter. New module → new page. Removed module → orphaned page (delete manually or wipe `api/` and regenerate).
