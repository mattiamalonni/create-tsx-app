# create-tsx-app

> Scaffold a production-ready TypeScript project with [tsx](https://tsx.is/) in seconds — zero configuration, strict defaults, and three opinionated templates.

```bash
npx create-tsx-app@latest my-app
```

## Why

- **Runs immediately** — `tsx watch` gives you instant TypeScript execution, no build step in development.
- **Real production builds** — the generated `tsc` output is native ESM that Node runs with `node dist/index.js`.
- **Strict by default** — strict TypeScript plus [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter.html), configured with tiny `.config.ts` files.
- **Your package manager** — auto-detected from the environment; npm is the default, and `--package-manager` can force another one.
- **No lock-in** — everything generated is plain source and config you can edit freely.

## Templates

| Template  | Use case                    | Includes                                                  |
| --------- | --------------------------- | --------------------------------------------------------- |
| `basic`   | CLIs, scripts, utilities    | `src/index.ts`, strict tsconfig                           |
| `express` | REST APIs with Express 5    | CORS, Helmet, Morgan, health check, `/api/users` example  |
| `fastify` | Fast REST APIs with OpenAPI | CORS, Helmet, Swagger UI at `/docs`, `/api/users` example |

```bash
npx create-tsx-app@latest my-cli --template basic
npx create-tsx-app@latest my-api --template express
npx create-tsx-app@latest my-api --template fastify
npx create-tsx-app@latest --list-templates
```

A local directory containing `package.json` and `src/index.ts` can be used as a template: `--template ./my-template`. Its own dependencies are preserved.

## Options

| Flag                       | Alias | Description                                           | Default       |
| -------------------------- | ----- | ----------------------------------------------------- | ------------- |
| `--template <name>`        | `-t`  | Built-in template or local template directory         | `basic`       |
| `--package-manager <name>` | `-p`  | `npm`, `pnpm`, `yarn` or `bun`                        | auto-detected |
| `--interactive`            | `-i`  | Prompt for template, features and package manager     | off           |
| `--yes`                    | `-y`  | Accept defaults and never prompt                      | off           |
| `--overwrite`              | `-o`  | Overwrite a non-empty target directory (keeps `.git`) | off           |
| `--lint`                   | `-l`  | Add Oxlint                                            | on            |
| `--format`                 | `-f`  | Add Oxfmt                                             | on            |
| `--git`                    |       | Initialize a Git repository                           | on            |
| `--git-commit`             |       | Create an initial commit                              | on            |
| `--env`                    |       | Create `.env` and `.env.example`, load `dotenv`       | on            |
| `--install`                |       | Run the package manager install                       | on            |
| `--ci`                     |       | Generate a GitHub Actions workflow                    | off           |
| `--docker`                 |       | Generate a multi-stage Dockerfile and `.dockerignore` | off           |
| `--license`                |       | Generate an MIT LICENSE                               | off           |
| `--author <name>`          |       | Author used in LICENSE                                | `Your Name`   |
| `--scope <scope>`          | `-s`  | Publish as `@scope/name`                              | off           |
| `--dry-run`                | `-n`  | List the files that would be created                  | off           |
| `--completion <shell>`     |       | Print a `bash`, `zsh` or `fish` completion script     |               |
| `--list-templates`         |       | List built-in templates                               |               |
| `--version`                | `-v`  | Print the CLI version                                 |               |
| `--help`                   | `-h`  | Print usage                                           |               |

Every boolean option supports its negated form, e.g. `--no-lint`, `--no-format`, `--no-git`, `--no-install`.

```bash
# Minimal TypeScript-only project, no install
npx create-tsx-app@latest my-util --no-lint --no-format --no-git --no-env --no-install

# Guided setup, scoped package, CI and Docker
npx create-tsx-app@latest my-api -i --scope acme --ci --docker

# Preview without writing anything
npx create-tsx-app@latest my-api --template express --dry-run

# Shell completion
source <(npx create-tsx-app@latest --completion bash)
```

## Team defaults

Drop a `create-tsx-app.config.ts` (or `.config.mts`) in the directory where you run the CLI. CLI flags always win over config values:

```ts
export default {
  template: 'express',
  scope: 'acme',
  lint: true,
  format: true,
  git: true,
  ci: true,
};
```

## What you get

```
my-app/
├── src/
│   ├── index.ts          # entry point
│   └── env.ts            # loads dotenv, or a no-op when --no-env
├── package.json          # scripts + version ranges, sorted for Oxfmt
├── tsconfig.json         # strict, NodeNext, emits ESM to dist/
├── oxlint.config.ts      # only with --lint
├── oxfmt.config.ts       # only with --format
├── .github/workflows/ci.yml  # only with --ci
├── Dockerfile            # only with --docker
├── LICENSE               # only with --license
├── .env / .env.example   # only with --env
└── .gitignore            # only with --git
```

Generated scripts:

| Script                    | Command                               | Purpose                     |
| ------------------------- | ------------------------------------- | --------------------------- |
| `dev`                     | `tsx watch src/index.ts`              | Development with hot reload |
| `build`                   | `tsc`                                 | Emit `dist/`                |
| `start`                   | `node dist/index.js`                  | Run the production build    |
| `type-check`              | `tsc --noEmit`                        | Types only                  |
| `lint` / `lint:fix`       | `oxlint src` / `oxlint src --fix`     | Lint (when enabled)         |
| `format` / `format:check` | `oxfmt --write .` / `oxfmt --check .` | Format (when enabled)       |

## Requirements

- Node.js **>= 22.18** (required to execute the `.config.ts` files; see `.node-version`)
- npm — or another supported package manager if you opt into dependency installation

## Development

This repository uses **npm** exclusively. Oxlint/Oxfmt replace ESLint/Prettier.

```bash
git clone https://github.com/mattiamalonni/create-tsx-app.git
cd create-tsx-app
npm install
npm run check          # type-check + lint + format + build + tests
npm run dev -- /tmp/demo --template express --no-install
```

Tests use Node's built-in test runner and exercise both helpers and the published CLI entry point. CI scaffolds every template, installs its dependencies, and verifies type-check, lint, formatting, build and startup.

## Contributing

Issues and pull requests are welcome. For larger changes, open an issue first so the design can be discussed.

## License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

[GitHub](https://github.com/mattiamalonni/create-tsx-app) · [npm](https://www.npmjs.com/package/create-tsx-app) · [Issues](https://github.com/mattiamalonni/create-tsx-app/issues)
