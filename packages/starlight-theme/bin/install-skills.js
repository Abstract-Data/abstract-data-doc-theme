#!/usr/bin/env node
/**
 * abstract-data-install-skills
 *
 * Installs the `abstract-data-setup` workflow into a project that uses
 * `@abstractdata/starlight-theme`, in the formats supported by the user's
 * AI coding assistants.
 *
 * Run from your docs project root after:
 *   bun add @abstractdata/starlight-theme
 *
 * Then:
 *   bunx abstract-data-install-skills
 *
 * Detects which tool markers (`.claude/`, `.cursor/`, `.github/`) are
 * already present and asks before overwriting any existing files. Safe to
 * re-run.
 */
import { existsSync, mkdirSync, readFileSync, copyFileSync } from 'node:fs';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stdin, stdout, exit, cwd as getCwd } from 'node:process';
import { createInterface } from 'node:readline/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGE_ROOT = resolve(__dirname, '..');
const SKILLS_SRC = resolve(PACKAGE_ROOT, 'skills');
const SCRIPTS_SRC = resolve(PACKAGE_ROOT, 'scripts');
const PROJECT_ROOT = getCwd();

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  cyan: '\x1b[36m', gold: '\x1b[33m', green: '\x1b[32m', red: '\x1b[31m',
};

const log = (...args) => console.log(...args);
const die = (msg) => {
  console.error(`${c.red}error${c.reset} ${msg}`);
  exit(1);
};

// ─── Banner ────────────────────────────────────────────────────────
log('');
log(`${c.cyan}${c.bold}┌─[ ABSTRACT DATA · INSTALL SKILLS ]───────┐${c.reset}`);
log(`${c.cyan}│${c.reset} ${c.dim}Mirroring the abstract-data-setup workflow${c.reset} ${c.cyan}│${c.reset}`);
log(`${c.cyan}└───────────────────────────────────────────┘${c.reset}`);
log('');

// ─── Sanity ────────────────────────────────────────────────────────
if (!existsSync(SKILLS_SRC)) {
  die(
    `skills/ directory not found inside the package at ${SKILLS_SRC}.\n` +
      `       Reinstall @abstractdata/starlight-theme — the bundled skill files are missing.`,
  );
}

const pkgPath = resolve(PROJECT_ROOT, 'package.json');
if (!existsSync(pkgPath)) {
  die(
    `No package.json found in ${PROJECT_ROOT}.\n` +
      `       Run abstract-data-install-skills from the root of your docs project.`,
  );
}

let pkg;
try {
  pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
} catch (err) {
  die(`Failed to parse package.json: ${err.message}`);
}

const allDeps = {
  ...(pkg.dependencies ?? {}),
  ...(pkg.devDependencies ?? {}),
};
if (!allDeps['@abstractdata/starlight-theme']) {
  log(
    `${c.gold}warn${c.reset} @abstractdata/starlight-theme is not in your package.json.`,
  );
  log(
    `     Run ${c.bold}bun add @abstractdata/starlight-theme${c.reset} first, then re-run this command.`,
  );
  log('');
}

// ─── Mapping ───────────────────────────────────────────────────────
const MAPPINGS = [
  {
    label: 'Claude Code skill',
    detect: () =>
      existsSync(resolve(PROJECT_ROOT, '.claude')) ||
      existsSync(resolve(PROJECT_ROOT, 'CLAUDE.md')),
    from: 'claude/abstract-data-setup/SKILL.md',
    to: '.claude/skills/abstract-data-setup/SKILL.md',
  },
  {
    label: 'Claude Code handshake (CLAUDE.md)',
    detect: () => existsSync(resolve(PROJECT_ROOT, 'CLAUDE.md')),
    from: 'claude/CLAUDE.md',
    to: 'CLAUDE.md',
  },
  {
    label: 'Cursor rule',
    detect: () => existsSync(resolve(PROJECT_ROOT, '.cursor')),
    from: 'cursor/abstract-data-setup.mdc',
    to: '.cursor/rules/abstract-data-setup.mdc',
  },
  {
    label: 'Cursor welcome rule (always-apply handshake)',
    detect: () => existsSync(resolve(PROJECT_ROOT, '.cursor')),
    from: 'cursor/welcome.mdc',
    to: '.cursor/rules/welcome.mdc',
  },
  {
    label: 'GitHub Copilot instructions',
    detect: () => existsSync(resolve(PROJECT_ROOT, '.github')),
    from: 'github/copilot-instructions.md',
    to: '.github/copilot-instructions.md',
  },
  // Python autodoc scripts — sourced from the package's `scripts/` dir
  // (not `skills/`) so their `from` paths resolve relative to PACKAGE_ROOT
  // via the `fromBase` field below.
  {
    label: 'Python autodoc orchestrator (build-python-docs.mjs)',
    detect: () => existsSync(resolve(PROJECT_ROOT, 'pyproject.toml')) ||
                  existsSync(resolve(PROJECT_ROOT, 'setup.py')),
    fromBase: 'scripts',
    from: 'build-python-docs.mjs',
    to: 'scripts/build-python-docs.mjs',
  },
  {
    label: 'Python autodoc config (python-autodoc.json)',
    detect: () => existsSync(resolve(PROJECT_ROOT, 'pyproject.toml')) ||
                  existsSync(resolve(PROJECT_ROOT, 'setup.py')),
    fromBase: 'scripts',
    from: 'python-autodoc.json',
    to: 'scripts/python-autodoc.json',
  },
];

// ─── Detection summary ─────────────────────────────────────────────
const detectedLabels = MAPPINGS.filter((m) => m.detect()).map((m) => m.label);
if (detectedLabels.length > 0) {
  log(`${c.dim}Detected tool markers:${c.reset} ${detectedLabels.join(', ')}`);
} else {
  log(`${c.dim}No AI tool markers detected — defaulting to install all formats.${c.reset}`);
}
log('');

// ─── Interactive choices ───────────────────────────────────────────
const rl = createInterface({ input: stdin, output: stdout });
const ask = async (prompt) => (await rl.question(prompt)).trim().toLowerCase();

const choices = [];
for (const m of MAPPINGS) {
  // Per-mapping source root: defaults to skills/, overridable via fromBase
  // (used by the Python autodoc scripts which live in the package's
  // scripts/ directory, not skills/).
  const sourceBase = m.fromBase === 'scripts' ? SCRIPTS_SRC : SKILLS_SRC;
  const fromPath = resolve(sourceBase, m.from);
  const toPath = resolve(PROJECT_ROOT, m.to);
  if (!existsSync(fromPath)) {
    log(`${c.dim}—${c.reset} skip ${m.label} (not present in package skills/)`);
    continue;
  }

  const exists = existsSync(toPath);
  const wasDetected = m.detect();
  const tag = wasDetected
    ? ` ${c.gold}(detected)${c.reset}`
    : '';
  const defaultHint = exists
    ? `${c.gold}[overwrite y/N]${c.reset}`
    : `${c.green}[Y/n]${c.reset}`;
  const prompt = `${c.cyan}?${c.reset} Install ${c.bold}${m.label}${c.reset}${tag} → ${c.dim}${m.to}${c.reset} ${defaultHint} `;
  const ans = await ask(prompt);

  // Default Y for new files; default N for overwrites.
  const install = exists
    ? ans === 'y' || ans === 'yes'
    : ans !== 'n' && ans !== 'no';

  choices.push({
    label: m.label,
    fromPath,
    toPath,
    install,
    willOverwrite: exists && install,
    relativeTo: m.to,
  });
}
rl.close();

// ─── Apply ─────────────────────────────────────────────────────────
log('');
let installed = 0;
let skipped = 0;
for (const ch of choices) {
  if (!ch.install) {
    log(`${c.dim}—${c.reset} skipped ${ch.label}`);
    skipped += 1;
    continue;
  }
  mkdirSync(dirname(ch.toPath), { recursive: true });
  copyFileSync(ch.fromPath, ch.toPath);
  const verb = ch.willOverwrite ? 'overwrote' : 'installed';
  log(
    `${c.green}✓${c.reset} ${verb} ${c.bold}${ch.label}${c.reset} ${c.dim}→ ${ch.relativeTo}${c.reset}`,
  );
  installed += 1;
}

// ─── Summary ───────────────────────────────────────────────────────
log('');
log(`${c.gold}Done.${c.reset} ${installed} installed, ${skipped} skipped.`);
log('');
log(`${c.dim}Open your AI assistant in this folder and say "set up docs"${c.reset}`);
log(`${c.dim}to invoke the abstract-data-setup workflow.${c.reset}`);
log('');
