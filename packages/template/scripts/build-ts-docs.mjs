#!/usr/bin/env node
/**
 * build-ts-docs.mjs
 *
 * Generates Starlight-compatible Markdown API reference from a
 * TypeScript project's source via TypeDoc + typedoc-plugin-markdown.
 *
 * Reads `scripts/ts-autodoc.json` for configuration:
 *   - entryPoints:   array of TS entry files (e.g. ["../../my-lib/src/index.ts"])
 *   - tsconfig:      path to the project's tsconfig.json
 *   - outputDir:     where the generated .md pages land (relative to project root)
 *   - githubPages:   pass through to TypeDoc
 *   - skipErrorChecking: pass through to TypeDoc (skip type-error abort)
 *
 * For each module, TypeDoc emits a markdown file. The orchestrator
 * post-processes each one to add Starlight `title:` frontmatter from the
 * first H1 (so Starlight doesn't render the title twice).
 *
 * Run:
 *   bun run docs:ts
 *
 * Requires:
 *   bun add -d typedoc typedoc-plugin-markdown
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(__dirname, 'ts-autodoc.json');

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m', gold: '\x1b[33m',
  red: '\x1b[31m', green: '\x1b[32m',
};
const log = (...a) => console.log(...a);
const die = (msg) => { console.error(`${c.red}error${c.reset} ${msg}`); process.exit(1); };

// ─── Load config ──────────────────────────────────────────────────────
if (!existsSync(CONFIG_PATH)) die(`Missing config: ${CONFIG_PATH}`);
const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
if (!Array.isArray(cfg.entryPoints) || cfg.entryPoints.length === 0) {
  die('ts-autodoc.json: `entryPoints` must be a non-empty array.');
}

const outputDir = resolve(PROJECT_ROOT, cfg.outputDir ?? 'src/content/docs/api/ts');
const tsconfig = cfg.tsconfig ? resolve(PROJECT_ROOT, cfg.tsconfig) : null;

// ─── Verify TypeDoc available ─────────────────────────────────────────
log(`${c.dim}→ checking typedoc${c.reset}`);
try {
  execSync('npx --no-install typedoc --version', {
    cwd: PROJECT_ROOT, stdio: 'ignore',
  });
} catch {
  die(`typedoc not found. Install it as a dev dep:
    bun add -d typedoc typedoc-plugin-markdown
  Then re-run this script.`);
}

// ─── Run TypeDoc ──────────────────────────────────────────────────────
mkdirSync(outputDir, { recursive: true });
log(`${c.dim}→ generating TypeScript API pages${c.reset}`);

const args = [
  '--plugin', 'typedoc-plugin-markdown',
  '--out', outputDir,
  '--readme', 'none',
  '--hideBreadcrumbs', 'true',
  '--hidePageHeader', 'true',
];
if (tsconfig) args.push('--tsconfig', tsconfig);
if (cfg.skipErrorChecking) args.push('--skipErrorChecking');
for (const entry of cfg.entryPoints) {
  args.push(resolve(PROJECT_ROOT, entry));
}

try {
  execSync(`npx typedoc ${args.map((a) => `"${a}"`).join(' ')}`, {
    cwd: PROJECT_ROOT, stdio: 'inherit',
  });
} catch {
  die('typedoc failed. Check entryPoints and tsconfig paths in ts-autodoc.json.');
}

// ─── Post-process: lift first H1 → frontmatter ────────────────────────
log(`${c.dim}→ adding Starlight frontmatter${c.reset}`);

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

let processed = 0;
for (const file of walk(outputDir)) {
  let content = readFileSync(file, 'utf8');
  if (content.startsWith('---\n')) continue; // already has frontmatter

  const h1 = content.match(/^# (.+?)$/m);
  const fallbackTitle = relative(outputDir, file).replace(/\.md$/, '').replace(/[\\/_]/g, ' ');
  const title = (h1?.[1] ?? fallbackTitle).trim().replace(/\\_/g, '_');

  // Strip H1 from body to avoid duplicate rendering by Starlight
  const body = h1 ? content.replace(h1[0] + '\n', '') : content;

  // Find first prose line for description
  const desc = body.split('\n').find((l) => {
    const t = l.trim();
    if (!t) return false;
    if (/^#{1,6} /.test(t)) return false;
    if (t.startsWith('```')) return false;
    if (t.startsWith('|')) return false;
    if (/^[-*+] /.test(t)) return false;
    if (/^<[^>]+>/.test(t)) return false;
    return true;
  });
  const description = (desc ?? `API reference for \`${title}\`.`)
    .trim().replace(/`/g, '').replace(/"/g, "'").slice(0, 160);

  const frontmatter = [
    '---', `title: ${title}`, `description: "${description}"`, '---', '',
  ].join('\n');
  writeFileSync(file, frontmatter + body);
  processed += 1;
}

log('');
log(`${c.green}✓${c.reset} Generated ${c.gold}${processed}${c.reset} TypeScript API page${processed === 1 ? '' : 's'} in ${c.cyan}${relative(PROJECT_ROOT, outputDir)}${c.reset}/`);
log(`${c.dim}  Sidebar wiring (astro.config.mjs):${c.reset}`);
log(`${c.dim}    { label: 'TS API', autogenerate: { directory: 'api/ts' } }${c.reset}`);
log('');
