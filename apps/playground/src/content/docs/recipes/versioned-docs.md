---
title: Versioned API reference
description: "Four patterns for showing v1.x and v2.x of the documented API side-by-side, with a decision tree for picking one."
---

Versioned documentation is one of two sharp edges in Starlight (the other is multi-product navigation). Starlight has no built-in versioning yet, so you choose the pattern that matches your shape. Abstract Data ships first-class support for the **source-driven** pattern below; the others are recipes you can adopt outside the theme.

## Decision tree

```
Are guides (concepts, how-tos) the same across versions?
├── Yes → only the API reference changes between versions
│         → Source-driven (Pattern 1) — recommended for the theme
│
└── No → guides differ by version too
          ├── Maintain per-version branches already?
          │     → Branch-per-version (Pattern 3)
          │
          └── Want everything archived together?
                → starlight-versions plugin (Pattern 2)
```

If the answer is "we don't really need versioning yet" — skip it. Easy to add later.

## Pattern 1 — Source-driven (built into the theme)

The autodoc orchestrator (`build-python-docs.mjs` / `build-ts-docs.mjs`) accepts a `versions` array. Each entry is a git tag in the source repo. The build:

1. Creates a `git worktree` checkout of the source at each tag.
2. Runs the generator (pydoc-markdown or TypeDoc) against each worktree, emitting into `<outputDir>/<safeTag>/`.
3. Aliases the default version's pages at the un-versioned URL so existing links keep working.
4. Stamps each page's frontmatter with `version:` + `versionLabel:`.
5. Prepends a `:::caution[Older version]` banner on non-default pages with a "Latest is X →" link.

**Configure** — `scripts/python-autodoc.json`:

```json
{
  "searchPath": "../../auditkit/src",
  "modules": ["auditkit", "auditkit.config", "auditkit.bootstrap"],
  "outputDir": "src/content/docs/api",
  "versions": [
    { "tag": "v0.4.0", "label": "0.4 (latest)", "default": true },
    { "tag": "v0.3.2", "label": "0.3" },
    { "tag": "v0.2.0", "label": "0.2 (legacy)" }
  ]
}
```

**Build** — `bun run docs:python` checks out each tag, regenerates, cleans up worktrees on exit.

**Add the version picker** — override `SocialIcons` in `astro.config.mjs`:

```js
starlight({
  components: { SocialIcons: './src/overrides/SocialIcons.astro' },
})
```

`src/overrides/SocialIcons.astro`:

```astro
---
import Default from '@astrojs/starlight/components/SocialIcons.astro';
import VersionPicker from '@abstractdata/starlight-theme/components/VersionPicker.astro';

const versions = [
  { tag: 'v0.4.0', label: '0.4 (latest)', default: true },
  { tag: 'v0.3.2', label: '0.3' },
  { tag: 'v0.2.0', label: '0.2 (legacy)' },
];
---
<VersionPicker {versions} apiBase="/api" />
<Default />
```

That's it. The picker appears in the topbar, dropdown lists every version, switching navigates to the equivalent page in the chosen version.

**Sidebar autogenerate handles the rest** — `{ label: 'API Reference', autogenerate: { directory: 'api' } }` already groups by subdirectory, so each version becomes an expandable group.

### Caveats

- The `versions` array in the autodoc config and the override component are duplicated until the theme adds a route-data middleware that auto-derives the list. Edit the JSON first; rerun the setup skill if needed.
- Pages on older versions can outlive their slugs. If a symbol moved (`auditkit.foo` → `auditkit.bar`), the version picker can't auto-resolve — it'll land at the version's index page.
- TypeScript versioning works the same way but TypeDoc's output structure is different (subdirectories per kind: `classes/`, `functions/`, `interfaces/`). The picker still works; just expect the per-version trees to vary in shape if exports moved between releases.

## Pattern 2 — `starlight-versions` plugin

Use when **the entire site** is versioned, not just the API reference. The plugin archives every page on demand and renders a version selector. It's opinionated and pre-1.0; expect rough edges.

```bash
bun add starlight-versions
```

```js
// astro.config.mjs
import starlightVersions from 'starlight-versions';

starlight({
  plugins: [
    abstractData({ /* ... */ }),
    starlightVersions({
      versions: [{ slug: '0.3' }, { slug: '0.2' }],
    }),
  ],
})
```

Run `bunx starlight-versions sync` to archive the current state. Content for older versions then lives at `src/content/docs/0.3/...`.

**Don't combine with Pattern 1.** Pick one.

## Pattern 3 — Branch-per-version

Maintain a git branch per major version, deploy each as its own site, configure your host (Vercel/Cloudflare/Netlify) to rewrite `/v2/*` to the v2 deploy. Knip uses this pattern; the trade-off is more deploy-config and more long-lived branches but cleaner mental model when guides differ heavily per version.

See [webpro.nl/scraps/versioned-docs-with-starlight-and-vercel](https://webpro.nl/scraps/versioned-docs-with-starlight-and-vercel) for the canonical write-up.

## Pattern 4 — Folder copy (Docusaurus-style)

Manually duplicate `src/content/docs/` into `src/content/docs/v1/` when you fork. Simple, but suffers when the framework theme bumps and the copies don't get migrated. Mostly here for completeness.

## Site version vs. API version

The version chip in the topbar (set via `abstractData({ version: 'v1.0.0' })`) is the **site's** marketing version. The `versions` array in autodoc configs is the **documented API's** versions. They're independent — a site might be at `v1.2.0` while documenting API `v0.4.0`. Don't conflate them.
