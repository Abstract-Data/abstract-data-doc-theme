---
title: Quickstart
description: How to use this documentation template.
---

This template gives you a branded Starlight documentation site with the Abstract Data theme already wired in. Here's how to make it yours.

## What to change

1. **Project metadata** in `astro.config.mjs`:
   - `site` — your production URL
   - `starlight.title` — your project name
   - `starlight.description` — your project description
   - `starlight.social` — your repo URL and any other social links
   - `starlight.sidebar` — the structure of your docs

2. **Logo** in `src/assets/`:
   - Drop your logo file (PNG or SVG) into `src/assets/`.
   - Uncomment the `logo:` line in `astro.config.mjs` and point it at the file.

3. **Theme behavior** in the plugin call:
   - `motion: 'calm'` (default for this template) for prose-heavy docs.
   - `motion: 'full'` to enable HUD animations.
   - `credit: 'hide'` to remove the "Built by Abstract Data" footer for white-label work.
   - `version: 'v1.0.0'` to show a version chip in the header.

4. **Content** under `src/content/docs/`:
   - Replace `index.mdx` with your landing page.
   - Replace this file with your real quickstart.
   - Add new `.md` or `.mdx` pages and link them in the sidebar.

## Run it

```bash
bun install
bun dev
```

Open <http://localhost:4321>.

## Build for production

```bash
bun run build
```

Output lands in `dist/`. Drop it on any static host. The included GitHub Actions workflow at `.github/workflows/deploy.yml` deploys to GitHub Pages automatically on push to `main` once you enable Pages in your repo settings.

## Branded components

The theme exports a few components you can import inside any `.mdx` page:

```mdx
import Glitch from '@abstractdata/starlight-theme/components/Glitch.astro';

# <Glitch text="404" /> Not Found
```

See the [theme docs](https://github.com/Abstract-Data/abstract-data-doc-theme) for the full list.
