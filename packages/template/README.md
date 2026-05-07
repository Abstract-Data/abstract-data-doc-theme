# Abstract Data Docs Template

Starter Starlight documentation site with the [`@abstractdata/starlight-theme`](https://github.com/Abstract-Data/abstract-data-doc-theme) already wired in.

## Use this template

**The fastest path** — use the `@abstractdata/create-docs` CLI:

```bash
bun create @abstractdata/docs my-docs
cd my-docs
bun install
bun dev
```

The CLI copies this template into a fresh folder, swaps `workspace:*` for a real published version of the theme, sets your project name in `package.json` and `astro.config.mjs`, and runs `git init` so you have a clean history from step zero.

**Alternative — clone manually:**

Click **"Use this template"** on the GitHub repo (or fork it) to create a new repo from this code, then:

```bash
git clone https://github.com/your-org/your-new-repo.git
cd your-new-repo
bun install
bun dev
```

> **If you copied this folder out of the monorepo manually**, change the `@abstractdata/starlight-theme` dependency in `package.json` from `"workspace:*"` to a real version like `"^0.3.0"` before running `bun install`.

## Customize

See [`src/content/docs/quickstart.md`](./src/content/docs/quickstart.md) — it walks through what to change in `astro.config.mjs`, where to drop your logo, and how to toggle motion / credit / version.

## Deploy to GitHub Pages

The workflow at `.github/workflows/deploy.yml` is preconfigured. To enable:

1. **Repo Settings → Pages → Source:** select **"GitHub Actions"**.
2. **Push to `main`.** The workflow builds with Bun and publishes to Pages.
3. **For project pages** (e.g. `username.github.io/your-repo`), uncomment the `base:` line in `astro.config.mjs` and set it to `/your-repo-name`.

## Other deploy targets

The output is plain static HTML — drop `dist/` on any host:

- **Vercel** — easiest: connect the repo at vercel.com → New Project. Vercel auto-detects Astro and deploys on every push. No workflow needed. If you want CI control, use `.github/workflows/deploy-vercel.yml` (delete the GitHub Pages workflow first).
- **Cloudflare Pages** — easiest: connect at dash.cloudflare.com/?to=/:account/pages → Create Project. Same flow as Vercel. If you want CI control, use `.github/workflows/deploy-cloudflare.yml`.
- **Netlify** — same auto-deploy pattern. Drop a `netlify.toml` if you need to override.

## Update the theme

```bash
bun update @abstractdata/starlight-theme
```

Bun pulls the latest minor/patch within your semver range. Major versions are opt-in.
