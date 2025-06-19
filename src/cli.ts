import { cac } from 'cac';

import pkg from '../package.json';

const cli = cac(pkg.name);

cli
  .version(pkg.version)
  .help()
  .option('-o, --overwrite', 'Overwrite existing directory without asking')
  .option('-i, --interactive', 'Enable interactive prompts (default: auto-setup with all features)')
  .option('--no-eslint', 'Skip ESLint configuration')
  .option('--no-prettier', 'Skip Prettier configuration')
  .option('--no-git', 'Skip Git repository initialization')
  .option('--no-env', 'Skip environment variables setup')
  .example('create-tsx-app my-app')
  .example('create-tsx-app my-app --interactive')
  .example('create-tsx-app my-app --no-eslint --no-prettier');

const parsed = cli.parse();

if (parsed.options.help || parsed.options.version) {
  // `cac` already prints help and version, just exit
  process.exit(0);
}

export default parsed;
