import { cac } from 'cac';

import pkg from '../package.json';

export interface CliOptions {
  overwrite?: boolean;
  interactive?: boolean;
  template?: string;
  lint?: boolean;
  format?: boolean;
  git?: boolean;
  gitCommit?: boolean;
  ci?: boolean;
  docker?: boolean;
  env?: boolean;
  install?: boolean;
  yes?: boolean;
  dryRun?: boolean;
  packageManager?: string;
  scope?: string;
  author?: string;
  license?: boolean;
  completion?: string;
  listTemplates?: boolean;
  help?: boolean;
  version?: boolean;
}

export interface ParsedCli {
  args: string[];
  options: CliOptions;
}

const cli = cac(pkg.name);

cli
  .usage('<project-directory> [options]')
  .version(pkg.version)
  .help()
  .option('-o, --overwrite', 'Overwrite the target directory without asking')
  .option('-i, --interactive', 'Prompt for every option instead of using defaults')
  .option('-y, --yes', 'Accept all defaults without prompting')
  .option('-n, --dry-run', 'Show what would be created without writing anything')
  .option('-t, --template <template>', 'Built-in template (basic, express, fastify) or a local directory')
  .option('-p, --package-manager <manager>', 'Package manager to use (npm, pnpm, yarn, bun)')
  .option('-s, --scope <scope>', 'Publish the generated package under an npm scope')
  .option('--completion <shell>', 'Print a completion script (bash, zsh, fish)')
  .option('--list-templates', 'List the built-in templates')
  .option('--license', 'Generate a MIT LICENSE file')
  .option('--author <name>', 'Author used in the generated LICENSE')
  .option('-l, --lint', 'Include Oxlint configuration (default: on)')
  .option('-f, --format', 'Include Oxfmt configuration (default: on)')
  .option('--git', 'Initialize a Git repository (default: on)')
  .option('--git-commit', 'Create an initial commit (default: on)')
  .option('--ci', 'Generate a GitHub Actions workflow')
  .option('--docker', 'Generate a multi-stage Dockerfile and .dockerignore')
  .option('--env', 'Create a .env file (default: on)')
  .option('--install', 'Install dependencies (default: on)')
  .example('create-tsx-app my-app')
  .example('create-tsx-app my-app --template express')
  .example('create-tsx-app my-app --interactive')
  .example('create-tsx-app my-app --no-lint --no-format --no-install');

const parsed = cli.parse();

if (parsed.options.help || parsed.options.version) {
  // `cac` has already printed the help/version text.
  process.exit(0);
}

export default parsed as ParsedCli;
