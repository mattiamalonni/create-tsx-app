import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

export const PACKAGE_MANAGERS = ['npm', 'pnpm', 'yarn', 'bun'] as const;
export type PackageManager = (typeof PACKAGE_MANAGERS)[number];

export function formatTargetDir(targetDir: string): string {
  return targetDir.trim().replace(/\/+$/g, '');
}

export function toValidPackageName(projectName?: string, projectDir?: string): string {
  const name = projectName || path.basename(path.resolve(projectDir ?? process.cwd()));

  return (
    name
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/^[._-]+/, '')
      .replace(/[^a-z\d\-._~]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/[._~]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 214) || 'tsx-app'
  );
}

export function copy(src: string, dest: string): void {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

export function copyDir(srcDir: string, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    copy(path.resolve(srcDir, file), path.resolve(destDir, file));
  }
}

export function isDirEmpty(dir: string): boolean {
  if (!fs.existsSync(dir)) return true;
  const files = fs.readdirSync(dir);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

export function emptyDir(dir: string): void {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    // Preserve an existing repository when the user asks to overwrite.
    if (file === '.git') continue;
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

export function writeFile(file: string, content: string): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
}

/** Returns the first available package manager hinted by the environment. */
export function detectPackageManager(): PackageManager {
  const hints = [
    process.env.npm_execpath,
    process.env.npm_config_user_agent,
    process.env.BUN_INSTALL ? 'bun' : undefined,
    process.env.PNPM_HOME ? 'pnpm' : undefined,
    process.argv[0],
    process.argv[1],
  ]
    .filter((value): value is string => Boolean(value))
    .join(' ')
    .toLowerCase();

  const candidates: PackageManager[] = [...PACKAGE_MANAGERS.filter((manager) => hints.includes(manager)), ...PACKAGE_MANAGERS];

  return candidates.find(isPackageManagerInstalled) ?? 'npm';
}

export function isPackageManagerInstalled(manager: string): boolean {
  try {
    execFileSync(manager, ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function isGitInstalled(): boolean {
  try {
    execFileSync('git', ['--version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
