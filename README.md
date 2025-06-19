# create-tsx-app

> ⚡ Lightning-fast TypeScript project scaffolding with [tsx](https://github.com/privatenumber/tsx)

Create production-ready TypeScript projects in seconds with zero configuration.

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

- 🚀 **Zero Config** - Ready to code immediately
- 📦 **Smart Package Manager Detection** - Uses npm, pnpm, yarn, or bun automatically
- 🎯 **Interactive Setup** - Guided project configuration
- ⚡ **Fast Development** - Pre-configured with tsx for instant TypeScript execution
- 🧹 **Clean Structure** - Minimal boilerplate, maximum productivity
- 🔍 **Intelligent Validation** - Project name validation and directory handling

## Usage

### Basic Usage

```bash
# Create a new project
npm create tsx-app@latest my-project

# Create and install dependencies automatically
npm create tsx-app@latest my-project --install

# Overwrite existing directory
npm create tsx-app@latest my-project --overwrite
```

### Command Options

| Flag          | Alias | Description                  |
| ------------- | ----- | ---------------------------- |
| `--install`   | `-i`  | Auto-install dependencies    |
| `--overwrite` | `-o`  | Overwrite existing directory |
| `--help`      | `-h`  | Show help message            |

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

Your new project includes:

```
my-app/
├── src/
│   └── index.ts        # Entry point with example code
├── package.json        # Dependencies: typescript + tsx
├── tsconfig.json       # Optimized TypeScript config
├── .gitignore          # Node.js gitignore
└── README.md           # Getting started guide
```

### Ready-to-Use Commands

```bash
cd my-app

# Development (with tsx for instant execution)
npm run dev

# Build for production
npm run build

# Type checking
npm run type-check
```

## 🎯 Smart Features

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

## 🤝 Contributing

Contributions welcome! Feel free to open issues or submit PRs.

## 📄 License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

---

**Links:** [GitHub](https://github.com/mattiamalonni/create-tsx-app) • [npm](https://www.npmjs.com/package/create-tsx-app) • [Issues](https://github.com/mattiamalonni/create-tsx-app/issues)
