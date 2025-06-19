import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

import * as prompts from '@clack/prompts';
import {
  emptyDir,
  formatTargetDir,
  isDirEmpty,
  isValidPackageName,
  toValidPackageName,
  writeFile,
  detectPackageManager,
  validateNodeVersion,
  isGitInstalled,
  isPackageManagerInstalled,
} from './utils';

import cli from './cli';

const { args, options } = cli;

const cwd = process.cwd();

const renameFiles: Record<string, string | undefined> = {
  _gitignore: '.gitignore',
  '_eslint.config.js': 'eslint.config.js',
  '_eslint.prettier.config.js': 'eslint.config.js',
  '_prettierrc.json': '.prettierrc.json',
  _prettierignore: '.prettierignore',
  _env: '.env',
};

const defaultTargetDir = 'tsx-app';
const cancel = () => prompts.cancel('Operation cancelled');

async function init() {
  // Validate Node.js version
  const nodeValidation = validateNodeVersion();
  if (!nodeValidation.isValid) {
    prompts.log.error(`Node.js version ${nodeValidation.requiredVersion} or higher is required. You are using ${nodeValidation.currentVersion}.`);
    prompts.log.info('Please update Node.js: https://nodejs.org/');
    process.exit(1);
  }

  prompts.intro('Welcome to create-tsx-app! This tool will help you set up a new TypeScript project with tsx.');

  const packageManager = detectPackageManager();

  // Validate package manager is available
  if (!isPackageManagerInstalled(packageManager)) {
    prompts.log.error(`Package manager "${packageManager}" is not installed or not available.`);
    prompts.log.info(`Please install ${packageManager} or use a different package manager.`);
    process.exit(1);
  }

  let targetDir = args[0];
  if (!targetDir) {
    const _targetDir = await prompts.text({
      message: 'App name:',
      defaultValue: defaultTargetDir,
      placeholder: defaultTargetDir,
    });
    if (prompts.isCancel(_targetDir)) return cancel();
    targetDir = formatTargetDir(_targetDir as string);
  }

  let shouldOverwrite = false;
  if (!isDirEmpty(targetDir)) {
    const overwrite = options.overwrite
      ? 'yes'
      : await prompts.select({
          message: (targetDir === '.' ? 'Current' : `Target`) + ` "${targetDir}" is not empty. Please choose how to proceed:`,
          options: [
            { value: 'no', label: 'Cancel operation' },
            { value: 'yes', label: 'Remove existing files and continue' },
            { value: 'ignore', label: 'Ignore files and continue' },
          ],
        });

    if (prompts.isCancel(overwrite)) return cancel();

    if (overwrite === 'no') {
      prompts.outro('Operation cancelled');
      return;
    }

    shouldOverwrite = overwrite === 'yes';
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

  const isInteractive = options.interactive;

  // When --no-feature is used, cac sets feature to false
  // Default to true for all features, disable only if explicitly set to false
  let useEslint = options.eslint !== false;
  if (isInteractive) {
    const _useEslint = await prompts.confirm({
      message: 'Add ESLint for code linting?',
      initialValue: useEslint,
    });
    if (prompts.isCancel(_useEslint)) return cancel();
    useEslint = _useEslint;
  }

  let usePrettier = options.prettier !== false;
  if (isInteractive) {
    const _usePrettier = await prompts.confirm({
      message: 'Add Prettier for code formatting?',
      initialValue: usePrettier,
    });
    if (prompts.isCancel(_usePrettier)) return cancel();
    usePrettier = _usePrettier;
  }

  let useGit = options.git !== false;
  const isGitAvailable = isGitInstalled();
  if (isGitAvailable) {
    if (isInteractive) {
      const _useGit = await prompts.confirm({
        message: 'Initialize Git repository?',
        initialValue: useGit,
      });
      if (prompts.isCancel(_useGit)) return cancel();
      useGit = _useGit && isGitAvailable;
    }
  } else {
    prompts.log.warn('Git is not installed. Git repository initialization will be skipped.');
    prompts.log.info('Install Git to enable repository initialization: https://git-scm.com/downloads');
  }

  let useEnv = options.env !== false;
  if (isInteractive) {
    const _useEnv = await prompts.confirm({
      message: 'Setup environment variables (.env file)?',
      initialValue: useEnv,
    });
    if (prompts.isCancel(_useEnv)) return cancel();
    useEnv = _useEnv;
  }

  const root = path.join(cwd, targetDir);

  if (shouldOverwrite) {
    emptyDir(targetDir);
  }
  fs.mkdirSync(root, { recursive: true });

  prompts.log.step(`Scaffolding project in ${root}...`);

  const templateDir = path.resolve(fileURLToPath(import.meta.url), '../..', `template`);

  if (!fs.existsSync(templateDir)) {
    prompts.log.error('Template directory not found. Please reinstall create-tsx-app.');
    return;
  }

  const validPackageManagers = ['npm', 'pnpm', 'yarn', 'bun'];
  if (!validPackageManagers.includes(packageManager)) {
    prompts.log.warn(`Unknown package manager: ${packageManager}. Falling back to npm.`);
  }

  const files = fs.readdirSync(templateDir).filter(f => f !== 'package.json');

  const filesToCopy = [];
  for (const file of files) {
    if (file === '_eslint.config.js' && (!useEslint || usePrettier)) continue;
    if (file === '_eslint.prettier.config.js' && (!useEslint || !usePrettier)) continue;
    if (file === '_prettierrc.json' && !usePrettier) continue;
    if (file === '_prettierignore' && !usePrettier) continue;
    if (file === '_env' && !useEnv) continue;

    filesToCopy.push(file);
  }

  // Copy files

  for (const file of filesToCopy) {
    const srcFile = path.join(templateDir, file);
    const destFile = path.join(root, renameFiles[file] || file);

    try {
      writeFile(destFile, srcFile);
    } catch (error) {
      prompts.log.error(`Failed to copy ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'));

  pkg.name = packageName;

  if (useEslint) pkg.scripts = { ...pkg.scripts, lint: 'eslint src/**/*.ts', 'lint:fix': 'eslint src/**/*.ts --fix' };
  if (usePrettier) pkg.scripts = { ...pkg.scripts, format: 'prettier --write src/**/*.ts', 'format:check': 'prettier --check src/**/*.ts' };
  if (useEnv) pkg.scripts = { ...pkg.scripts, dev: 'tsx watch -r dotenv/config src/index.ts', start: 'tsx -r dotenv/config src/index.ts' };

  writeFile(path.join(root, 'package.json'), undefined, JSON.stringify(pkg, null, 2) + '\n');

  const readmePath = path.join(templateDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    readmeContent = readmeContent.replace(/\{\{PROJECT_NAME\}\}/g, packageName);
    fs.writeFileSync(path.join(root, 'README.md'), readmeContent);
  }

  // Install dependencies

  const devDependencies = ['typescript', 'tsx', '@types/node'];
  if (useEslint) devDependencies.push('eslint', '@eslint/js', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser');
  if (usePrettier) devDependencies.push('prettier');
  if (useEslint && usePrettier) devDependencies.push('eslint-plugin-prettier', 'eslint-config-prettier');
  if (useEnv) devDependencies.push('dotenv');

  const devDependenciesStr = devDependencies.join(' ');
  prompts.log.step(`Installing ${devDependencies.length} dependencies using ${packageManager}...`);
  try {
    const s = prompts.spinner();
    s.start(`Downloading packages...`);
    try {
      switch (packageManager) {
        case 'bun':
          execSync(`bun add -D ${devDependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
          break;
        case 'pnpm':
          execSync(`pnpm add -D ${devDependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
          break;
        case 'yarn':
          execSync(`yarn add -D ${devDependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
          break;
        default:
          execSync(`npm install -D ${devDependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
      }

      s.stop('Dependencies installed successfully.');
    } catch (error) {
      s.stop('Failed to install dependencies.', 1);
      const installCommand = packageManager === 'npm' ? 'install -D' : 'add -D';
      prompts.log.error(`You can run \`${packageManager} ${installCommand} ${devDependenciesStr}\` manually.`);
    }
  } catch (error) {
    const installCommand = packageManager === 'npm' ? 'install -D' : 'add -D';
    prompts.log.error(`Failed to install dependencies. You can run \`${packageManager} ${installCommand} ${devDependenciesStr}\` manually.`);
  }

  // Initialize Git repository

  if (useGit) {
    try {
      prompts.log.step('Initializing Git repository...');
      execSync('git init', { cwd: root, stdio: 'pipe' });
      execSync('git add .', { cwd: root, stdio: 'pipe' });
      execSync('git commit -m "Initial commit"', { cwd: root, stdio: 'pipe' });
      prompts.log.step('Git repository initialized with initial commit.');
    } catch (error) {
      prompts.log.warn('Failed to initialize Git repository. You can run `git init` manually.');
    }
  }

  prompts.outro(`
✅ Project created successfully!

Next steps:
  1. Navigate to your project: cd ${targetDir}
  2. Start developing: npm run dev
  3. Build your project: npm run build

Happy coding! 🚀
  `);
}

init().catch(error => {
  console.error(error);
  process.exit(1);
});
