#!/usr/bin/env node
/**
 * compile-skill.mjs
 *
 * Sources of truth (hand-authored):
 *   - .claude/skills/abstract-data-setup/SKILL.md
 *   - .claude/skills/abstract-data-docs-author/SKILL.md
 *
 * For each, compiles to:
 *   - .cursor/rules/<skill>.mdc                                    (procedural)
 *   - packages/template/.cursor/rules/<skill>.mdc                  (bundled in create-docs)
 *   - packages/starlight-theme/skills/cursor/<skill>.mdc           (bundled in npm pkg)
 *   - packages/template/.claude/skills/<skill>/SKILL.md            (bundled in create-docs)
 *   - packages/starlight-theme/skills/claude/<skill>/SKILL.md      (bundled in npm pkg)
 *
 * Plus a single combined GitHub Copilot instructions file (Copilot only
 * reads one global file) at:
 *   - .github/copilot-instructions.md
 *   - packages/template/.github/copilot-instructions.md
 *   - packages/starlight-theme/skills/github/copilot-instructions.md
 *
 * Plus static-copy mirrors (handshake files, autodoc scripts) — see
 * STATIC_MIRRORS array below.
 *
 * Run:
 *   bun run sync-skills        # workspace root
 *   node scripts/compile-skill.mjs
 *
 * Edit only the SKILL.md sources. Re-run this script to sync everything.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', cyan: '\x1b[36m', gold: '\x1b[33m',
  green: '\x1b[32m', red: '\x1b[31m',
};

// ──────────────────────────────────────────────────────────────────────
// Skill sources
// ──────────────────────────────────────────────────────────────────────
const SKILLS = {
  setup: {
    name: 'abstract-data-setup',
    label: 'Setup',
    sourcePath: join(REPO_ROOT, '.claude/skills/abstract-data-setup/SKILL.md'),
  },
  docsAuthor: {
    name: 'abstract-data-docs-author',
    label: 'Docs Author',
    sourcePath: join(
      REPO_ROOT,
      '.claude/skills/abstract-data-docs-author/SKILL.md',
    ),
  },
};

function readSkill(skill) {
  if (!existsSync(skill.sourcePath)) {
    console.error(`${c.red}✗${c.reset} Source missing: ${skill.sourcePath}`);
    process.exit(1);
  }
  const source = readFileSync(skill.sourcePath, 'utf8');
  const fmMatch = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) {
    console.error(
      `${c.red}✗${c.reset} ${skill.sourcePath} missing YAML frontmatter`,
    );
    process.exit(1);
  }
  const [, fmText, body] = fmMatch;
  const fm = {};
  for (const line of fmText.split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    if (key) fm[key] = value;
  }
  if (!fm.description) {
    console.error(
      `${c.red}✗${c.reset} ${skill.sourcePath} frontmatter missing 'description'`,
    );
    process.exit(1);
  }
  return { source, fm, body };
}

// Genericize Claude Code-specific terminology so the workflow reads
// naturally in tools that don't have AskUserQuestion (Cursor, Copilot, etc.)
function genericize(body) {
  return body
    .replace(/Use `AskUserQuestion`(\s+for every choice)?/g,
      'Ask the user via your interactive prompt mechanism$1')
    .replace(/AskUserQuestion(:?)/g, 'an interactive prompt$1')
    .replace(/the `AskUserQuestion` tool/g, 'your interactive prompt mechanism')
    .replace(/Use `AskUserQuestion`/g, 'Ask the user');
}

// ──────────────────────────────────────────────────────────────────────
// Per-skill targets (Claude mirror + Cursor MDC)
// ──────────────────────────────────────────────────────────────────────
function perSkillTargets(skill) {
  const base = skill.name; // e.g. 'abstract-data-setup'
  return [
    {
      label: `Claude (${skill.label}, template)`,
      dest: join(
        REPO_ROOT,
        `packages/template/.claude/skills/${base}/SKILL.md`,
      ),
      format: 'mirror',
    },
    {
      label: `Claude (${skill.label}, theme pkg)`,
      dest: join(
        REPO_ROOT,
        `packages/starlight-theme/skills/claude/${base}/SKILL.md`,
      ),
      format: 'mirror',
    },
    {
      label: `Cursor (${skill.label}, monorepo)`,
      dest: join(REPO_ROOT, `.cursor/rules/${base}.mdc`),
      format: 'cursor',
    },
    {
      label: `Cursor (${skill.label}, template)`,
      dest: join(REPO_ROOT, `packages/template/.cursor/rules/${base}.mdc`),
      format: 'cursor',
    },
    {
      label: `Cursor (${skill.label}, theme pkg)`,
      dest: join(
        REPO_ROOT,
        `packages/starlight-theme/skills/cursor/${base}.mdc`,
      ),
      format: 'cursor',
    },
  ];
}

// Combined Copilot output destinations — single file containing BOTH skills
const COPILOT_TARGETS = [
  { label: 'Copilot (combined, monorepo)', dest: join(REPO_ROOT, '.github/copilot-instructions.md') },
  { label: 'Copilot (combined, template)', dest: join(REPO_ROOT, 'packages/template/.github/copilot-instructions.md') },
  { label: 'Copilot (combined, theme pkg)', dest: join(REPO_ROOT, 'packages/starlight-theme/skills/github/copilot-instructions.md') },
];

// ──────────────────────────────────────────────────────────────────────
// Format compilers
// ──────────────────────────────────────────────────────────────────────
function compileCursor(skill, fm, body) {
  return [
    '---',
    `description: "${fm.description.replace(/"/g, '\\"')}"`,
    'alwaysApply: false',
    '---',
    '',
    '<!--',
    `  Auto-generated from .claude/skills/${skill.name}/SKILL.md.`,
    '  Edit the source SKILL.md and run `bun run sync-skills` to regenerate.',
    '  Do not hand-edit this file — changes will be overwritten.',
    '-->',
    '',
    body.trim(),
    '',
  ].join('\n');
}

function compileCombinedCopilot(skills) {
  const sections = [
    '# Abstract Data Documentation Theme — Reference',
    '',
    '<!--',
    '  Auto-generated from the SKILL.md sources under .claude/skills/.',
    '  Edit those and run `bun run sync-skills` to regenerate.',
    '  Do not hand-edit this file — changes will be overwritten.',
    '-->',
    '',
    '> **Note:** GitHub Copilot applies these instructions globally to every Chat',
    '> interaction in this repo. The workflows below are procedural — Copilot can',
    '> guide the user through them but cannot natively run interactive prompts.',
    '> Use Claude Code or Cursor for fully automated execution.',
    '',
    '## Available workflows',
    '',
    '- **abstract-data-setup** — detection + configuration + generator wiring',
    '- **abstract-data-docs-author** — read source code, write narrative docs',
    '',
    'When a user request matches one of these, follow the relevant workflow below.',
    '',
    '---',
    '',
  ];

  for (const skill of skills) {
    sections.push(`## ${skill.label} workflow (\`${skill.name}\`)`);
    sections.push('');
    sections.push(`### When this applies`);
    sections.push('');
    sections.push(skill.fm.description);
    sections.push('');
    sections.push('### Procedure');
    sections.push('');
    sections.push(genericize(skill.body).trim());
    sections.push('');
    sections.push('---');
    sections.push('');
  }
  return sections.join('\n');
}

// ──────────────────────────────────────────────────────────────────────
// Static-copy mirrors (hand-authored handshake files + autodoc scripts)
// ──────────────────────────────────────────────────────────────────────
const STATIC_MIRRORS = [
  {
    label: 'CLAUDE.md (theme pkg)',
    src: join(REPO_ROOT, 'packages/template/CLAUDE.md'),
    dest: join(REPO_ROOT, 'packages/starlight-theme/skills/claude/CLAUDE.md'),
  },
  {
    label: 'welcome.mdc (theme pkg)',
    src: join(REPO_ROOT, 'packages/template/.cursor/rules/welcome.mdc'),
    dest: join(REPO_ROOT, 'packages/starlight-theme/skills/cursor/welcome.mdc'),
  },
  {
    label: 'build-python-docs.mjs (template)',
    src: join(REPO_ROOT, 'apps/playground/scripts/build-python-docs.mjs'),
    dest: join(REPO_ROOT, 'packages/template/scripts/build-python-docs.mjs'),
  },
  {
    label: 'build-python-docs.mjs (theme pkg)',
    src: join(REPO_ROOT, 'apps/playground/scripts/build-python-docs.mjs'),
    dest: join(REPO_ROOT, 'packages/starlight-theme/scripts/build-python-docs.mjs'),
  },
  {
    label: 'python-autodoc.json (theme pkg)',
    src: join(REPO_ROOT, 'packages/template/scripts/python-autodoc.json'),
    dest: join(REPO_ROOT, 'packages/starlight-theme/scripts/python-autodoc.json'),
  },
  {
    label: 'build-ts-docs.mjs (template)',
    src: join(REPO_ROOT, 'apps/playground/scripts/build-ts-docs.mjs'),
    dest: join(REPO_ROOT, 'packages/template/scripts/build-ts-docs.mjs'),
  },
  {
    label: 'build-ts-docs.mjs (theme pkg)',
    src: join(REPO_ROOT, 'apps/playground/scripts/build-ts-docs.mjs'),
    dest: join(REPO_ROOT, 'packages/starlight-theme/scripts/build-ts-docs.mjs'),
  },
  {
    label: 'ts-autodoc.json (theme pkg)',
    src: join(REPO_ROOT, 'packages/template/scripts/ts-autodoc.json'),
    dest: join(REPO_ROOT, 'packages/starlight-theme/scripts/ts-autodoc.json'),
  },
];

// ──────────────────────────────────────────────────────────────────────
// Main
// ──────────────────────────────────────────────────────────────────────
console.log('');
let count = 0;

const skillData = {};
for (const [key, skill] of Object.entries(SKILLS)) {
  skillData[key] = { ...skill, ...readSkill(skill) };
}

// Per-skill (mirror + cursor)
for (const [key, skill] of Object.entries(skillData)) {
  for (const t of perSkillTargets(skill)) {
    mkdirSync(dirname(t.dest), { recursive: true });
    let output;
    if (t.format === 'mirror') {
      output = skill.source;
    } else if (t.format === 'cursor') {
      output = compileCursor(skill, skill.fm, genericize(skill.body));
    } else {
      console.error(`${c.red}✗${c.reset} unknown format: ${t.format}`);
      process.exit(1);
    }
    writeFileSync(t.dest, output);
    const rel = t.dest.replace(REPO_ROOT + '/', '');
    console.log(
      `${c.green}✓${c.reset} ${t.label.padEnd(38)} ${c.dim}→ ${rel}${c.reset}`,
    );
    count += 1;
  }
}

// Combined Copilot (both skills in one file)
const skillsForCopilot = Object.values(skillData);
const copilotOutput = compileCombinedCopilot(skillsForCopilot);
for (const t of COPILOT_TARGETS) {
  mkdirSync(dirname(t.dest), { recursive: true });
  writeFileSync(t.dest, copilotOutput);
  const rel = t.dest.replace(REPO_ROOT + '/', '');
  console.log(
    `${c.green}✓${c.reset} ${t.label.padEnd(38)} ${c.dim}→ ${rel}${c.reset}`,
  );
  count += 1;
}

// Static mirrors (handshake files, autodoc scripts)
for (const m of STATIC_MIRRORS) {
  if (!existsSync(m.src)) {
    console.log(
      `${c.dim}—${c.reset} ${m.label.padEnd(38)} ${c.dim}skipped (source missing: ${m.src})${c.reset}`,
    );
    continue;
  }
  mkdirSync(dirname(m.dest), { recursive: true });
  writeFileSync(m.dest, readFileSync(m.src, 'utf8'));
  const rel = m.dest.replace(REPO_ROOT + '/', '');
  console.log(
    `${c.green}✓${c.reset} ${m.label.padEnd(38)} ${c.dim}→ ${rel}${c.reset}`,
  );
  count += 1;
}

console.log('');
console.log(
  `${c.gold}Compiled${c.reset} ${count} files from ` +
    `${c.cyan}${Object.values(SKILLS).length} skill source(s)${c.reset}` +
    ` ${c.dim}(+ static mirrors)${c.reset}`,
);
console.log('');
