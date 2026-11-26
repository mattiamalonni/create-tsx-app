import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { getDependencies } from '../src/config.ts';
import { copy, emptyDir, formatTargetDir, isDirEmpty, toValidPackageName, writeFile } from '../src/utils.ts';
import { compareVersions, isTemplate, isValidPackageName } from '../src/validations.ts';

test('formatTargetDir removes trailing slashes and surrounding whitespace', () => {
  assert.equal(formatTargetDir('  my-app///  '), 'my-app');
  assert.equal(formatTargetDir('.'), '.');
});

test('toValidPackageName produces npm-compatible names', () => {
  assert.equal(toValidPackageName('My Cool App'), 'my-cool-app');
  assert.equal(toValidPackageName('..weird__name'), 'weird-name');
  assert.equal(toValidPackageName('---'), 'tsx-app');
  assert.equal(toValidPackageName(undefined, '/tmp/Example API'), 'example-api');
  assert.ok(isValidPackageName(toValidPackageName('Hello World!')));
});

test('package name and template validation reject invalid values', () => {
  assert.ok(isValidPackageName('@scope/my-app'));
  assert.ok(!isValidPackageName('My App'));
  assert.ok(!isValidPackageName(''));
  assert.ok(isTemplate('express'));
  assert.ok(!isTemplate('nestjs'));
});

test('compareVersions understands multi-digit parts', () => {
  assert.ok(compareVersions('20.19.0', '18.20.7') > 0);
  assert.ok(compareVersions('22.9.0', '22.10.0') < 0);
  assert.equal(compareVersions('v22.18.0', '22.18.0'), 0);
});

test('dependency manifest follows the selected template and features', () => {
  const base = { lint: false, format: false, git: false, gitCommit: true, ci: false, docker: false, env: false, install: false, license: false };

  assert.deepEqual(getDependencies('basic', base).dependencies, {});
  assert.ok('express' in getDependencies('express', base).dependencies);
  assert.ok('fastify' in getDependencies('fastify', base).dependencies);
  assert.ok(!('dotenv' in getDependencies('basic', base).dependencies));
  assert.ok('dotenv' in getDependencies('basic', { ...base, env: true }).dependencies);
  assert.ok('oxlint' in getDependencies('basic', { ...base, lint: true }).devDependencies);
  assert.ok('oxfmt' in getDependencies('basic', { ...base, format: true }).devDependencies);
  assert.ok(!('oxlint' in getDependencies('basic', { ...base, format: true }).devDependencies));
});

test('filesystem helpers preserve .git and copy nested directories', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'create-tsx-app-utils-'));
  const target = path.join(root, 'target');
  fs.mkdirSync(path.join(target, '.git'), { recursive: true });
  fs.mkdirSync(path.join(target, 'keep'));
  writeFile(path.join(target, 'keep', 'old.txt'), 'old');
  writeFile(path.join(target, '.git', 'config'), 'repo');

  assert.equal(isDirEmpty(path.join(root, 'missing')), true);
  assert.equal(isDirEmpty(target), false);

  emptyDir(target);
  assert.equal(fs.existsSync(path.join(target, '.git', 'config')), true);
  assert.equal(fs.existsSync(path.join(target, 'keep')), false);

  const source = path.join(root, 'source');
  fs.mkdirSync(path.join(source, 'nested'), { recursive: true });
  writeFile(path.join(source, 'nested', 'file.txt'), 'content');
  copy(source, target);
  assert.equal(fs.readFileSync(path.join(target, 'nested', 'file.txt'), 'utf-8'), 'content');

  fs.rmSync(root, { recursive: true, force: true });
});
