#!/usr/bin/env node
/**
 * smoke-test.mjs
 *
 * End-to-end validation of the publish pipeline. Run this from the
 * workspace root before declaring a release "shipped":
 *
 *   bun run smoke-test
 *
 * What it does:
 *   1. Compiles skill files (verifies the compiler runs clean).
 *   2. Runs the local create-docs CLI to scaffold a temp project.
 *   3. Inspects the scaffolded tree to verify all expected files landed
 *      (CLAUDE.md, .claude/skills, .cursor/rules, .github/copilot-instructions.md,
 *      scripts/build-python-docs.mjs, scripts/python-autodoc.json).
 *   4. Optionally — only with --build flag — runs `bun install` and
 *      `bun run build` inside the temp project to verify the production
 *      build works against published versions of the theme.
 *
 * After publishing the theme + create-docs, run:
 *
 *   bun run smoke-test -- --published
 *
 * which also verifies `bun create @abstractdata/docs` works against npm.
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, statSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const args = process.argv.slice(2);
const SHOULD_BUILD = args.includes('--build') || args.includes('--published');
const TEST_PUBLISHED = args.includes('--published');

const c = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  cyan: '\x1b[36m', gold: '\x1b[33m', green: '\x1b[32m', red: '\x1b[31m',
};

const log = (...a) => console.log(...a);
const die = (msg) => {
  console.error(`${c.red}✗ FAILED${c.reset} ${msg}`);
  process.exit(1);
};
const pass = (msg) => log(`${c.green}✓${c.reset} ${msg}`);
const phase = (n, name) => log(
  `\n${c.cyan}${c.bold}[${n}/5] ${name}${c.reset}\n`,
);

// ─── 1: Compile ────────────────────────────────────────────────────
phase(1, 'Compile skill files');
{
  const r = spawnSync('node', ['scripts/compile-skill.mjs'], {
    cwd: REPO_ROOT, stdio: 'pipe', encoding: 'utf8',
  });
  if (r.status !== 0) die(`compile-skill.mjs failed:\n${r.stdout}\n${r.stderr}`);
  const compiled = (r.stdout.match(/✓/g) ?? []).length;
  if (compiled < 10) die(`expected ≥ 10 compiled outputs, got ${compiled}`);
  pass(`compile-skill emitted ${compiled} files`);
}

// ─── 2: Scaffold ───────────────────────────────────────────────────
phase(2, 'Scaffold a fresh project via the local CLI');
const tmpRoot = mkdtempSync(join(tmpdir(), 'ad-smoke-'));
const projectDir = join(tmpRoot, 'demo-project');
{
  // Pipe project name on stdin
  const r = spawnSync(
    'node',
    [join(REPO_ROOT, 'packages/create-docs/bin/cli.js')],
    {
      cwd: tmpRoot,
      stdio: ['pipe', 'pipe', 'inherit'],
      encoding: 'utf8',
      input: 'demo-project\n',
    },
  );
  if (r.status !== 0) die(`create-docs CLI failed (exit ${r.status})`);
  if (!existsSync(projectDir)) die(`project directory missing: ${projectDir}`);
  pass(`scaffolded ${projectDir}`);
}

// ─── 3: Inspect scaffolded tree ─────────────────────────────────────
phase(3, 'Inspect scaffolded files');
const REQUIRED = [
  'package.json',
  'astro.config.mjs',
  'tsconfig.json',
  'CLAUDE.md',
  '.claude/skills/abstract-data-setup/SKILL.md',
  '.cursor/rules/abstract-data-setup.mdc',
  '.cursor/rules/welcome.mdc',
  '.github/copilot-instructions.md',
  '.github/workflows/deploy.yml',
  'scripts/build-python-docs.mjs',
  'scripts/python-autodoc.json',
  'src/content/docs/index.mdx',
  'src/content/docs/quickstart.md',
];
for (const rel of REQUIRED) {
  const full = join(projectDir, rel);
  if (!existsSync(full)) die(`missing file: ${rel}`);
  if (!statSync(full).isFile()) die(`expected file, got something else: ${rel}`);
}
pass(`all ${REQUIRED.length} required files present`);

// Verify the package.json got the THEME_VERSION substitution
const pkg = JSON.parse(readFileSync(join(projectDir, 'package.json'), 'utf8'));
if (pkg.dependencies?.['@abstractdata/starlight-theme']?.startsWith('workspace:')) {
  die(`package.json still has workspace:* — sync-theme-version didn't substitute`);
}
if (!pkg.dependencies?.['@abstractdata/starlight-theme']?.startsWith('^')) {
  die(`package.json theme dep should be a caret range, got ${pkg.dependencies['@abstractdata/starlight-theme']}`);
}
pass(`theme dep pinned to ${pkg.dependencies['@abstractdata/starlight-theme']}`);

// Verify astro.config.mjs got the project-name substitution
const cfg = readFileSync(join(projectDir, 'astro.config.mjs'), 'utf8');
if (!cfg.includes("title: 'demo-project'")) {
  die(`astro.config.mjs title not substituted (still has placeholder)`);
}
pass(`astro.config.mjs title substituted with project name`);

// ─── 4: Build (optional) ───────────────────────────────────────────
if (SHOULD_BUILD) {
  phase(4, `Run bun install + bun run build${TEST_PUBLISHED ? ' (against published packages)' : ''}`);
  const inst = spawnSync('bun', ['install'], {
    cwd: projectDir, stdio: 'inherit',
  });
  if (inst.status !== 0) die('bun install failed');
  pass('bun install succeeded');

  const build = spawnSync('bun', ['run', 'build'], {
    cwd: projectDir, stdio: 'inherit',
  });
  if (build.status !== 0) die('bun run build failed');
  pass('bun run build succeeded');

  // Spot-check dist
  const distIndex = join(projectDir, 'dist', 'index.html');
  if (!existsSync(distIndex)) die(`dist/index.html missing after build`);
  const html = readFileSync(distIndex, 'utf8');
  if (!html.includes('Abstract Data') && !html.includes('demo-project')) {
    die(`dist/index.html has neither "Abstract Data" nor "demo-project" — build looks empty`);
  }
  pass(`dist/index.html exists and has expected content`);
} else {
  phase(4, 'Build phase skipped (pass --build to enable, or --published to test against npm)');
  log(`${c.dim}  rerun with: bun run smoke-test --build${c.reset}`);
}

// ─── 5: Cleanup ────────────────────────────────────────────────────
phase(5, 'Cleanup');
rmSync(tmpRoot, { recursive: true, force: true });
pass(`removed ${tmpRoot}`);

log(`\n${c.green}${c.bold}━━━ SMOKE TEST PASSED ━━━${c.reset}\n`);
