#!/usr/bin/env node
/**
 * compile-skill.mjs
 *
 * Source of truth → .claude/skills/abstract-data-setup/SKILL.md
 *
 * Compiles to:
 *   - .cursor/rules/abstract-data-setup.mdc            (full procedural rule)
 *   - .github/copilot-instructions.md                  (static reference)
 *   - packages/template/.cursor/rules/...              (bundled into create-docs)
 *   - packages/template/.github/...                    (bundled into create-docs)
 *
 * Run:
 *   bun run sync-skills        # workspace root
 *   node scripts/compile-skill.mjs
 *
 * The Write tool can't touch .claude/ paths but Node's fs API can — that's
 * why the source of truth ships as Claude Code's SKILL.md and the other
 * formats are generated. Edit only the source. Re-run this script to sync.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const SOURCE = join(REPO_ROOT, '.claude/skills/abstract-data-setup/SKILL.md');

const TARGETS = [
  {
    label: 'Claude (template)',
    dest: join(
      REPO_ROOT,
      'packages/template/.claude/skills/abstract-data-setup/SKILL.md',
    ),
    format: 'mirror',
  },
  {
    label: 'Cursor (monorepo)',
    dest: join(REPO_ROOT, '.cursor/rules/abstract-data-setup.mdc'),
    format: 'cursor',
  },
  {
    label: 'Cursor (template)',
    dest: join(
      REPO_ROOT,
      'packages/template/.cursor/rules/abstract-data-setup.mdc',
    ),
    format: 'cursor',
  },
  {
    label: 'Copilot (monorepo)',
    dest: join(REPO_ROOT, '.github/copilot-instructions.md'),
    format: 'copilot',
  },
  {
    label: 'Copilot (template)',
    dest: join(
      REPO_ROOT,
      'packages/template/.github/copilot-instructions.md',
    ),
    format: 'copilot',
  },
];

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m', gold: '\x1b[33m',
  green: '\x1b[32m', red: '\x1b[31m',
};

if (!existsSync(SOURCE)) {
  console.error(`${c.red}✗${c.reset} Source SKILL.md not found at ${SOURCE}`);
  process.exit(1);
}

const source = readFileSync(SOURCE, 'utf8');

// Parse YAML frontmatter
const fmMatch = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
if (!fmMatch) {
  console.error(`${c.red}✗${c.reset} SKILL.md is missing YAML frontmatter`);
  process.exit(1);
}

const [, fmText, body] = fmMatch;
const fm = {};
for (const line of fmText.split('\n')) {
  // Description is often a long single-line value with colons/commas.
  // Match key on the first colon only.
  const idx = line.indexOf(':');
  if (idx === -1) continue;
  const key = line.slice(0, idx).trim();
  const value = line.slice(idx + 1).trim();
  if (key) fm[key] = value;
}

if (!fm.description) {
  console.error(`${c.red}✗${c.reset} SKILL.md frontmatter missing 'description'`);
  process.exit(1);
}

// Genericize Claude Code-specific terminology so the workflow reads naturally
// in tools that don't have AskUserQuestion (Cursor, Copilot, etc.)
function genericize(body) {
  return body
    .replace(/Use `AskUserQuestion`(\s+for every choice)?/g,
      'Ask the user via your interactive prompt mechanism$1')
    .replace(/AskUserQuestion(:?)/g, 'an interactive prompt$1')
    .replace(/the `AskUserQuestion` tool/g, 'your interactive prompt mechanism')
    .replace(/Use `AskUserQuestion`/g, 'Ask the user');
}

const genericBody = genericize(body);

// ────────────────────────────────────────────────────────────────────
// Cursor MDC — procedural, full fidelity
// ────────────────────────────────────────────────────────────────────
function compileCursor(fm, body) {
  return [
    '---',
    `description: "${fm.description.replace(/"/g, '\\"')}"`,
    'alwaysApply: false',
    '---',
    '',
    '<!--',
    '  Auto-generated from .claude/skills/abstract-data-setup/SKILL.md.',
    '  Edit the source SKILL.md and run `bun run sync-skills` to regenerate.',
    '  Do not hand-edit this file — changes will be overwritten.',
    '-->',
    '',
    body.trim(),
    '',
  ].join('\n');
}

// ────────────────────────────────────────────────────────────────────
// GitHub Copilot instructions — static reference, applied globally
// ────────────────────────────────────────────────────────────────────
function compileCopilot(fm, body) {
  return [
    '# Abstract Data — Documentation Setup Reference',
    '',
    '<!--',
    '  Auto-generated from .claude/skills/abstract-data-setup/SKILL.md.',
    '  Edit the source SKILL.md and run `bun run sync-skills` to regenerate.',
    '  Do not hand-edit this file — changes will be overwritten.',
    '-->',
    '',
    '> **Note:** GitHub Copilot applies these instructions globally to every Chat',
    '> interaction in this repo. The workflow below is procedural — Copilot can',
    '> guide the user through the phases but cannot natively run interactive',
    '> prompts. Use Claude Code or Cursor for fully automated execution.',
    '',
    '## When this applies',
    '',
    fm.description,
    '',
    '## Workflow',
    '',
    body.trim(),
    '',
  ].join('\n');
}

// Write all targets
console.log('');
let count = 0;
for (const t of TARGETS) {
  mkdirSync(dirname(t.dest), { recursive: true });
  let output;
  if (t.format === 'mirror') {
    // Verbatim copy of the source SKILL.md to the template — no transform.
    // The template-bundled Claude skill must be byte-identical to the source.
    output = source;
  } else if (t.format === 'cursor') {
    output = compileCursor(fm, genericBody);
  } else if (t.format === 'copilot') {
    output = compileCopilot(fm, genericBody);
  } else {
    console.error(`${c.red}✗${c.reset} unknown format: ${t.format}`);
    process.exit(1);
  }
  writeFileSync(t.dest, output);
  const rel = t.dest.replace(REPO_ROOT + '/', '');
  console.log(
    `${c.green}✓${c.reset} ${t.label.padEnd(22)} ${c.dim}→ ${rel}${c.reset}`,
  );
  count += 1;
}

console.log('');
console.log(
  `${c.gold}Compiled${c.reset} ${count} files from ` +
    `${c.cyan}.claude/skills/abstract-data-setup/SKILL.md${c.reset}`,
);
console.log('');
