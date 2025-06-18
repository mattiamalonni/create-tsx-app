import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import mri from 'mri';
import * as prompts from '@clack/prompts';
import { emptyDir, formatTargetDir, isDirEmpty, isValidPackageName, toValidPackageName, writeFile, detectPackageManager } from './utils';

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

function showHelp() {
  console.log(`
create-tsx-app - Scaffold a new TypeScript project with tsx

Usage:
  create-tsx-app [project-name] [options]
  npm create tsx-app [project-name] [options]
  pnpm create tsx-app [project-name] [options]
  yarn create tsx-app [project-name] [options]
  bun create tsx-app [project-name] [options]

Arguments:
  project-name           The name of the project directory (default: ${defaultTargetDir})

Options:
  -h, --help            Show this help message
  -i, --install         Automatically install dependencies
  -o, --overwrite       Overwrite existing directory without asking

Examples:
  create-tsx-app my-app
  create-tsx-app my-app --install
  npm create tsx-app@latest my-project --install --overwrite
  pnpm create tsx-app my-project --install
  yarn create tsx-app my-project --install
  bun create tsx-app my-project --install

The tool will automatically detect which package manager you used to run it
and use the same one for installing dependencies.
`);
}

async function init() {
  // Handle help flag
  if (argv.help) {
    showHelp();
    return;
  }

  prompts.intro('Welcome to create-tsx-app! This tool will help you set up a new TypeScript project with tsx.');

  const packageManager = detectPackageManager();

  const argOverwrite = argv.overwrite;
  const argInstall = argv.install;

  let targetDir = argv._[0];

  if (!targetDir) {
    const _targetDir = await prompts.text({ message: 'App name:', defaultValue: defaultTargetDir, placeholder: defaultTargetDir });
    if (prompts.isCancel(_targetDir)) return cancel();
    targetDir = formatTargetDir(_targetDir as string);
  }

  // Validate targetDir

  if (!isDirEmpty(targetDir)) {
    const overwrite = argOverwrite
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

    switch (overwrite) {
      case 'yes':
        emptyDir(targetDir);
        break;
      case 'no':
        cancel();
        return;
      case 'ignore':
        // Continue without clearing
        break;
    }
  }

  // Ensure targetDir is a valid directory name

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

  // Create target directory

  const root = path.join(cwd, targetDir);
  fs.mkdirSync(root, { recursive: true });

  prompts.log.step(`Scaffolding project in ${root}...`);

  const templateDir = path.resolve(fileURLToPath(import.meta.url), '../..', `template`);

  // Validate template directory exists
  if (!fs.existsSync(templateDir)) {
    prompts.log.error('Template directory not found. Please reinstall create-tsx-app.');
    return;
  }

  // Validate package manager
  const validPackageManagers = ['npm', 'pnpm', 'yarn', 'bun'];
  if (!validPackageManagers.includes(packageManager)) {
    prompts.log.warn(`Unknown package manager: ${packageManager}. Falling back to npm.`);
  }

  const files = fs.readdirSync(templateDir).filter(f => f !== 'package.json');

  for (const file of files) {
    const srcFile = path.join(templateDir, file);
    const destFile = path.join(root, renameFiles[file] || file);

    try {
      const isDir = fs.statSync(srcFile).isDirectory();

      // Log the progress of each file or dir being copied
      prompts.log.step(`Copying ${isDir ? 'directory' : 'file'}: ${renameFiles[file] || file}`);

      writeFile(destFile, srcFile);
    } catch (error) {
      prompts.log.error(`Failed to copy ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return;
    }
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(templateDir, `package.json`), 'utf-8'));

  pkg.name = packageName;

  writeFile(path.join(root, 'package.json'), undefined, JSON.stringify(pkg, null, 2) + '\n');

  // Process README.md template if it exists
  const readmePath = path.join(templateDir, 'README.md');
  if (fs.existsSync(readmePath)) {
    let readmeContent = fs.readFileSync(readmePath, 'utf-8');
    readmeContent = readmeContent.replace(/\{\{PROJECT_NAME\}\}/g, packageName);
    fs.writeFileSync(path.join(root, 'README.md'), readmeContent);
  }

  // Installing dependencies

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
    try {
      prompts.log.step(`Installing dependencies using ${packageManager}...`);

      switch (packageManager) {
        case 'bun':
          execSync(`bun add -D typescript tsx`, { cwd: root, stdio: 'inherit' });
          break;
        case 'pnpm':
          execSync(`pnpm add -D typescript tsx`, { cwd: root, stdio: 'inherit' });
          break;
        case 'yarn':
          execSync(`yarn add -D typescript tsx`, { cwd: root, stdio: 'inherit' });
          break;
        default:
          execSync(`npm install -D typescript tsx`, { cwd: root, stdio: 'inherit' });
      }

      prompts.log.step('Dependencies installed successfully.');
    } catch (error) {
      const installCommand = packageManager === 'npm' ? 'install -D' : 'add -D';
      prompts.log.error(`Failed to install dependencies. You can run \`${packageManager} ${installCommand} typescript tsx\` manually.`);
    }
  } else {
    const installCommand = packageManager === 'npm' ? 'npm install -D typescript tsx' : `${packageManager} add -D typescript tsx`;
    prompts.log.info(`You can install dependencies later by running \`${installCommand}\` inside the project folder.`);
  }

  prompts.outro(`
✅ Project created successfully!

Next steps:
  1. Navigate to your project: cd ${targetDir}
  ${
    installDeps
      ? '2. Start developing: npm run dev'
      : `2. Install dependencies: ${packageManager === 'npm' ? 'npm install -D typescript tsx' : `${packageManager} add -D typescript tsx`}
  3. Start developing: npm run dev`
  }

Happy coding! 🚀
  `);
}

init().catch(console.error);
