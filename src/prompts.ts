import path from 'node:path';

import * as prompts from '@clack/prompts';

import type { ParsedCli } from './cli';
import type { FeatureOptions } from './config';
import type { UserConfig } from './user-config';
import {
  formatTargetDir,
  isDirEmpty,
  isGitInstalled,
  isPackageManagerInstalled,
  PACKAGE_MANAGERS,
  toValidPackageName,
  type PackageManager,
} from './utils';
import { isValidPackageName, VALID_TEMPLATES } from './validations';

export interface Answers {
  targetDir: string;
  root: string;
  packageName: string;
  template: string;
  overwrite: boolean;
  features: FeatureOptions;
  packageManager: PackageManager;
  author: string;
}

const DEFAULT_TARGET_DIR = 'tsx-app';

function cancel(): never {
  prompts.cancel('Operation cancelled.');
  process.exit(0);
}

function fail(message: string): never {
  prompts.log.error(message);
  process.exit(1);
}

function assertPackageManager(value: string | undefined): PackageManager | undefined {
  if (value === undefined) return undefined;
  if (!PACKAGE_MANAGERS.includes(value as PackageManager)) {
    fail(`Invalid package manager "${value}". Available: ${PACKAGE_MANAGERS.join(', ')}.`);
  }
  if (!isPackageManagerInstalled(value)) fail(`Package manager "${value}" is not installed.`);
  return value as PackageManager;
}

export async function collectAnswers(cli: ParsedCli, detectedPackageManager: PackageManager, config: UserConfig = {}): Promise<Answers> {
  const { args, options } = cli;
  const interactive = Boolean(options.interactive) && !options.yes;
  const canPrompt = Boolean(process.stdin.isTTY) && !options.yes;

  if (options.interactive && !canPrompt) {
    prompts.log.warn('Interactive mode requires a TTY. Falling back to non-interactive defaults.');
  }

  let targetDir = args[0] ? formatTargetDir(args[0]) : '';
  if (!targetDir && canPrompt) {
    const answer = await prompts.text({ message: 'Project directory:', defaultValue: DEFAULT_TARGET_DIR, placeholder: DEFAULT_TARGET_DIR });
    if (prompts.isCancel(answer)) cancel();
    targetDir = formatTargetDir(answer);
  }
  if (!targetDir) fail('Missing project directory. Usage: create-tsx-app <project-directory>');

  const root = path.isAbsolute(targetDir) ? path.resolve(targetDir) : path.resolve(process.cwd(), targetDir);
  if (root === path.parse(root).root) fail('Refusing to scaffold in the filesystem root.');

  let overwrite = Boolean(options.overwrite ?? config.overwrite);
  if (!isDirEmpty(root) && !overwrite) {
    if (!canPrompt) fail(`Target directory "${targetDir}" is not empty. Remove it or pass --overwrite.`);

    const answer = await prompts.select({
      message: `Target "${targetDir}" is not empty. What should we do?`,
      options: [
        { value: 'no', label: 'Cancel', hint: 'Leave the directory untouched' },
        { value: 'yes', label: 'Overwrite', hint: 'Remove existing files (except .git) and continue' },
        { value: 'ignore', label: 'Keep files', hint: 'Scaffold alongside existing files' },
      ],
      initialValue: 'no',
    });
    if (prompts.isCancel(answer)) cancel();
    if (answer === 'no') {
      prompts.outro('Nothing changed.');
      process.exit(0);
    }
    overwrite = answer === 'yes';
  }

  const requestedScope = options.scope ?? config.scope;
  const scopePattern = /^@?[a-z\d][a-z\d\-._~]*$/;
  if (requestedScope !== undefined && !scopePattern.test(requestedScope)) {
    fail(`Invalid scope "${requestedScope}". Use lowercase letters, digits, dashes, dots or underscores.`);
  }
  const scope = requestedScope ? `@${requestedScope.replace(/^@/, '')}` : '';
  let packageName = `${scope}/${toValidPackageName(path.basename(root))}`.replace(/^\//, '');
  if (!isValidPackageName(packageName) && canPrompt) {
    const answer = await prompts.text({
      message: 'Package name:',
      defaultValue: packageName,
      validate: (value) => (value && isValidPackageName(value) ? undefined : 'Invalid npm package name.'),
    });
    if (prompts.isCancel(answer)) cancel();
    packageName = answer;
  }

  const requestedTemplate = options.template ?? config.template;
  let template: string;
  if (interactive) {
    const answer = await prompts.select({
      message: 'Choose a template:',
      options: VALID_TEMPLATES.map((value) => ({ value, label: value })),
      initialValue: requestedTemplate ?? 'basic',
    });
    if (prompts.isCancel(answer)) cancel();
    template = answer;
  } else {
    template = requestedTemplate ?? 'basic';
  }

  const gitAvailable = isGitInstalled();
  if (!gitAvailable && options.git !== false) prompts.log.warn('Git is not installed; repository initialization will be skipped.');

  const confirm = async (message: string, initialValue: boolean): Promise<boolean> => {
    if (!interactive) return initialValue;
    const answer = await prompts.confirm({ message, initialValue });
    if (prompts.isCancel(answer)) cancel();
    return answer;
  };

  const features: FeatureOptions = {
    lint: await confirm('Add Oxlint?', options.lint ?? config.lint ?? true),
    format: await confirm('Add Oxfmt?', options.format ?? config.format ?? true),
    git: gitAvailable && (await confirm('Initialize a Git repository?', options.git ?? config.git ?? true)),
    gitCommit: options.gitCommit ?? config.gitCommit ?? true,
    ci: await confirm('Add GitHub Actions CI?', options.ci ?? config.ci ?? false),
    docker: await confirm('Add a Dockerfile?', options.docker ?? config.docker ?? false),
    env: await confirm('Create a .env file?', options.env ?? config.env ?? true),
    install: await confirm('Install dependencies?', options.install ?? config.install ?? true),
    license: await confirm('Add an MIT LICENSE?', options.license ?? config.license ?? false),
  };

  let packageManager = assertPackageManager(options.packageManager ?? config.packageManager) ?? detectedPackageManager;
  if (interactive) {
    const installed = PACKAGE_MANAGERS.filter(isPackageManagerInstalled);
    const answer = await prompts.select({
      message: 'Package manager:',
      options: installed.map((value) => ({ value, label: value })),
      initialValue: installed.includes(packageManager) ? packageManager : (installed[0] ?? packageManager),
    });
    if (prompts.isCancel(answer)) cancel();
    packageManager = answer as PackageManager;
  }

  const author = options.author ?? config.author ?? 'Your Name';
  return { targetDir, root, packageName, template, overwrite, features, packageManager, author };
}
