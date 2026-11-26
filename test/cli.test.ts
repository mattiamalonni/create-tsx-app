import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test, { type TestContext } from 'node:test';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cli = path.join(repoRoot, 'index.js');

function run(...args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { cwd: repoRoot, encoding: 'utf-8' });
}

function runFrom(cwd: string, ...args: string[]) {
  return spawnSync(process.execPath, [cli, ...args], { cwd, encoding: 'utf-8' });
}

function tempDir(t: TestContext): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'create-tsx-app-cli-'));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

interface GeneratedPackage {
  name: string;
  engines: { node: string };
  scripts: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

function pkg(project: string): GeneratedPackage {
  return JSON.parse(fs.readFileSync(path.join(project, 'package.json'), 'utf-8')) as GeneratedPackage;
}

test('--version and --help work without scaffolding', () => {
  const version = run('--version');
  assert.equal(version.status, 0);
  assert.match(version.stdout, /create-tsx-app\//);

  const help = run('--help');
  assert.equal(help.status, 0);
  assert.match(help.stdout, /--template/);
  assert.match(help.stdout, /--package-manager/);
  assert.match(help.stdout, /--lint/);
  assert.match(help.stdout, /--format/);
  assert.match(help.stdout, /--install/);
  assert.doesNotMatch(help.stdout, /--eslint/);
  assert.doesNotMatch(help.stdout, /--prettier/);
});

for (const template of ['basic', 'express', 'fastify'] as const) {
  test(`scaffolds the ${template} template with all features`, (t) => {
    const dir = tempDir(t);
    const project = path.join(dir, template);

    const result = run(project, '--template', template, '--yes', '--no-install', '--no-git');
    assert.equal(result.status, 0, result.stderr + result.stdout);

    assert.ok(fs.existsSync(path.join(project, 'src/index.ts')));
    assert.ok(fs.existsSync(path.join(project, 'src/env.ts')));
    assert.ok(fs.existsSync(path.join(project, 'tsconfig.json')));
    const lintConfig = fs.readFileSync(path.join(project, 'oxlint.config.ts'), 'utf-8');
    const formatConfig = fs.readFileSync(path.join(project, 'oxfmt.config.ts'), 'utf-8');
    assert.match(lintConfig, /defineConfig/);
    assert.match(formatConfig, /defineConfig/);
    assert.ok(fs.existsSync(path.join(project, '.env')));
    assert.ok(fs.existsSync(path.join(project, '.env.example')));
    assert.equal(fs.existsSync(path.join(project, '.gitignore')), false);

    const manifest = pkg(project);
    assert.equal(manifest.name, template);
    assert.equal(manifest.engines.node, '>=22.18.0');
    assert.equal(manifest.scripts.start, 'node dist/index.js');
    assert.equal(manifest.scripts.lint, 'oxlint src');
    assert.equal(manifest.scripts.format, 'oxfmt --write .');
    assert.ok(manifest.devDependencies?.oxlint);
    assert.ok(manifest.devDependencies?.oxfmt);
    assert.ok(!('eslint' in (manifest.devDependencies ?? {})));
    assert.ok(!('prettier' in (manifest.devDependencies ?? {})));
    assert.ok(manifest.dependencies && manifest.dependencies.dotenv);
    assert.ok(
      fs.readFileSync(path.join(project, 'package.json'), 'utf-8').indexOf('"dependencies"') <
        fs.readFileSync(path.join(project, 'package.json'), 'utf-8').indexOf('"engines"'),
    );

    if (template !== 'basic') {
      assert.ok(Object.keys(manifest.dependencies ?? {}).length > 1);
      assert.ok(!fs.readFileSync(path.join(project, 'src/index.ts'), 'utf-8').includes('@ts-nocheck'));
    }
  });
}

test('minimal mode skips optional files and dependencies', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'minimal');
  const result = run(project, '--yes', '--no-install', '--no-git', '--no-env', '--no-lint', '--no-format');
  assert.equal(result.status, 0, result.stderr + result.stdout);

  assert.equal(fs.existsSync(path.join(project, 'oxlint.config.ts')), false);
  assert.equal(fs.existsSync(path.join(project, 'oxfmt.config.ts')), false);
  assert.equal(fs.existsSync(path.join(project, '.env')), false);
  assert.equal(fs.existsSync(path.join(project, '.env.example')), false);
  assert.equal(fs.existsSync(path.join(project, 'src/env.ts')), true);
  assert.ok(!('lint' in pkg(project).scripts));
  assert.ok(!('dotenv' in (pkg(project).dependencies ?? {})));
});

test('rejects invalid templates and package managers', (t) => {
  const dir = tempDir(t);
  const badTemplate = run(path.join(dir, 'x'), '--template', 'unknown', '--yes', '--no-install');
  assert.equal(badTemplate.status, 1);
  assert.match(badTemplate.stdout + badTemplate.stderr, /neither a built-in template/);

  const badManager = run(path.join(dir, 'y'), '--package-manager', 'nonexistent', '--yes', '--no-install');
  assert.equal(badManager.status, 1);
  assert.match(badManager.stdout + badManager.stderr, /Invalid package manager/);
});

test('protects non-empty directories unless overwrite is requested', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'existing');
  fs.mkdirSync(project, { recursive: true });
  writeFile(path.join(project, 'keep.txt'), 'keep');

  const refused = run(project, '--yes', '--no-install', '--no-git');
  assert.equal(refused.status, 1);

  const overwritten = run(project, '--yes', '--overwrite', '--no-install', '--no-git');
  assert.equal(overwritten.status, 0, overwritten.stderr + overwritten.stdout);
  assert.equal(fs.existsSync(path.join(project, 'keep.txt')), false);
  assert.ok(fs.existsSync(path.join(project, 'src/index.ts')));
});

test('--license generates an MIT file with the given author', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'licensed');
  const result = run(project, '--license', '--author', 'Jane Doe', '--yes', '--no-install', '--no-git');
  assert.equal(result.status, 0, result.stderr + result.stdout);
  const license = fs.readFileSync(path.join(project, 'LICENSE'), 'utf-8');
  assert.match(license, /MIT License/);
  assert.match(license, /Jane Doe/);
});

test('--list-templates prints built-in templates without scaffolding', () => {
  const result = run('--list-templates');
  assert.equal(result.status, 0);
  assert.match(result.stdout, /basic\s+Minimal TypeScript/);
  assert.match(result.stdout, /express\s+Express 5/);
  assert.match(result.stdout, /fastify\s+Fastify/);
});

test('--completion prints a shell script', () => {
  const bash = run('--completion', 'bash');
  assert.equal(bash.status, 0);
  assert.match(bash.stdout, /complete -F/);

  const zsh = run('--completion', 'zsh');
  assert.equal(zsh.status, 0);
  assert.match(zsh.stdout, /#compdef/);

  const fish = run('--completion', 'fish');
  assert.equal(fish.status, 0);
  assert.match(fish.stdout, /complete -c/);

  const invalid = run('--completion', 'powershell');
  assert.equal(invalid.status, 1);
});

test('--no-git-commit initializes the repository without committing', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'no-commit');
  const result = run(project, '--no-git-commit', '--yes', '--no-install');
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.ok(fs.existsSync(path.join(project, '.git')));
  assert.equal(fs.existsSync(path.join(project, '.git', 'COMMIT_EDITMSG')), false);
});

test('--scope produces a valid scoped package name', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'scoped');
  const result = run(project, '--scope', 'acme', '--yes', '--no-install', '--no-git');
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(pkg(project).name, '@acme/scoped');

  const invalid = run(path.join(dir, 'bad'), '--scope', 'Not Valid', '--yes', '--no-install');
  assert.equal(invalid.status, 1);
});

test('--docker generates a container setup', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'container');
  const result = run(project, '--template', 'express', '--docker', '--yes', '--no-install', '--no-git');
  assert.equal(result.status, 0, result.stderr + result.stdout);

  const dockerfile = fs.readFileSync(path.join(project, 'Dockerfile'), 'utf-8');
  assert.match(dockerfile, /FROM node:22-alpine AS build/);
  assert.match(dockerfile, /npm run build/);
  assert.match(dockerfile, /CMD \["node", "dist\/index.js"\]/);
  assert.ok(fs.existsSync(path.join(project, '.dockerignore')));
});

test('--ci generates a workflow matching the enabled scripts', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'with-ci');
  const result = run(project, '--ci', '--yes', '--no-install', '--no-git', '--no-format');
  assert.equal(result.status, 0, result.stderr + result.stdout);

  const workflow = fs.readFileSync(path.join(project, '.github', 'workflows', 'ci.yml'), 'utf-8');
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm run build/);
  assert.doesNotMatch(workflow, /format:check/);
});

test('accepts a local custom template directory', (t) => {
  const dir = tempDir(t);
  const templateDir = path.join(dir, 'my-template');
  fs.mkdirSync(path.join(templateDir, 'src'), { recursive: true });
  fs.writeFileSync(path.join(templateDir, 'package.json'), '{"name":"custom","dependencies":{"zod":"^4.0.0"}}\n');
  fs.writeFileSync(path.join(templateDir, 'src', 'index.ts'), "console.log('custom');\n");

  const project = path.join(dir, 'from-custom');
  const result = run(project, '--template', templateDir, '--yes', '--no-install', '--no-git');
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(fs.readFileSync(path.join(project, 'src', 'index.ts'), 'utf-8'), "console.log('custom');\n");
  assert.equal(pkg(project).dependencies?.zod, '^4.0.0');
  assert.ok(fs.existsSync(path.join(project, 'oxlint.config.ts')));
});

test('dry-run previews files without touching the filesystem', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'preview');
  const result = run(project, '--template', 'express', '--dry-run', '--yes');
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /package\.json/);
  assert.match(result.stdout, /src\/index\.ts/);
  assert.match(result.stdout, /Nothing was written/);
  assert.equal(fs.existsSync(project), false);
});

test('create-tsx-app.config.ts provides defaults that CLI flags can override', (t) => {
  const dir = tempDir(t);
  fs.writeFileSync(path.join(dir, 'create-tsx-app.config.ts'), "export default { template: 'express', lint: false, git: false };\n");

  const configured = runFrom(dir, 'app', '--yes', '--no-install');
  assert.equal(configured.status, 0, configured.stderr + configured.stdout);
  assert.equal(pkg(path.join(dir, 'app')).name, 'app');
  assert.ok('express' in (pkg(path.join(dir, 'app')).dependencies ?? {}));
  assert.ok(!('lint' in pkg(path.join(dir, 'app')).scripts));

  const overridden = runFrom(dir, 'second', '--template', 'basic', '--lint', '--yes', '--no-install');
  assert.equal(overridden.status, 0, overridden.stderr + overridden.stdout);
  assert.ok('lint' in pkg(path.join(dir, 'second')).scripts);
});

test('reports the detected package manager in the final instructions', (t) => {
  const dir = tempDir(t);
  const project = path.join(dir, 'pm');
  const result = run(project, '--yes', '--no-install', '--no-git', '--package-manager', 'npm');
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.match(result.stdout, /npm install/);
  assert.match(result.stdout, /npm run dev/);
});

function writeFile(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}
