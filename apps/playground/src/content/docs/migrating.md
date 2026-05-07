---
title: Migrating to this theme
description: Drop the Abstract Data theme into an existing Astro Starlight project without losing your content, sidebar, or deploy setup.
---

You already have a Starlight site. You like Starlight. You just want it to look like Abstract Data. Here's the thirty-minute version.

## What you keep

The theme is additive. Your existing setup stays intact:

- All your `src/content/docs/` content — Markdown, MDX, frontmatter, every page.
- Your `astro.config.mjs` `starlight()` configuration — `title`, `description`, `social`, `sidebar`, `editLink`, `lastUpdated`, etc.
- Your deployment target — GitHub Pages, Vercel, Cloudflare Pages, Netlify, anywhere.
- Your routing, redirects, and any Astro middleware.

## What changes

- The visual surface (palette, typography, animations).
- A small, opt-out set of component slots: `SocialIcons` (gets a version chip slot), `Footer` (gets a "Built by Abstract Data" credit you can hide).
- Code-block syntax colors (if you opt into the branded Shiki themes).

## Steps

### 1. Install

```bash
bun add @abstractdata/starlight-theme
```

(Or `npm install`, `pnpm add` — pick your flavor.)

### 1a. (Optional but recommended) Mirror the abstract-data-setup workflow into your AI assistant

```bash
bunx abstract-data-install-skills
```

This bin command ships with the theme. It detects which AI tool markers you already have (`.claude/`, `.cursor/`, `.github/`) and asks before overwriting. Installs the `abstract-data-setup` workflow into:

- `.claude/skills/abstract-data-setup/SKILL.md` (Claude Code)
- `.cursor/rules/abstract-data-setup.mdc` (Cursor)
- `.github/copilot-instructions.md` (GitHub Copilot — static reference, since Copilot can't run interactive prompts natively)

After that, open your AI assistant in the project and say "set up docs" — the workflow walks through Python autodoc setup, docstring coverage audit, and config wiring.

Skip this step if you don't use AI assistants — the theme works without.

### 2. Register the plugin

In your `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';

export default defineConfig({
  integrations: [
    starlight({
      // ...your existing Starlight config stays here...
      plugins: [
        abstractData({
          motion: 'calm',  // recommended for existing client/team docs
          credit: 'hide',  // hide the AD credit unless you want it
        }),
      ],
    }),
  ],
});
```

That's the minimum. Run `bun dev` and the theme applies.

### 3. (Recommended) Use the branded code-block syntax

The plugin can apply branded Shiki themes by default, but in practice Starlight's expressive-code config locks before the plugin runs — so the most reliable way is to set them explicitly in your Starlight config:

```js
import { abstractDataThemes } from '@abstractdata/starlight-theme/shiki';

starlight({
  expressiveCode: { themes: [...abstractDataThemes] },
  // ...
  plugins: [
    abstractData({
      motion: 'calm',
      credit: 'hide',
      shiki: false, // we set themes explicitly above
    }),
  ],
});
```

### 4. (Optional) Add a version chip

```js
abstractData({
  motion: 'calm',
  credit: 'hide',
  version: 'v3.2.0', // shows in the header next to social icons
});
```

The chip glitch-pulses in HUD mode and stays static in Calm mode.

### 5. (Optional) Use branded MDX components

Inside any `.mdx` page:

```mdx
import Glitch from '@abstractdata/starlight-theme/components/Glitch.astro';

# <Glitch text="404" /> Not Found
```

## Conflicts to look out for

### You already override `Header` or `Footer` or `SocialIcons`

The Abstract Data plugin overrides `SocialIcons` (for the version chip) and `Footer` (for the credit). If you've set your own overrides, the plugin will lose. Either:

- Drop the plugin's overrides by importing the components directly into your own override files.
- Skip the version chip and credit features (just don't set `version`, set `credit: 'hide'`, and write your own footer).

### You have your own `expressiveCode` config

Your config wins over the plugin's default. Pass `shiki: false` to the plugin and either keep your existing themes or import `abstractDataThemes` and add them to your `themes` array.

### You have custom CSS that styles `h1`, `h2`, callouts, sidebar, or code blocks

The theme's CSS is loaded via Starlight's `customCss` array, which is appended to your config. If you have custom CSS that targets the same selectors, the cascade order will determine the winner. Usually our theme should "lose" gracefully because it uses CSS variables your custom rules can override — but check the visible result.

## Verifying

After install, walk these pages:

1. **Your home page** — palette flipped, fonts changed, bracket bar on H1.
2. **Any docs page** — sidebar active item in cyan, code blocks branded, callouts colored, gold inline code.
3. **Open the search modal** (`⌘K`) — should have the cyan focus ring on the input.
4. **Toggle dark/light** in the top bar — both modes should look brand-correct.

## Updating

```bash
bun update @abstractdata/starlight-theme
```

The theme follows semver. Patches and minor versions land transparently within your existing range. Major versions are opt-in — review the changelog before bumping.

## Reverting

If you want to roll back to vanilla Starlight, remove the plugin from your `astro.config.mjs` and uninstall:

```bash
bun remove @abstractdata/starlight-theme
```

Your content, sidebar, and config are untouched.
