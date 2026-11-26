# Changelog

## 5.2.0

- **CLI**: resolves every generated dependency from the npm registry at scaffold time, so projects created months after a release use current versions.
- **CLI**: `--offline` keeps the bundled version ranges and skips all network lookups; failed lookups fall back per package with a warning.
- **Verification**: 26 tests, including a local mock registry for version resolution.

## 5.1.0

- **CLI**: `--dry-run` previews every file without touching disk (scaffolding now builds an explicit file plan).
- **CLI**: `create-tsx-app.config.ts` / `.config.mts` provide team defaults; CLI flags override them.
- **CLI**: local template directories are accepted via `--template ./path`.
- **CLI**: new optional generators — `--ci`, `--docker`, `--license` with `--author`.
- **CLI**: `--scope` for `@org/app` package names, `--no-git-commit` for init-only repositories.
- **CLI**: `--completion bash|zsh|fish` and `--list-templates`.
- **Verification**: 24 automated tests covering the new flags and config precedence.

## 5.0.0

- **Tooling**: npm replaces pnpm as the repository package manager; `package-lock.json` replaces `pnpm-lock.yaml`.
- **Tooling**: Oxlint and Oxfmt replace ESLint and Prettier, with minimal `oxlint.config.ts` and `oxfmt.config.ts` files.
- **CLI**: `--eslint`/`--prettier` become `--lint`/`--format` (`-l`/`-f`); generated projects ship Oxc configs and scripts.
- **CLI**: Node.js >= 22.18 is required so TypeScript config files can run natively.
- **Templates**: generated `package.json` is emitted in Oxfmt's canonical order; all templates verified with Oxlint/Oxfmt.

## 4.0.0

- **CLI**: modular architecture with separate validation, prompting, scaffolding and installation steps.
- **CLI**: added `--yes`, `--package-manager`, `--no-install`, non-interactive safety checks and a detected-package-manager summary.
- **CLI**: safe package-manager detection with fallback; dependencies are now written to `package.json` and installed in one pass.
- **CLI**: requires Node.js >= 20.19; all dependencies upgraded (cac 7, @clack/prompts 1, unbuild 3.6, ESLint 9, TypeScript 5.9).
- **Templates**: removed `@ts-nocheck`; every template type-checks under a strict NodeNext configuration and builds to runnable native ESM.
- **Templates**: fixed Express 5 404 handling, added graceful shutdown, typed examples, `.env.example`, project READMEs and modern flat ESLint config.
- **Tooling**: Node test suite for helpers and the CLI, GitHub Actions CI for all templates, Dependabot, EditorConfig, LICENSE.
- **Docs**: rewritten README with accurate options, generated file tree and scripts.
