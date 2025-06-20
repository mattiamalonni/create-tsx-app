import { cac } from 'cac';

import pkg from '../package.json';

const cli = cac(pkg.name);

cli
  .version(pkg.version)
  .help()
  .option('-o, --overwrite', 'Overwrite existing directory without asking')
  .option('-i, --interactive', 'Enable interactive prompts (default: auto-setup with all features)')
  .option('-t, --template <template>', 'Template to use (basic, express, fastify)', { default: 'basic' })
  .option('--eslint', 'Include ESLint configuration (default: true)', { default: true })
  .option('--prettier', 'Include Prettier configuration (default: true)', { default: true })
  .option('--git', 'Initialize Git repository (default: true)', { default: true })
  .option('--env', 'Setup environment variables (default: true)', { default: true })
  .example('create-tsx-app my-app')
  .example('create-tsx-app my-app --template express')
  .example('create-tsx-app my-app --template fastify --interactive')
  .example('create-tsx-app my-app --no-eslint --no-prettier');

const parsed = cli.parse();

if (parsed.options.help || parsed.options.version) {
  // `cac` already prints help and version, just exit
  process.exit(0);
}

export default parsed;
