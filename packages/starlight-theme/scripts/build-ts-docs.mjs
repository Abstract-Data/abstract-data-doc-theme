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

// Two-pass: first read + frontmatter every page in memory, then
// post-process for thin / package-landing enrichment.
const pages = []; // { file, title, description, body, frontmatter }
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
  pages.push({ file, title, description, body, frontmatter });
}

// ─── Thin-page post-processor (TypeScript) ────────────────────────────
// TypeDoc emits a tree: index/README + modules/, classes/, functions/, …
// We treat the index file (if any) as the package landing and any other
// near-empty page as "thin" — it gets a `:::note` banner explaining that
// the source TSDoc is sparse.
log(`${c.dim}→ post-processing thin pages${c.reset}`);

let bannered = 0;
let enriched = 0;

// Identify the index/README/landing page (lives at the root of outputDir)
const landingPage = pages.find((p) => {
  const rel = relative(outputDir, p.file);
  return /^(index|readme|globals|modules)\.md$/i.test(rel);
});

for (const page of pages) {
  const proseLines = page.body.split('\n').filter((l) => {
    const t = l.trim();
    if (!t) return false;
    if (/^#{1,6} /.test(t)) return false;
    if (t.startsWith('```')) return false;
    if (t.startsWith('|') || /^[-=]{3,}/.test(t)) return false;
    if (/^[-*+] /.test(t)) return false;
    if (/^<[^>]+>/.test(t)) return false;
    return true;
  }).length;
  const bodyChars = page.body.replace(/\s+/g, '').length;
  // "Thin" = barely any body content. Require *both* near-empty char count
  // and zero prose lines so we don't badge pages that have a one-line
  // TSDoc summary (which is sparse but not absent).
  const isThin = bodyChars < 150 && proseLines < 1;

  let newBody = page.body;
  let touched = false;

  if (page === landingPage) {
    // Build a Submodules section linking to siblings (skip self)
    const others = pages.filter((p) => p !== landingPage);
    if (others.length > 0) {
      const lines = ['', '## Submodules', ''];
      for (const sib of others) {
        const rel = relative(outputDir, sib.file).replace(/\.md$/, '');
        const summary = sib.description && !sib.description.startsWith('API reference for')
          ? ` — ${sib.description}`
          : '';
        lines.push(`- [\`${sib.title}\`](./${rel}.md)${summary}`);
      }
      lines.push('');
      const submodulesSection = lines.join('\n');
      if (isThin) {
        newBody = `\nTop-level entry — see modules below for the full API surface.\n${submodulesSection}`;
      } else {
        newBody = newBody.replace(/\s+$/, '') + '\n' + submodulesSection;
      }
      enriched += 1;
      touched = true;
      log(`${c.green}  ✓${c.reset} added Submodules section to ${relative(outputDir, page.file)} (${others.length} sibling${others.length === 1 ? '' : 's'})`);
    }
  } else if (isThin) {
    const banner = [
      '',
      ':::note[This page is sparse]',
      `The auto-generated reference for \`${page.title}\` is short. Expanding the leading \`/** ... */\` TSDoc comment in the source (purpose, when to use it, a tiny example) would populate this page with real context.`,
      ':::',
      '',
    ].join('\n');
    newBody = banner + newBody;
    bannered += 1;
    touched = true;
    log(`${c.gold}  ⚠${c.reset} thin-page banner on ${relative(outputDir, page.file)}`);
  }

  // Optional "View source" footer
  if (touched && cfg.repoUrl) {
    const branch = cfg.repoBranch ?? 'main';
    const repo = cfg.repoUrl.replace(/\/$/, '');
    newBody = newBody.replace(/\s+$/, '') +
      `\n\n## See also\n\n- [View on GitHub](${repo}/tree/${branch})\n`;
  }

  writeFileSync(page.file, page.frontmatter + newBody);
}

log('');
log(`${c.green}✓${c.reset} Generated ${c.gold}${pages.length}${c.reset} TypeScript API page${pages.length === 1 ? '' : 's'} in ${c.cyan}${relative(PROJECT_ROOT, outputDir)}${c.reset}/`);
if (enriched || bannered) {
  log(`${c.dim}  ${enriched} landing page${enriched === 1 ? '' : 's'} enriched, ${bannered} thin page${bannered === 1 ? '' : 's'} flagged${c.reset}`);
}
log(`${c.dim}  Sidebar wiring (astro.config.mjs):${c.reset}`);
log(`${c.dim}    { label: 'TS API', autogenerate: { directory: 'api/ts' } }${c.reset}`);
log('');
