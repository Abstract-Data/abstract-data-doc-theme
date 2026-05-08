#!/usr/bin/env node
/**
 * sync-theme-version.mjs
 *
 * Reads `packages/starlight-theme/package.json` and updates the
 * `THEME_VERSION` constant inside `packages/create-docs/bin/cli.js` to
 * match. Run by the create-docs `prepack` script so every published
 * version of `@abstractdata/create-docs` scaffolds projects pinned to
 * the latest theme version.
 *
 * Removes the manual-bump-in-two-places footgun.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const THEME_PKG = resolve(
  REPO_ROOT,
  'packages/starlight-theme/package.json',
);
const CLI_FILE = resolve(REPO_ROOT, 'packages/create-docs/bin/cli.js');

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m', gold: '\x1b[33m',
  green: '\x1b[32m', red: '\x1b[31m',
};

const die = (msg) => {
  console.error(`${c.red}✗${c.reset} ${msg}`);
  process.exit(1);
};

const themeVersion = (() => {
  try {
    return JSON.parse(readFileSync(THEME_PKG, 'utf8')).version;
  } catch (err) {
    die(`Failed to read theme package.json at ${THEME_PKG}: ${err.message}`);
  }
})();

if (!themeVersion || !/^\d+\.\d+\.\d+/.test(themeVersion)) {
  die(`Theme version "${themeVersion}" doesn't look like semver.`);
}

let cli;
try {
  cli = readFileSync(CLI_FILE, 'utf8');
} catch (err) {
  die(`Failed to read CLI at ${CLI_FILE}: ${err.message}`);
}

const beforeMatch = cli.match(/^const THEME_VERSION = '(\^?[\d.]+)';/m);
if (!beforeMatch) {
  die(`Could not find THEME_VERSION declaration in ${CLI_FILE}.`);
}

const wantedRange = `^${themeVersion}`;
if (beforeMatch[1] === wantedRange) {
  console.log(
    `${c.green}✓${c.reset} ${c.dim}THEME_VERSION already at${c.reset} ${c.gold}${wantedRange}${c.reset} ${c.dim}— no change${c.reset}`,
  );
  process.exit(0);
}

const updated = cli.replace(
  /^const THEME_VERSION = '(\^?[\d.]+)';/m,
  `const THEME_VERSION = '${wantedRange}';`,
);

writeFileSync(CLI_FILE, updated);

console.log(
  `${c.green}✓${c.reset} ${c.dim}Synced${c.reset} ${c.cyan}THEME_VERSION${c.reset}: ${beforeMatch[1]} ${c.dim}→${c.reset} ${c.gold}${wantedRange}${c.reset}`,
);
