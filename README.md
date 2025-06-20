# create-tsx-app

> Create production-ready TypeScript projects in seconds with zero configuration and all modern tools included by default.

## Quick Start

```bash
npm create tsx-app@latest my-app
# or
pnpm create tsx-app@latest my-app
# or
yarn create tsx-app my-app
# or
bun create tsx-app my-app
```

## ✨ Features

- 🚀 **Zero Config** - Ready to code immediately with all tools enabled by default
- 📦 **Smart Package Manager Detection** - Uses npm, pnpm, yarn, or bun automatically
- 🎯 **Interactive or Silent Mode** - Choose your setup style
- ⚡ **Fast Development** - Pre-configured with tsx for instant TypeScript execution
- 🧹 **Clean Structure** - Minimal boilerplate, maximum productivity
- 🔍 **Intelligent Validation** - Project name validation and directory handling
- 🛡️ **ESLint Ready** - Modern ESLint 9 with TypeScript support (flat config)
- 💅 **Prettier Integration** - Code formatting with ESLint compatibility
- 📦 **Git Initialization** - Repository setup with initial commit
- 🌍 **Environment Variables** - `.env` file support with tsx native integration
- 🔧 **Auto-Install** - Dependencies are automatically installed

## Usage

### Default Behavior (Recommended)

By default, `create-tsx-app` sets up a complete development environment with all modern tools:

```bash
npm create tsx-app@latest my-project
```

This creates a project with:

- ✅ ESLint configuration
- ✅ Prettier formatting
- ✅ Git repository with initial commit
- ✅ Environment variables support
- ✅ All dependencies auto-installed

### Interactive Mode

Want to choose what to include? Use the interactive flag:

```bash
npm create tsx-app@latest my-project --interactive
```

You'll be prompted to choose:

- Add ESLint for code linting?
- Add Prettier for code formatting?
- Initialize Git repository?
- Setup environment variables (.env file)?

### Minimal Setup

Prefer a minimal setup? Disable features with `--no-*` flags:

```bash
# Minimal TypeScript-only setup
npm create tsx-app@latest my-project --no-eslint --no-prettier --no-git --no-env

# Just TypeScript + ESLint (no formatting, git, or env)
npm create tsx-app@latest my-project --no-prettier --no-git --no-env

# Skip only Git and environment variables
npm create tsx-app@latest my-project --no-git --no-env
```

### Command Options

| Flag            | Alias | Description                                      |
| --------------- | ----- | ------------------------------------------------ |
| `--interactive` | `-i`  | Enable interactive prompts for feature selection |
| `--overwrite`   | `-o`  | Overwrite existing directory without asking      |
| `--no-eslint`   |       | Skip ESLint configuration                        |
| `--no-prettier` |       | Skip Prettier configuration                      |
| `--no-git`      |       | Skip Git repository initialization               |
| `--no-env`      |       | Skip environment variables setup                 |
| `--version`     | `-v`  | Display version number                           |
| `--help`        | `-h`  | Show help message                                |

### All Package Managers Supported

```bash
# npm
npm create tsx-app@latest my-app
npx create-tsx-app@latest my-app

# pnpm
pnpm create tsx-app@latest my-app
pnpm dlx create-tsx-app@latest my-app

# yarn
yarn create tsx-app my-app
yarn dlx create-tsx-app my-app

# bun
bun create tsx-app my-app
```

## 🔧 What You Get

### Full Setup (Default)

Your new project includes everything you need:

```
my-app/
├── src/
│   └── index.ts           # Entry point with example code
├── .env                   # Environment variables
├── .git/                  # Git repository with initial commit
├── .gitignore             # Node.js gitignore
├── eslint.config.js       # Modern ESLint flat config
├── .prettierrc.json       # Prettier configuration
├── package.json           # All dependencies included
├── tsconfig.json          # Optimized TypeScript config
└── README.md              # Getting started guide
```

### Ready-to-Use Commands

```bash
cd my-app

# Development (with auto-reload and env variables)
npm run dev

# Production execution (with env variables)
npm run start

# Build for production
npm run build

# Type checking
npm run type-check

# Code linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
npm run format:check

# Clean build artifacts
npm run clean
```

## 🎯 Smart Features

### Environment Variables Support

- 📁 **`.env` file** - Pre-configured environment variables
- 🔌 **tsx integration** - Uses tsx's native `dotenv/config` support
- 🚀 **Zero dependencies** - No extra packages needed beyond `dotenv`
- ⚡ **Auto-loaded** - Available in both `dev` and `start` commands

Example `.env` file created:

```env
NODE_ENV=development
PORT=3000
```

Access in your code:

```typescript
console.log(process.env.NODE_ENV); // "development"
console.log(process.env.PORT); // "3000"
```

### ESLint Integration

- 🛡️ **Modern ESLint 9** - Latest ESLint with flat config format
- ⚙️ **Pre-configured** - TypeScript rules and best practices
- 💅 **Prettier compatible** - Works seamlessly with Prettier formatting
- 📦 **Auto-installation** - All necessary packages included automatically
- 🔧 **Ready scripts** - `lint` and `lint:fix` commands pre-configured

### Prettier Integration

- 💅 **Code formatting** - Consistent code style across your project
- ⚙️ **ESLint integration** - Configured to work with ESLint without conflicts
- 🔧 **Ready scripts** - `format` and `format:check` commands
- 📏 **Sensible defaults** - Modern formatting rules out of the box

### Git Integration

- 📦 **Auto-initialization** - `git init` with initial commit
- 📝 **Clean history** - Professional commit message and clean initial state
- 🔧 **Ready to push** - Add your remote and start collaborating
- 📋 **Proper .gitignore** - Node.js specific ignore patterns

### Package Manager Detection

Automatically detects and uses your preferred package manager:

- Detects from execution context (`npm_execpath`, `npm_config_user_agent`)
- Supports npm, pnpm, yarn, and bun
- Uses detected manager for dependency installation
- Shows relevant commands in success messages

### Directory Handling

- ✅ Creates new directories automatically
- 🔍 Checks if directories are empty (ignores `.git`)
- ❓ Prompts before overwriting existing files
- 🧹 Smart cleanup when overwriting

### Project Name Validation

- Validates npm package name format
- Auto-converts invalid names to valid ones
- Handles special characters and spaces
- Ensures lowercase formatting

## 📦 Dependencies Included

### Base Dependencies (Always Included)

- `typescript` - TypeScript compiler
- `tsx` - Fast TypeScript execution

### ESLint Dependencies (Default)

- `eslint` - ESLint linter
- `@eslint/js` - ESLint JavaScript rules
- `@typescript-eslint/eslint-plugin` - TypeScript ESLint rules
- `@typescript-eslint/parser` - TypeScript parser for ESLint

### Prettier Dependencies (Default)

- `prettier` - Code formatter
- `eslint-plugin-prettier` - Prettier ESLint integration
- `eslint-config-prettier` - Disable conflicting ESLint rules

### Environment Variables (Default)

- `dotenv` - Environment variable loading

## 📋 Requirements

- Node.js >= 18.0.0

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.

## 📄 License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

---

**Links:** [GitHub](https://github.com/mattiamalonni/create-tsx-app) • [npm](https://www.npmjs.com/package/create-tsx-app) • [Issues](https://github.com/mattiamalonni/create-tsx-app/issues)
