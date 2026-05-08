---
title: Quickstart
description: Five minutes from clean checkout to a deployed branded docs site.
---

This template gives you a Starlight documentation site pre-wired with the [Abstract Data Documentation Theme](https://github.com/Abstract-Data/abstract-data-doc-theme). This page is the hands-on walkthrough — copy it, replace the placeholders, ship it.

## Install

```bash
bun install
bun dev
```

That boots the dev server at `http://localhost:4321` with hot module reload. Edit any `.md`/`.mdx` file under `src/content/docs/` and the page updates instantly.

:::tip
If you don't have Bun yet: `curl -fsSL https://bun.sh/install | bash`. The theme is designed for Bun (faster installs, native TypeScript) but works on `npm` and `pnpm` too if your team prefers.
:::

## Configure

Open `astro.config.mjs` and replace the placeholders:

```js {3-5,12,18-19}
starlight({
  // ⬇️ project metadata
  title: 'Your Project Docs',
  description: 'One-sentence elevator pitch.',
  site: 'https://your-deployed-url.example.com',

  // ⬇️ uncomment for a logo
  // logo: { src: './src/assets/your-logo.png', replacesTitle: true },

  social: [
    {
      icon: 'github',
      href: 'https://github.com/your-org/your-repo',
      label: 'GitHub',
    },
  ],

  plugins: [
    abstractData({
      motion: 'calm',  // 'full' for HUD, 'calm' for client docs
      credit: 'auto',  // 'hide' for white-label
    }),
  ],
});
```

The three knobs that matter most:

- **`motion`** — `full` is the loud HUD look (marketing-y, animated hex grid, glitch on the version chip); `calm` strips animations while keeping palette and fonts. Default: `calm` for client work.
- **`credit`** — `auto` shows "Built by Abstract Data" in the footer; `hide` removes it for white-label projects.
- **`version`** *(optional)* — set to a string like `'v1.0.0'` to display a version chip in the header next to the social icons.

## Add your logo

Drop a PNG or SVG in `src/assets/` (e.g. `your-logo.png`), then in `astro.config.mjs`:

```js
logo: {
  src: './src/assets/your-logo.png',
  replacesTitle: true,  // hide the text title when logo is present
}
```

The theme's `<Hero>` component uses Astro's `<Image>` for optimized output (lazy loading, AVIF/WebP, srcset). Drop a `400×400` or larger source — Astro handles the rest.

## Write content

Pages live under `src/content/docs/`:

```
src/content/docs/
├── index.mdx           # the splash page (this file is its sibling)
├── quickstart.md       # this page
└── guides/             # subfolders become sidebar groups (with autogenerate)
    ├── deployment.md
    └── customization.md
```

Frontmatter sets the page title and description. Body is Markdown or MDX (Markdown + components):

```md
---
title: My Page
description: Short SEO description.
---

# Heading auto-rendered by Starlight

Markdown content with **bold**, *italic*, [links](/), and `inline code`.
```

The theme's branded components are importable in any `.mdx` file:

```mdx
import Glitch from '@abstractdata/starlight-theme/components/Glitch.astro';

# <Glitch text="404" /> Not Found
```

## Add API reference

The template ships two autodoc pipelines — pick the one(s) that match your source. The `abstract-data-setup` workflow can detect your stack and prune this section automatically; if you'd rather drive it manually, follow whichever subsection applies.

<!-- abstract-data-setup:python-autodoc -->

### Python source

```bash
bun run docs:python
```

Reads `scripts/python-autodoc.json`, generates Markdown pages under `src/content/docs/api/` from your module docstrings via `pydoc-markdown`. Edit the config to point `searchPath` at your Python source root and list the `modules` you want documented.

:::caution
You need `pydoc-markdown` installed in your local Python environment: `pipx install pydoc-markdown` or `pip install --user pydoc-markdown`.
:::

<!-- /abstract-data-setup:python-autodoc -->

<!-- abstract-data-setup:ts-autodoc -->

### TypeScript source

```bash
bun run docs:ts
```

Reads `scripts/ts-autodoc.json`, generates Markdown pages under `src/content/docs/api/ts/` from your TSDoc comments via TypeDoc + `typedoc-plugin-markdown`. Point `entryPoints` at the entry TS files and `tsconfig` at the matching tsconfig.

:::caution
Install once as dev deps: `bun add -d typedoc typedoc-plugin-markdown`.
:::

<!-- /abstract-data-setup:ts-autodoc -->

:::tip[Guided setup]
Open Claude Code or Cursor in this folder and say *"set up docs"* — the bundled `abstract-data-setup` workflow detects your stack(s), audits docstring coverage, asks which modules to document, writes the configs, and tailors this very page so only the relevant autodoc subsection remains.
:::

## Deploy

Three workflow files ship in `.github/workflows/`:

| File | Target | When to use |
|---|---|---|
| `deploy.yml` | GitHub Pages | Default. Just enable Pages → "GitHub Actions" in repo settings and push. |
| `deploy-vercel.yml` | Vercel | Opt-in. Add `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets; run once. |
| `deploy-cloudflare.yml` | Cloudflare Pages | Opt-in. Add `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`. |

For Vercel and Cloudflare, the simpler path is connecting the repo through their respective dashboards (no workflow file needed) — they auto-detect Astro and deploy on push. Use the workflow files only when you want CI to control deploys.

## What's next

- Iterate on `index.mdx` — the splash page is your shop window.
- Add per-section guides under `src/content/docs/guides/`.
- Run `bun run build && bun run preview` before deploying to catch errors with production assets.
- Open Claude Code or Cursor in this folder if you want a guided setup — the bundled `abstract-data-setup` workflow handles the boilerplate.
