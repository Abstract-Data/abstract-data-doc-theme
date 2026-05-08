#!/usr/bin/env node
/**
 * build-python-docs.mjs
 *
 * Orchestrates Python autodoc generation for this Starlight site.
 *
 * Reads `scripts/python-autodoc.json` for configuration:
 *   - searchPath: relative path to your Python source root (parent of the package directory)
 *   - modules:    list of fully-qualified module names to document
 *   - outputDir:  where the generated .md files land (relative to project root)
 *
 * For each module:
 *   1. Invokes `pydoc-markdown -I <searchPath> -m <module>` to capture markdown.
 *   2. Writes to `<outputDir>/<safe-name>.md`.
 *   3. Lifts the first H1 into Starlight `title:` frontmatter and synthesizes a
 *      `description:` from the first paragraph.
 *
 * Run via:
 *   bun run docs:python
 *
 * Requires Python ≥ 3.9 and pydoc-markdown:
 *   pipx install pydoc-markdown
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..');
const CONFIG_PATH = resolve(__dirname, 'python-autodoc.json');

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m', gold: '\x1b[33m',
  red: '\x1b[31m', green: '\x1b[32m',
};
const log = (...a) => console.log(...a);
const die = (msg) => { console.error(`${c.red}error${c.reset} ${msg}`); process.exit(1); };

// ─── Load config ──────────────────────────────────────────────────────
if (!existsSync(CONFIG_PATH)) die(`Missing config: ${CONFIG_PATH}`);
const cfg = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
if (!cfg.searchPath) die('python-autodoc.json: `searchPath` is required.');
if (!Array.isArray(cfg.modules) || cfg.modules.length === 0) {
  die('python-autodoc.json: `modules` must be a non-empty array.');
}

const searchPath = resolve(PROJECT_ROOT, cfg.searchPath);
const outputDir = resolve(PROJECT_ROOT, cfg.outputDir ?? 'src/content/docs/api');

if (!existsSync(searchPath)) {
  die(`searchPath does not exist: ${searchPath}\n  Resolved from cfg.searchPath = "${cfg.searchPath}"`);
}

// ─── Verify pydoc-markdown is available ───────────────────────────────
log(`${c.dim}→ checking pydoc-markdown${c.reset}`);
try {
  execSync('pydoc-markdown --version', { stdio: 'ignore' });
} catch {
  die(`pydoc-markdown not found on PATH. Install it:
    pipx install pydoc-markdown
    # or
    pip install --user pydoc-markdown
  Then re-run this script.`);
}

// ─── Generate per-module markdown ─────────────────────────────────────
mkdirSync(outputDir, { recursive: true });
log(`${c.dim}→ generating ${cfg.modules.length} module page${cfg.modules.length === 1 ? '' : 's'}${c.reset}`);

// Two-pass build: first generate every page in memory so the thin-page
// post-processor can cross-reference siblings (for "Submodules" sections
// on package landing pages), then write everything to disk.
const pages = []; // { mod, safeName, outPath, title, description, body, frontmatter }

for (const mod of cfg.modules) {
  const safeName = mod.replace(/\./g, '_');
  const outPath = join(outputDir, `${safeName}.md`);

  let markdown;
  try {
    markdown = execSync(
      `pydoc-markdown -I "${searchPath}" -m ${mod}`,
      { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
    );
  } catch {
    log(`${c.red}  ✗ ${mod}${c.reset}`);
    continue;
  }

  // ─── Frontmatter post-process ────────────────────────────────
  // Pull the first H1 (or fall back to module name).
  // pydoc-markdown escapes underscores inside headings (`foo\_bar`); since
  // the title goes into frontmatter as plain text (not rendered through
  // a markdown engine), unescape so the sidebar reads cleanly.
  const h1 = markdown.match(/^# (.+?)$/m);
  const title = (h1?.[1] ?? mod).trim().replace(/\\_/g, '_');
  // Strip the H1 from body so Starlight doesn't render it twice.
  let body = h1 ? markdown.replace(h1[0] + '\n', '') : markdown;
  // Strip pydoc-markdown's cross-ref anchors — they bloat output and
  // contaminate the description extractor.
  body = body.replace(/<a id="[^"]*"><\/a>\n?/g, '');
  // Translate Sphinx/reST cross-ref roles (`:mod:`, `:class:`, etc.) into
  // plain inline code. Without the crossref processor, pydoc-markdown
  // leaves them as literal text — strip the role marker so the reader
  // just sees the symbol name.
  body = body.replace(
    /:(?:mod|class|func|obj|attr|meth|exc|any|data|const)(?::)?\s*`([^`]+)`/g,
    '`$1`',
  );
  // First real prose line: skip headings, code fences, tables, lists,
  // empty lines, and any residual HTML tags.
  const desc = body.split('\n').find((l) => {
    const t = l.trim();
    if (!t) return false;
    if (/^#{1,6} /.test(t)) return false;        // heading
    if (t.startsWith('```')) return false;       // fence
    if (t.startsWith('|')) return false;         // table
    if (/^[-*+] /.test(t)) return false;         // list item
    if (/^<[^>]+>/.test(t)) return false;        // pure-HTML line
    return true;
  });
  const description = (desc ?? `API reference for \`${mod}\`.`)
    .trim()
    .replace(/`/g, '')
    .replace(/"/g, "'")
    .slice(0, 160);

  const frontmatter = [
    '---',
    `title: ${title}`,
    `description: "${description}"`,
    '---',
    '',
  ].join('\n');

  pages.push({ mod, safeName, outPath, title, description, body, frontmatter });
  log(`${c.green}  ✓${c.reset} ${mod} ${c.dim}→ ${relative(PROJECT_ROOT, outPath)}${c.reset}`);
}

if (pages.length === 0) {
  die('No pages generated. Check the modules list and searchPath in python-autodoc.json.');
}

// ─── Thin-page post-processor ─────────────────────────────────────────
// Two enrichments:
//   1. Package landings (modules with documented children, e.g. `auditkit`
//      when `auditkit.config` is also documented) get an auto-generated
//      "## Submodules" section listing each child with its description.
//   2. Thin pages (no module-level docstring → almost-empty body) get a
//      `:::note` banner explaining the gap so the reader isn't surprised
//      by a near-blank page.
// If `cfg.repoUrl` is set, every enriched page also gets a "View source"
// footer link.
log('');
log(`${c.dim}→ post-processing thin pages${c.reset}`);

const documentedSet = new Set(pages.map((p) => p.mod));
const childrenOf = (mod) => pages.filter((p) => p.mod !== mod && p.mod.startsWith(mod + '.'));

let enriched = 0;
let bannered = 0;

for (const page of pages) {
  // Count prose-y lines (excludes headings, fences, lists, tables, raw HTML)
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
  // docstring (which is sparse but not absent).
  const isThin = bodyChars < 150 && proseLines < 1;

  const kids = childrenOf(page.mod);
  const isPackageLanding = kids.length > 0;

  let newBody = page.body;
  let touched = false;

  if (isThin && !isPackageLanding) {
    // Inject sparse-page banner above body. Worded carefully — we know
    // the page is short, but we don't *know* whether the source has a
    // docstring (pydoc-markdown sometimes drops them) so phrase as a
    // suggestion rather than an assertion.
    const banner = [
      '',
      ':::note[This page is sparse]',
      `The auto-generated reference for \`${page.mod}\` is short. Expanding the source docstring at the top of \`${page.mod.replace(/\./g, '/')}.py\` (a sentence about purpose, when to use it, and a tiny example) would populate this page with real context.`,
      ':::',
      '',
    ].join('\n');
    newBody = banner + newBody;
    bannered += 1;
    touched = true;
    log(`${c.gold}  ⚠${c.reset} thin-page banner on ${page.mod}`);
  }

  if (isPackageLanding) {
    // Build a Submodules section linking to siblings via .md refs
    // (Astro/Starlight rewrites these to slug URLs at build time).
    const lines = ['', '## Submodules', ''];
    for (const kid of kids) {
      const summary = kid.description && !kid.description.startsWith('API reference for')
        ? ` — ${kid.description}`
        : '';
      lines.push(`- [\`${kid.mod}\`](./${kid.safeName}.md)${summary}`);
    }
    lines.push('');
    const submodulesSection = lines.join('\n');

    if (isThin) {
      // Replace stub body with brief intro + submodules
      newBody = `\nTop-level package — see submodules below for the documented API surface.\n${submodulesSection}`;
    } else {
      // Append to existing body
      newBody = newBody.replace(/\s+$/, '') + '\n' + submodulesSection;
    }
    enriched += 1;
    touched = true;
    log(`${c.green}  ✓${c.reset} added Submodules section to ${page.mod} (${kids.length} child${kids.length === 1 ? '' : 'ren'})`);
  }

  // Optional "View source" footer if repoUrl is configured
  if (touched && cfg.repoUrl) {
    const branch = cfg.repoBranch ?? 'main';
    const repo = cfg.repoUrl.replace(/\/$/, '');
    const sourcePath = page.mod.replace(/\./g, '/');
    // Best-effort: link to the package __init__.py for landing pages,
    // module .py for leaf modules. Either way the reader gets close.
    const target = isPackageLanding
      ? `${sourcePath}/__init__.py`
      : `${sourcePath}.py`;
    newBody = newBody.replace(/\s+$/, '') +
      `\n\n## See also\n\n- [View source on GitHub](${repo}/blob/${branch}/${target})\n`;
  }

  writeFileSync(page.outPath, page.frontmatter + newBody);
}

log('');
log(`${c.green}✓${c.reset} Generated ${c.gold}${pages.length}${c.reset} page${pages.length === 1 ? '' : 's'} in ${c.cyan}${relative(PROJECT_ROOT, outputDir)}${c.reset}/`);
if (enriched || bannered) {
  log(`${c.dim}  ${enriched} package landing${enriched === 1 ? '' : 's'} enriched, ${bannered} thin page${bannered === 1 ? '' : 's'} flagged${c.reset}`);
}
log(`${c.dim}  Sidebar wiring (astro.config.mjs):${c.reset}`);
log(`${c.dim}    { label: 'API Reference', autogenerate: { directory: 'api' } }${c.reset}`);
log('');
