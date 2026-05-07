# @abstractdata/create-docs

One-command scaffolder for new Abstract Data documentation sites.

## Usage

```bash
bun create @abstractdata/docs my-docs
```

(Or `npm create @abstractdata/docs@latest my-docs`, or `pnpm create @abstractdata/docs my-docs`.)

That creates a `./my-docs/` folder with a fresh Starlight project pre-wired to `@abstractdata/starlight-theme`. Then:

```bash
cd my-docs
bun install
bun dev
```

## What it does

1. Copies the `@abstractdata/docs-template` files into a folder you name.
2. Sets the project name in `package.json` and `astro.config.mjs`.
3. Replaces the workspace dependency on `@abstractdata/starlight-theme` with a real published version range.
4. Runs `git init` and makes an initial commit so you have a clean history from step zero.

After that, edit `astro.config.mjs` to replace the placeholder `site`, `social`, `sidebar`, and (optionally) `logo`, then start writing content under `src/content/docs/`.

## Options

For now, `bun create @abstractdata/docs <name>` is the only invocation. Configuration (motion mode, credit, version chip) is set inside the generated `astro.config.mjs` after scaffolding — easier to discover than CLI flags.

## Maintenance note

The `template/` folder ships a copy of `packages/template/` from the monorepo. The copy is created automatically by the `prepack` script before publish — do not hand-edit it. Edit `packages/template/` and the copy regenerates on the next publish.
