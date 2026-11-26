import { execFileSync } from 'node:child_process';

import * as prompts from '@clack/prompts';

import type { Answers } from './prompts';
import type { PackageManager } from './utils';

const INSTALL_ARGS: Record<PackageManager, string[]> = {
  npm: ['install', '--no-audit', '--no-fund'],
  pnpm: ['install'],
  yarn: ['install'],
  bun: ['install'],
};

function describeError(error: unknown): string {
  if (error instanceof Error && 'stderr' in error && Buffer.isBuffer(error.stderr)) {
    return error.stderr.toString('utf-8').trim() || error.message;
  }
  return error instanceof Error ? error.message : 'Unknown error';
}

export function installDependencies({ root, packageManager }: Answers): boolean {
  const spinner = prompts.spinner();
  spinner.start(`Installing dependencies with ${packageManager}...`);

  try {
    execFileSync(packageManager, INSTALL_ARGS[packageManager], { cwd: root, stdio: 'pipe' });
    spinner.stop('Dependencies installed.');
    return true;
  } catch (error) {
    spinner.stop('Could not install dependencies.');
    prompts.log.error(describeError(error));
    prompts.log.info(`Run \`${packageManager} install\` in the project directory to retry.`);
    return false;
  }
}

export function initGit(root: string, commit = true): boolean {
  try {
    execFileSync('git', ['init', '--quiet'], { cwd: root, stdio: 'pipe' });
    if (commit) {
      execFileSync('git', ['add', '.'], { cwd: root, stdio: 'pipe' });
      execFileSync('git', ['-c', 'user.name=create-tsx-app', '-c', 'user.email=create-tsx-app@local', 'commit', '--quiet', '-m', 'Initial commit'], {
        cwd: root,
        stdio: 'pipe',
      });
    }
    return true;
  } catch (error) {
    prompts.log.warn(`Could not create the initial commit: ${describeError(error)}`);
    prompts.log.info('Run `git init && git add . && git commit` manually if needed.');
    return false;
  }
}
