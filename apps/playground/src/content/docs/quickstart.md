---
title: Quickstart
description: Install the Abstract Data Starlight theme and have a branded documentation site running in under five minutes.
---

Install the Abstract Data Starlight theme and have a branded documentation site running in under five minutes.

## Installation

Add the theme to your Astro project as a Starlight plugin. The package ships fully configured — drop it in `astro.config.mjs` and the brand surfaces apply automatically.

```bash
# add the theme
bun add @abstractdata/starlight-theme
```

Then register the plugin in your Starlight config:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import abstractData from '@abstractdata/starlight-theme';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Acme Docs',
      plugins: [
        abstractData({
          motion: 'full', // 'full' | 'calm'
          credit: 'auto', // 'auto' | 'hide'
        }),
      ],
    }),
  ],
});
```

:::tip
HUD mode respects `prefers-reduced-motion` and disables animations automatically when the user's OS requests it. No extra config required.
:::

## Verify the install

Run the dev server and navigate to `localhost:4321`. You should see the HUD surface with your project's title in the top bar.

```bash
bun dev
```

:::caution
Set a custom `site` URL in `astro.config.mjs` before production builds, or your sitemap will point to `localhost`.
:::

:::danger
Don't commit your `.env` file. Use 1Password CLI or your secret manager.
:::

## What's next

- Configure your [brand colors](/theming/surfaces/) (or accept the Abstract Data defaults).
- Switch to [Calm mode](/theming/surfaces/) for client projects that want less visual energy.
- Wire up [GitHub Pages deployment](/installation/).
