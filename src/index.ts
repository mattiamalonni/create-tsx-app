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

  // Validate template
  const validTemplates = ['basic', 'express', 'fastify'];
  const selectedTemplate = options.template || 'basic';

  if (!validTemplates.includes(selectedTemplate)) {
    prompts.log.error(`Invalid template "${selectedTemplate}". Available templates: ${validTemplates.join(', ')}`);
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

  // Calculate the absolute path for the project
  const root = path.isAbsolute(targetDir) ? targetDir : path.join(cwd, targetDir);

  let shouldOverwrite = false;
  if (!isDirEmpty(root)) {
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

  // Use the CLI options directly - cac handles --no-* flags by setting the option to false
  let useEslint = options.eslint;
  if (isInteractive) {
    const _useEslint = await prompts.confirm({
      message: 'Add ESLint for code linting?',
      initialValue: useEslint,
    });
    if (prompts.isCancel(_useEslint)) return cancel();
    useEslint = _useEslint;
  }

  let usePrettier = options.prettier;
  if (isInteractive) {
    const _usePrettier = await prompts.confirm({
      message: 'Add Prettier for code formatting?',
      initialValue: usePrettier,
    });
    if (prompts.isCancel(_usePrettier)) return cancel();
    usePrettier = _usePrettier;
  }

  let useGit = options.git;
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

  let useEnv = options.env;
  if (isInteractive) {
    const _useEnv = await prompts.confirm({
      message: 'Setup environment variables (.env file)?',
      initialValue: useEnv,
    });
    if (prompts.isCancel(_useEnv)) return cancel();
    useEnv = _useEnv;
  }

  if (shouldOverwrite) emptyDir(root);
  fs.mkdirSync(root, { recursive: true });

  prompts.log.step(`Scaffolding project in ${root}...`);

  const templatesDir = path.resolve(fileURLToPath(import.meta.url), '../..', `templates`);
  const templateDir = path.join(templatesDir, selectedTemplate);
  const commonDir = path.join(templatesDir, 'common');

  if (!fs.existsSync(templateDir)) {
    prompts.log.error(`Template "${selectedTemplate}" not found. Please reinstall create-tsx-app.`);
    return;
  }

  if (!fs.existsSync(commonDir)) {
    prompts.log.error('Common template files not found. Please reinstall create-tsx-app.');
    return;
  }

  const validPackageManagers = ['npm', 'pnpm', 'yarn', 'bun'];
  if (!validPackageManagers.includes(packageManager)) {
    prompts.log.warn(`Unknown package manager: ${packageManager}. Falling back to npm.`);
  }

  // Get files from template directory (specific template files)
  const templateFiles = fs.readdirSync(templateDir).filter(f => f !== 'package.json');

  // Get files from common directory (shared configuration files)
  const commonFiles = fs.readdirSync(commonDir);

  const filesToCopy = [];

  // Add template-specific files
  for (const file of templateFiles) {
    filesToCopy.push({ file, source: templateDir });
  }

  // Add common files based on feature flags
  for (const file of commonFiles) {
    // Skip ESLint files if ESLint is disabled
    if (file.includes('_eslint') && !useEslint) continue;

    // Skip Prettier files if Prettier is disabled
    if ((file === '_prettierrc.json' || file === '_prettierignore') && !usePrettier) continue;

    // Skip env file if env is disabled
    if (file === '_env' && !useEnv) continue;

    // Skip gitignore if git is disabled
    if (file === '_gitignore' && !useGit) continue;

    // Choose the right ESLint config based on Prettier usage
    if (file === '_eslint.config.js' && useEslint && usePrettier) continue; // Skip basic ESLint config when using Prettier
    if (file === '_eslint.prettier.config.js' && (!useEslint || !usePrettier)) continue; // Skip Prettier ESLint config when not using both

    filesToCopy.push({ file, source: commonDir });
  }

  // Copy files
  for (const { file, source } of filesToCopy) {
    const srcFile = path.join(source, file);
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

  // Install dependencies

  const dependencies = [];
  const devDependencies = ['typescript', 'tsx', '@types/node'];

  // Add template-specific dependencies
  if (selectedTemplate === 'express') {
    dependencies.push('express', 'cors', 'helmet', 'morgan');
    devDependencies.push('@types/express', '@types/cors', '@types/morgan');
  } else if (selectedTemplate === 'fastify') {
    dependencies.push('fastify', '@fastify/cors', '@fastify/helmet', '@fastify/swagger', '@fastify/swagger-ui');
  }

  // Add feature-specific dependencies
  if (useEslint) devDependencies.push('eslint', '@eslint/js', '@typescript-eslint/eslint-plugin', '@typescript-eslint/parser');
  if (usePrettier) devDependencies.push('prettier');
  if (useEslint && usePrettier) devDependencies.push('eslint-plugin-prettier', 'eslint-config-prettier');
  if (useEnv) dependencies.push('dotenv');

  const totalDependencies = dependencies.length + devDependencies.length;
  prompts.log.step(`Installing ${totalDependencies} dependencies using ${packageManager}...`);

  const s = prompts.spinner();
  s.start(`Downloading packages...`);
  try {
    // Install regular dependencies first (if any)
    if (dependencies.length > 0) {
      const dependenciesStr = dependencies.join(' ');
      switch (packageManager) {
        case 'bun':
          execSync(`bun add ${dependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
          break;
        case 'pnpm':
          execSync(`pnpm add ${dependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
          break;
        case 'yarn':
          execSync(`yarn add ${dependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
          break;
        default:
          execSync(`npm install ${dependenciesStr} --silent`, { cwd: root, stdio: 'pipe' });
      }
    }

    // Install dev dependencies
    const devDependenciesStr = devDependencies.join(' ');
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
    const installCommand = packageManager === 'npm' ? 'install' : 'add';
    const devInstallCommand = packageManager === 'npm' ? 'install -D' : 'add -D';
    if (dependencies.length > 0) {
      prompts.log.error(`You can run \`${packageManager} ${installCommand} ${dependencies.join(' ')}\` manually.`);
    }
    prompts.log.error(`You can run \`${packageManager} ${devInstallCommand} ${devDependencies.join(' ')}\` manually.`);
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
