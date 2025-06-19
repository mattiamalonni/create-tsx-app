import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

export function formatTargetDir(targetDir: string): string {
  return targetDir.trim().replace(/\/+$/g, '');
}

export function isValidPackageName(projectName: string): boolean {
  return /^(?:@[a-z\d\-*~][a-z\d\-*._~]*\/)?[a-z\d\-~][a-z\d\-._~]*$/.test(projectName);
}

export function toValidPackageName(projectName?: string, projectDir?: string): string {
  const name = projectName || path.basename(path.resolve(projectDir!));
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z\d\-~]+/g, '-');
}

export function copy(src: string, dest: string): void {
  const stat = fs.statSync(src);
  stat.isDirectory() ? copyDir(src, dest) : fs.copyFileSync(src, dest);
}

export function copyDir(srcDir: string, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

export function isDirEmpty(path: string): boolean {
  const dir = fs.existsSync(path);
  if (!dir) return true;
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

export function emptyDir(dir: string) {
  if (!fs.existsSync(dir)) return;
  for (const file of fs.readdirSync(dir)) {
    if (file === '.git') continue;
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

export function writeFile(file: string, srcFile?: string, content?: string): void {
  if (srcFile && file) return copy(srcFile, file);
  else if (file && content) fs.writeFileSync(file, content);
}

export function detectPackageManager(): string {
  const npmExecPath = process.env.npm_execpath;
  if (npmExecPath) {
    if (npmExecPath.includes('bun')) {
      return 'bun';
    }
    if (npmExecPath.includes('pnpm')) {
      return 'pnpm';
    }
    if (npmExecPath.includes('yarn')) {
      return 'yarn';
    }
    if (npmExecPath.includes('npm')) {
      return 'npm';
    }
  }

  const userAgent = process.env.npm_config_user_agent;
  if (userAgent) {
    if (userAgent.includes('bun')) {
      return 'bun';
    }
    if (userAgent.includes('pnpm')) {
      return 'pnpm';
    }
    if (userAgent.includes('yarn')) {
      return 'yarn';
    }
    if (userAgent.includes('npm')) {
      return 'npm';
    }
  }

  if (process.env.BUN_INSTALL) {
    return 'bun';
  }

  if (process.env.PNPM_HOME) {
    return 'pnpm';
  }

  const argv0 = process.argv[0];
  const argv1 = process.argv[1];

  if (argv0?.includes('bun') || argv1?.includes('bun')) {
    return 'bun';
  }
  if (argv0?.includes('pnpm') || argv1?.includes('pnpm')) {
    return 'pnpm';
  }
  if (argv0?.includes('yarn') || argv1?.includes('yarn')) {
    return 'yarn';
  }

  return 'npm';
}

export function validateNodeVersion(): { isValid: boolean; currentVersion: string; requiredVersion: string } {
  const currentVersion = process.version;
  const requiredVersion = '18.0.0';

  // Parse version numbers
  const parseVersion = (version: string) => {
    const cleaned = version.replace(/^v/, '');
    return cleaned.split('.').map(num => parseInt(num, 10));
  };

  const current = parseVersion(currentVersion);
  const required = parseVersion(requiredVersion);

  // Compare major version first
  if (current[0] > required[0]) return { isValid: true, currentVersion, requiredVersion };
  if (current[0] < required[0]) return { isValid: false, currentVersion, requiredVersion };

  // Same major version, compare minor
  if (current[1] > required[1]) return { isValid: true, currentVersion, requiredVersion };
  if (current[1] < required[1]) return { isValid: false, currentVersion, requiredVersion };

  // Same major and minor, compare patch
  return {
    isValid: current[2] >= required[2],
    currentVersion,
    requiredVersion,
  };
}

export function isGitInstalled(): boolean {
  try {
    execSync('git --version', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

export function isPackageManagerInstalled(manager: string): boolean {
  try {
    execSync(`${manager} --version`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}
