import * as prompts from '@clack/prompts';

import cli from './cli';
import { completionScript, isShell, SHELLS } from './completion';
import { TEMPLATE_DESCRIPTIONS } from './config';
import { VALID_TEMPLATES } from './validations';
import { initGit, installDependencies } from './install';
import { collectAnswers } from './prompts';
import { createPlan, scaffold } from './scaffold';
import { detectPackageManager } from './utils';
import { loadUserConfig } from './user-config';
import { validateNodeVersion } from './validations';

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown error';
}

async function init(): Promise<void> {
  if (cli.options.completion !== undefined) {
    if (!isShell(cli.options.completion)) {
      console.error(`Unsupported shell "${cli.options.completion}". Available: ${SHELLS.join(', ')}.`);
      process.exit(1);
    }
    process.stdout.write(completionScript(cli.options.completion));
    return;
  }

  if (cli.options.listTemplates) {
    for (const template of VALID_TEMPLATES) {
      console.log(`${template.padEnd(9)} ${TEMPLATE_DESCRIPTIONS[template]}`);
    }
    console.log('\nUse --template <name> or pass a path to a local template directory.');
    return;
  }

  const node = validateNodeVersion();
  if (!node.isValid) {
    prompts.log.error(`Node.js >= ${node.requiredVersion} is required (found ${node.currentVersion}). Update it at https://nodejs.org/`);
    process.exit(1);
  }

  prompts.intro('create-tsx-app — scaffold a TypeScript project in seconds');

  const config = await loadUserConfig(process.cwd());
  const answers = await collectAnswers(cli, detectPackageManager(), config);
  const { targetDir, template, features, packageManager } = answers;

  prompts.log.step(`${cli.options.dryRun ? 'Previewing' : 'Creating'} ${targetDir} (${template} template)...`);
  try {
    if (cli.options.dryRun) {
      const plan = createPlan(answers);
      for (const file of plan) prompts.log.info(`  ${file.path}`);
      prompts.outro(`Dry run: ${plan.length} files would be created in ${targetDir}. Nothing was written.`);
      return;
    }
    scaffold(answers);
  } catch (error) {
    prompts.log.error(`Scaffolding failed: ${describeError(error)}`);
    process.exit(1);
  }

  prompts.log.info(
    `Template: ${template} · package manager: ${packageManager} · Oxlint ${features.lint ? 'on' : 'off'} · Oxfmt ${features.format ? 'on' : 'off'} · CI ${features.ci ? 'on' : 'off'} · Docker ${features.docker ? 'on' : 'off'} · license ${features.license ? 'on' : 'off'} · .env ${features.env ? 'on' : 'off'}`,
  );

  const dependenciesReady = features.install ? installDependencies(answers) : false;
  if (!features.install) {
    prompts.log.info(`Dependency installation skipped. Run \`${packageManager} install\` in ${targetDir} when ready.`);
  }

  if (features.git) initGit(answers.root, features.gitCommit);

  const nextSteps = dependenciesReady
    ? `  1. cd ${targetDir}\n  2. ${packageManager} run dev\n  3. ${packageManager} run build`
    : `  1. cd ${targetDir}\n  2. ${packageManager} install\n  3. ${packageManager} run dev`;

  prompts.outro(`Project created in ${targetDir}.

Next steps:
${nextSteps}

Happy coding!`);
}

init().catch((error) => {
  console.error(error);
  process.exit(1);
});
