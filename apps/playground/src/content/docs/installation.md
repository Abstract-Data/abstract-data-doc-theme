---
title: Installation
description: Install and configure @abstractdata/starlight-theme.
---

The full installation walkthrough — Bun, Astro, Starlight, and the Abstract Data plugin.

## Prerequisites

You need:

- [Bun](https://bun.sh) `1.1+` — `curl -fsSL https://bun.sh/install | bash`
- An existing Astro Starlight project, or a new one created from the official template.

## Create a new project

```bash
bun create astro@latest my-docs -- --template starlight
cd my-docs
bun add @abstractdata/starlight-theme
```

## Add to existing project

```bash
bun add @abstractdata/starlight-theme
```

Then register the plugin in `astro.config.mjs`:

```js
import abstractData from '@abstractdata/starlight-theme';

starlight({
  // ...your existing config
  plugins: [abstractData()],
});
```

## Verify

```bash
bun dev
```

Open `http://localhost:4321` — you should see the Abstract Data HUD surface.

:::note
If you don't see the brand fonts (Orbitron, Inter, JetBrains Mono), confirm you have network access — the theme loads fonts from Google Fonts at runtime. Self-hosted fonts arrive in Round 3b.
:::
