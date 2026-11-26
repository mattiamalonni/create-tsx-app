export const SHELLS = ['bash', 'zsh', 'fish'] as const;
export type Shell = (typeof SHELLS)[number];

export function isShell(value: string): value is Shell {
  return (SHELLS as readonly string[]).includes(value);
}

const OPTIONS = [
  'help',
  'version',
  'template',
  'interactive',
  'yes',
  'dry-run',
  'overwrite',
  'package-manager',
  'scope',
  'lint',
  'format',
  'git',
  'git-commit',
  'ci',
  'docker',
  'env',
  'install',
] as const;

export function completionScript(shell: Shell, name = 'create-tsx-app'): string {
  if (shell === 'bash') {
    const flags = OPTIONS.map((option) => `--${option}`).concat(
      OPTIONS.filter((option) => ['lint', 'format', 'git', 'git-commit', 'ci', 'docker', 'env', 'install'].includes(option)).map(
        (option) => `--no-${option}`,
      ),
    );
    return `_${name.replace(/-/g, '_')}() {
  local cur="\${COMP_WORDS[COMP_CWORD]}"
  local flags="${flags.join(' ')}"
  COMPREPLY=( $(compgen -W "$flags" -- "$cur") )
}
complete -F _${name.replace(/-/g, '_')} ${name}
`;
  }

  if (shell === 'zsh') {
    const lines = OPTIONS.map((option) => {
      const needsValue = ['template', 'package-manager', 'scope'].includes(option);
      const values =
        option === 'template'
          ? ':template:(basic express fastify)'
          : option === 'package-manager'
            ? ':manager:(npm pnpm yarn bun)'
            : needsValue
              ? ':value:'
              : '';
      return `  '--${option}=[${option}]${values}'`;
    });
    const negated = ['lint', 'format', 'git', 'git-commit', 'ci', 'docker', 'env', 'install'].map(
      (option) => `  '--no-${option}[disable ${option}]'`,
    );
    return `#compdef ${name}
_arguments -s \\
${[...lines, ...negated].join(' \\\n')} \\
  '*:project directory:'
`;
  }

  const lines = [
    `complete -c ${name} -f`,
    ...OPTIONS.map((option) => {
      if (option === 'template') return `complete -c ${name} -l template -r -a 'basic express fastify'`;
      if (option === 'package-manager') return `complete -c ${name} -l package-manager -r -a 'npm pnpm yarn bun'`;
      if (option === 'scope') return `complete -c ${name} -l scope -r`;
      return `complete -c ${name} -l ${option}`;
    }),
    ...['lint', 'format', 'git', 'git-commit', 'ci', 'docker', 'env', 'install'].map((option) => `complete -c ${name} -l no-${option}`),
  ];
  return `${lines.join('\n')}\n`;
}
