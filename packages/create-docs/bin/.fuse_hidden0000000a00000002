#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * @abstractdata/create-docs
 *
 * Scaffold a new branded Starlight documentation project from the
 * @abstractdata/docs template. Invoked as:
 *
 *   bun create @abstractdata/docs <project-name>
 *   npm create @abstractdata/docs@latest <project-name>
 *   pnpm create @abstractdata/docs <project-name>
 */
import { existsSync, mkdirSync, readdirSync, copyFileSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { stdin, stdout, exit, argv, cwd } from 'node:process';
import { createInterface } from 'node:readline/promises';

// ─── Theme version this CLI scaffolds against ─────────────────────────
// Auto-updated by `scripts/sync-theme-version.mjs` during the prepack
// step — DO NOT hand-edit. Reflects the version in
// `packages/starlight-theme/package.json` at publish time.
const THEME_VERSION = '^0.4.0';

// ─── Paths ────────────────────────────────────────────────────────────
const __dirname = dirname(fileURLToPath(import.meta.url));
const TEMPLATE_CANDIDATES = [
  resolve(__dirname, '..', 'template'),         // bundled (after prepack)
  resolve(__dirname, '..', '..', 'template'),   // workspace dev
];
const TEMPLATE_DIR = TEMPLATE_CANDIDATES.find(existsSync);

// ─── ANSI colors ──────────────────────────────────────────────────────
const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  cyan: '\x1b[36m', gold: '\x1b[33m', red: '\x1b[31m', green: '\x1b[32m',
};

const log = (...args) => console.log(...args);
const die = (msg) => { console.error(`${c.red}error${c.reset} ${msg}`); exit(1); };

// ─── Banner ───────────────────────────────────────────────────────────
log('');
log(`${c.cyan}${c.bold}┌─[ ABSTRACT DATA · DOCS ]─────────────────┐${c.reset}`);
log(`${c.cyan}│${c.reset} ${c.dim}Scaffolding a branded Starlight site${c.reset}      ${c.cyan}│${c.reset}`);
log(`${c.cyan}└──────────────────────────────────────────┘${c.reset}`);
log('');

if (!TEMPLATE_DIR) {
  die('Could not locate template directory. This usually means @abstractdata/create-docs was packaged incorrectly. Reinstall the package or file an issue.');
}

// ─── Resolve project name ─────────────────────────────────────────────
const args = argv.slice(2);
let projectName = args.find((a) => !a.startsWith('-'));

if (!projectName) {
  const rl = createInterface({ input: stdin, output: stdout });
  projectName = (await rl.question(`${c.cyan}?${c.reset} Project name (and folder): `)).trim();
  rl.close();
}

if (!projectName) die('Project name is required.');
if (!/^[a-z0-9][a-z0-9-_.]*$/i.test(projectName)) {
  die(`"${projectName}" is not a valid folder/package name. Use letters, numbers, hyphens, underscores, dots — start with a letter or digit.`);
}

const targetDir = resolve(cwd(), projectName);
if (existsSync(targetDir)) {
  const entries = readdirSync(targetDir);
  if (entries.length > 0) die(`Folder ${c.bold}${projectName}${c.reset} already exists and is not empty.`);
}

// ─── Copy template ────────────────────────────────────────────────────
log(`${c.dim}→ copying template into${c.reset} ${c.bold}${projectName}${c.reset}/`);

function copyRecursive(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const entry of readdirSync(src, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.astro' || entry.name === 'bun.lock') continue;
    const srcPath = join(src, entry.name);
    const dstPath = join(dst, entry.name);
    if (entry.isDirectory()) copyRecursive(srcPath, dstPath);
    else copyFileSync(srcPath, dstPath);
  }
}
copyRecursive(TEMPLATE_DIR, targetDir);

// ─── Patch package.json ───────────────────────────────────────────────
log(`${c.dim}→ wiring up${c.reset} package.json`);
const pkgPath = join(targetDir, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));

pkg.name = projectName;
pkg.version = '0.0.1';
pkg.private = true;
delete pkg.description; // user fills theirs

// Replace workspace:* with the published theme version range
if (pkg.dependencies?.['@abstractdata/starlight-theme']?.startsWith('workspace:')) {
  pkg.dependencies['@abstractdata/starlight-theme'] = THEME_VERSION;
}

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');

// ─── Write .gitignore ─────────────────────────────────────────────────
// npm strips `.gitignore` from published tarballs, so we ship the contents
// inline here. If the user (or template) committed one already after copy,
// don't overwrite — they may have customized it.
const gitignorePath = join(targetDir, '.gitignore');
if (!existsSync(gitignorePath)) {
  log(`${c.dim}→ writing${c.reset} .gitignore`);
  writeFileSync(
    gitignorePath,
    [
      '# build output',
      'dist/',
      '.astro/',
      '.output/',
      '',
      '# dependencies',
      'node_modules/',
      '',
      '# bun — bun.lock IS committed (text-based lockfile, needed for reproducible installs)',
      '.bun/',
      '',
      '# logs',
      '*.log',
      'npm-debug.log*',
      '',
      '# env',
      '.env',
      '.env.local',
      '',
      '# os',
      '.DS_Store',
      'Thumbs.db',
      '',
    ].join('\n'),
  );
}

// ─── Patch astro.config.mjs ───────────────────────────────────────────
const astroConfigPath = join(targetDir, 'astro.config.mjs');
if (existsSync(astroConfigPath)) {
  let cfg = readFileSync(astroConfigPath, 'utf8');
  // Replace the placeholder title
  cfg = cfg.replace(/title:\s*['"]Your Project Docs['"]/, `title: '${projectName}'`);
  writeFileSync(astroConfigPath, cfg);
}

// ─── git init ─────────────────────────────────────────────────────────
log(`${c.dim}→ initializing git${c.reset}`);
try {
  execSync('git init -q', { cwd: targetDir, stdio: 'ignore' });
  execSync('git add -A', { cwd: targetDir, stdio: 'ignore' });
  execSync('git -c user.name=create-docs -c user.email=cli@abstractdata.io commit -q -m "chore: initial scaffold from @abstractdata/create-docs"', {
    cwd: targetDir,
    stdio: 'ignore',
  });
} catch (err) {
  // Non-fatal — user can `git init` manually.
  const isNotFound =
    err?.code === 'ENOENT' ||
    /not found|no such file|command not found/i.test(err?.message ?? '');
  if (isNotFound) {
    log(`${c.dim}  (git not found in PATH — run ${c.reset}${c.bold}git init${c.reset}${c.dim} inside ${c.reset}${c.bold}${projectName}/${c.reset}${c.dim} to start version-tracking your project)${c.reset}`);
  } else {
    log(`${c.dim}  (git skipped: ${(err?.message ?? 'unknown error').split('\n')[0]} — run git init manually)${c.reset}`);
  }
}

// ─── Done ─────────────────────────────────────────────────────────────
log('');
log(`${c.green}✓${c.reset} ${c.bold}${projectName}${c.reset} scaffolded.`);
log('');
log(`${c.gold}Next steps:${c.reset}`);
log(`  ${c.dim}$${c.reset} cd ${projectName}`);
log(`  ${c.dim}$${c.reset} bun install`);
log(`  ${c.dim}$${c.reset} bun dev`);
log('');
log(`${c.cyan}Tip:${c.reset} ${c.dim}open your AI coding assistant in ${projectName}/ — it will${c.reset}`);
log(`     ${c.gold}offer to run the abstract-data-setup workflow automatically${c.reset}`);
log(`     ${c.dim}on the first message. No magic phrase needed; just open${c.reset}`);
log(`     ${c.dim}Claude Code, Cursor, or whatever you use, and the AI will${c.reset}`);
log(`     ${c.dim}greet you and ask.${c.reset}`);
log('');
log(`     ${c.dim}Installed for: Claude Code (CLAUDE.md + .claude/skills/),${c.reset}`);
log(`     ${c.dim}Cursor (.cursor/rules/), GitHub Copilot (.github/${c.reset}`);
log(`     ${c.dim}copilot-instructions.md). Delete what you don't use.${c.reset}`);
log('');
log(`${c.dim}Docs · https://github.com/Abstract-Data/abstract-data-doc-theme${c.reset}`);
log('');
