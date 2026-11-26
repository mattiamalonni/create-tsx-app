import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Answers } from './prompts';
import { getDependencies } from './config';
import { copy, emptyDir, writeFile } from './utils';
import { isTemplate } from './validations';
import type { PackageManager } from './utils';

const RENAMED_FILES: Record<string, string> = {
  _gitignore: '.gitignore',
  _env: '.env.example',
};

const OXLINT_CONFIG = `import { defineConfig } from 'oxlint';

export default defineConfig({
  categories: { correctness: 'error' },
});
`;

const OXFMT_CONFIG = `import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 150,
  singleQuote: true,
});
`;

function ciWorkflow(packageManager: PackageManager, features: Answers['features']): string {
  const cache = packageManager === 'bun' ? '' : `          cache: ${packageManager}\n`;
  const install = packageManager === 'npm' ? 'npm ci' : `${packageManager} install --frozen-lockfile`;
  const checks = ['type-check', ...(features.lint ? ['lint'] : []), ...(features.format ? ['format:check'] : []), 'build'];

  return `name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  verify:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node: ['22.18.0', '24']
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: \${{ matrix.node }}
${cache}      - run: ${install}
${checks.map((script) => `      - run: ${packageManager} run ${script}`).join('\n')}
`;
}

function dockerFiles(packageManager: PackageManager): { dockerfile: string; ignore: string } {
  const image = packageManager === 'bun' ? 'oven/bun:1-alpine' : 'node:22-alpine';
  const install = { npm: 'npm install', pnpm: 'pnpm install', yarn: 'yarn install', bun: 'bun install' }[packageManager];
  const productionInstall = {
    npm: 'npm install --omit=dev',
    pnpm: 'pnpm install --prod',
    yarn: 'yarn install --production',
    bun: 'bun install --production',
  }[packageManager];
  const runBuild = `${packageManager} run build`;

  return {
    dockerfile: `FROM ${image} AS build
WORKDIR /app
COPY package.json ./
RUN ${install}
COPY . .
RUN ${runBuild}

FROM ${image} AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
RUN ${productionInstall}
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/index.js"]
`,
    ignore: `node_modules/
dist/
.git/
.env
.env.*
!*.example
*.log
`,
  };
}

function licenseFile(author: string): string {
  return `MIT License

Copyright (c) ${new Date().getFullYear()} ${author}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;
}

export interface FilePlan {
  path: string;
  content?: string;
  source?: string;
}

/** oxfmt sorts package.json by default; emit the canonical order up front. */
function ordered<T extends Record<string, unknown>>(value: T, preferred: string[] = []): T {
  const keys = Object.keys(value).sort((left, right) => {
    const leftIndex = preferred.indexOf(left);
    const rightIndex = preferred.indexOf(right);
    if (leftIndex !== -1 || rightIndex !== -1) {
      return (leftIndex === -1 ? preferred.length : leftIndex) - (rightIndex === -1 ? preferred.length : rightIndex);
    }
    return left.localeCompare(right);
  });

  return Object.fromEntries(keys.map((key) => [key, value[key]])) as T;
}

function addSource(plan: FilePlan[], source: string, relative: string): void {
  if (fs.statSync(source).isDirectory()) {
    for (const entry of fs.readdirSync(source).sort()) addSource(plan, path.join(source, entry), path.join(relative, entry));
    return;
  }
  plan.push({ path: relative, source });
}

export function templatesDirectory(): string {
  // Works both for the unbuild stub (source) and for the published bundle.
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'templates');
}

export function resolveTemplate(template: string): { dir: string; custom: boolean } {
  if (isTemplate(template)) return { dir: path.join(templatesDirectory(), template), custom: false };

  const resolved = path.resolve(process.cwd(), template);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isDirectory()) {
    throw new Error(`Template "${template}" is neither a built-in template nor an existing directory.`);
  }
  if (!fs.existsSync(path.join(resolved, 'package.json'))) {
    throw new Error(`Custom template "${template}" must contain a package.json.`);
  }
  if (!fs.existsSync(path.join(resolved, 'src', 'index.ts'))) {
    throw new Error(`Custom template "${template}" must contain src/index.ts (the generated scripts use it).`);
  }
  return { dir: resolved, custom: true };
}

/** Computes every file that would be written, without touching the filesystem. */
export function createPlan(answers: Answers): FilePlan[] {
  const { packageName, template, features, author } = answers;
  const { dir: templateDir, custom } = resolveTemplate(template);
  const commonDir = path.join(templatesDirectory(), 'common');

  for (const [label, dir] of [
    ['template', templateDir],
    ['common', commonDir],
  ] as const) {
    if (!fs.existsSync(dir)) throw new Error(`${label} files not found at ${dir}. Reinstall create-tsx-app.`);
  }

  const plan: FilePlan[] = [];
  const templateFiles = fs.readdirSync(templateDir).filter((file) => file !== 'package.json' && file !== 'README.md');
  for (const file of templateFiles) addSource(plan, path.join(templateDir, file), file);

  if (!custom) {
    for (const file of fs.readdirSync(commonDir)) {
      if (file === '_env' && !features.env) continue;
      if (file === '_gitignore' && !features.git) continue;
      addSource(plan, path.join(commonDir, file), RENAMED_FILES[file] ?? file);
    }
  }

  if (features.lint) plan.push({ path: 'oxlint.config.ts', content: OXLINT_CONFIG });
  if (features.format) plan.push({ path: 'oxfmt.config.ts', content: OXFMT_CONFIG });
  if (features.ci) plan.push({ path: '.github/workflows/ci.yml', content: ciWorkflow(answers.packageManager, features) });
  if (features.docker) {
    const { dockerfile, ignore } = dockerFiles(answers.packageManager);
    plan.push({ path: 'Dockerfile', content: dockerfile }, { path: '.dockerignore', content: ignore });
  }
  if (features.license) plan.push({ path: 'LICENSE', content: licenseFile(author) });
  if (features.env && !custom) addSource(plan, path.join(commonDir, '_env'), '.env');

  // A tiny adapter keeps the sources free of package-manager specific flags.
  plan.push({ path: 'src/env.ts', content: features.env ? "import 'dotenv/config';\n" : 'export {};\n' });

  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, 'package.json'), 'utf-8')) as Record<string, unknown>;
  pkg.name = packageName;
  pkg.private = true;
  pkg.engines = { node: '>=22.18.0' };
  pkg.scripts = {
    dev: 'tsx watch src/index.ts',
    start: 'node dist/index.js',
    build: 'tsc',
    'type-check': 'tsc --noEmit',
    clean: 'rm -rf dist',
    ...(features.lint ? { lint: 'oxlint src', 'lint:fix': 'oxlint src --fix' } : {}),
    ...(features.format ? { format: 'oxfmt --write .', 'format:check': 'oxfmt --check .' } : {}),
  };

  const dependencyTemplate = isTemplate(template) ? template : 'basic';
  const { dependencies, devDependencies } = getDependencies(dependencyTemplate, features);
  const templateDependencies = (pkg.dependencies ?? {}) as Record<string, string>;
  const templateDevDependencies = (pkg.devDependencies ?? {}) as Record<string, string>;
  const allDependencies = { ...templateDependencies, ...dependencies };
  const allDevDependencies = { ...templateDevDependencies, ...devDependencies };
  if (Object.keys(allDependencies).length > 0) pkg.dependencies = ordered(allDependencies);
  if (Object.keys(allDevDependencies).length > 0) pkg.devDependencies = ordered(allDevDependencies);

  const manifest = ordered(pkg, [
    'name',
    'version',
    'private',
    'description',
    'type',
    'main',
    'scripts',
    'dependencies',
    'devDependencies',
    'engines',
  ]);
  plan.push({ path: 'package.json', content: `${JSON.stringify(manifest, null, 2)}\n` });

  const templateReadme = path.join(templateDir, 'README.md');
  if (fs.existsSync(templateReadme)) addSource(plan, templateReadme, 'README.md');

  return plan;
}

export function scaffold(answers: Answers): FilePlan[] {
  const plan = createPlan(answers);
  if (answers.overwrite) emptyDir(answers.root);
  fs.mkdirSync(answers.root, { recursive: true });

  for (const file of plan) {
    const destination = path.join(answers.root, file.path);
    if (file.source) copy(file.source, destination);
    else writeFile(destination, file.content ?? '');
  }

  return plan;
}
