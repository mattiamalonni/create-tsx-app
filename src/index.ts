import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import mri from 'mri';
import * as prompts from '@clack/prompts';
import { emptyDir, formatTargetDir, isDirEmpty, isValidPackageName, toValidPackageName, writeFile } from './utils';

const argv = mri<{
  help?: boolean;
  install?: boolean;
  overwrite?: boolean;
}>(process.argv.slice(2), {
  alias: { h: 'help', i: 'install', o: 'overwrite' },
  boolean: ['help', 'install', 'overwrite'],
});

const cwd = process.cwd();

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
};

const defaultTargetDir = 'tsx-app';
const cancel = () => prompts.cancel('Operation cancelled');

async function init() {
  prompts.intro('Welcome to create-tsx-app! This tool will help you set up a new TypeScript project with tsx.');

  const argOverwrite = argv.overwrite;
  const argInstall = argv.install;

  let targetDir = argv._[0];

  if (!targetDir) {
    const _targetDir = await prompts.text({
      message: 'App name:',
      defaultValue: defaultTargetDir,
      placeholder: defaultTargetDir,
    });
    targetDir = formatTargetDir(_targetDir as string);
  }

  if (!isDirEmpty(targetDir)) {
    const overwrite = argOverwrite
      ? 'yes'
      : await prompts.select({
          message:
            (targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`) +
            ` is not empty. Please choose how to proceed:`,
          options: [
            { value: 'no', label: 'Cancel operation' },
            { value: 'yes', label: 'Remove existing files and continue' },
            { value: 'ignore', label: 'Ignore files and continue' },
          ],
        });

    switch (overwrite) {
      case 'yes':
        emptyDir(targetDir);
        break;
      case 'no':
        cancel();
        return;
    }
  }

  let packageName = toValidPackageName(targetDir);

  if (!isValidPackageName(packageName)) {
    const _packageName = await prompts.text({
      message: 'Package name:',
      defaultValue: toValidPackageName(packageName),
      placeholder: toValidPackageName(packageName),
      validate(dir: string) {
        if (!isValidPackageName(dir)) return 'Invalid app name.';
      },
    });
    if (prompts.isCancel(_packageName)) return cancel();

    packageName = _packageName;
  }

  const root = path.join(cwd, targetDir);
  fs.mkdirSync(root, { recursive: true });

  prompts.log.step(`Scaffolding project in ${root}...`);

  const templateDir = path.resolve(fileURLToPath(import.meta.url), '../..', `template`);

  const files = fs.readdirSync(templateDir).filter((f) => f !== 'package.json');

  for (const file of files) {
    const srcFile = path.join(templateDir, file);
    const destFile = path.join(root, renameFiles[file] || file);
    writeFile(destFile, srcFile);
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'));

  pkg.name = packageName;

  writeFile(path.join(root, 'package.json'), undefined, JSON.stringify(pkg, null, 2) + '\n');

  // If --install (or -i) was passed, skip the prompt and install dependencies
  let installDeps = argInstall;

  if (!installDeps) {
    const _installDeps = await prompts.confirm({
      message: 'Do you want to install dependencies now?',
      initialValue: true,
    });

    if (prompts.isCancel(_installDeps)) return cancel();
    installDeps = _installDeps;
  }

  if (installDeps) {
    const packageManager = await prompts.select({
      message: `Select your preferred package manager:`,
      options: [
        { value: 'npm', label: 'npm' },
        { value: 'pnpm', label: 'pnpm' },
        { value: 'yarn', label: 'yarn' },
      ],
    });

    if (prompts.isCancel(packageManager)) return cancel();

    try {
      switch (packageManager) {
        case 'pnpm':
          prompts.log.step(`Installing dependencies using pnpm...`);
          execSync(`npx pnpm install --silent`, { cwd: root, stdio: 'inherit' });
          break;
        case 'yarn':
          prompts.log.step(`Installing dependencies using yarn...`);
          execSync(`npx yarn install --silent`, { cwd: root, stdio: 'inherit' });
          break;
        default:
          prompts.log.step(`Installing dependencies using npm...`);
          execSync(`npm install --silent`, { cwd: root, stdio: 'inherit' });
      }

      prompts.log.step('Dependencies installed successfully.');
    } catch (error) {
      prompts.log.error('Failed to install dependencies. You can run `npm install` manually.');
    }
  } else {
    prompts.log.step('You can install dependencies later by running `npm install` inside the project folder.');
  }

  prompts.outro('Done.');
}

init().catch(console.error);
