import fs from 'node:fs';
import path from 'node:path';

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
