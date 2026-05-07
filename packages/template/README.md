# Abstract Data Docs Template

Starter Starlight documentation site with the [`@abstractdata/starlight-theme`](https://github.com/Abstract-Data/abstract-data-doc-theme) already wired in.

## Use this template

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

- **Vercel** — connect the repo, set build command to `bun run build`, output to `dist/`.
- **Cloudflare Pages** — same.
- **Netlify** — same.

## Update the theme

```bash
bun update @abstractdata/starlight-theme
```

Bun pulls the latest minor/patch within your semver range. Major versions are opt-in.
