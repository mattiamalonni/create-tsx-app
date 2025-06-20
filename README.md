# create-tsx-app

> Create production-ready TypeScript projects in seconds with multiple templates and zero configuration.

## Quick Start

```bash
npx create-tsx-app@latest my-app
# or
pnpm create tsx-app@latest my-app
# or
yarn create tsx-app@latest my-app
# or
bun create tsx-app@latest my-app
```

### 🎯 Interactive Mode (Recommended for first-time users)

Let the CLI guide you through setup choices:

```bash
npx create-tsx-app@latest my-project --interactive
```

You'll be prompted to choose your template and features - perfect for exploring options!

## ✨ Features

- 🔧 **Zero Configuration** - Everything works out of the box
- 🎯 **Interactive or Silent Mode** - Choose your setup style with CLI flags
- 📦 **Smart Package Manager Detection** - Works with npm, pnpm, yarn, and bun
- 🚀 **Multiple Templates** - Basic, Express API, and Fastify API templates
- ⚡ **Fast Development** - Pre-configured with tsx for instant TypeScript execution
- 🛡️ **Modern Tooling** - ESLint 9, Prettier, Git, and environment variables

## 🎨 Templates

Choose the perfect starting point for your TypeScript project:

```bash
# 🔹 Basic (Default)
npx create-tsx-app@latest my-project --template basic

# 🚀 Express API
npx create-tsx-app@latest my-api --template express

# ⚡️ Fastify API
npx create-tsx-app@latest my-api --template fastify
```

## Usage

### Command Options

| Flag            | Alias | Description                                      | Default |
| --------------- | ----- | ------------------------------------------------ | ------- |
| `--template`    | `-t`  | Template to use (basic, express, fastify)        | basic   |
| `--interactive` | `-i`  | Enable interactive prompts for feature selection | false   |
| `--overwrite`   | `-o`  | Overwrite existing directory without asking      | false   |
| `--eslint`      |       | Include ESLint configuration                     | true    |
| `--prettier`    |       | Include Prettier configuration                   | true    |
| `--git`         |       | Initialize Git repository                        | true    |
| `--env`         |       | Setup environment variables                      | true    |
| `--version`     | `-v`  | Display version number                           | -       |
| `--help`        | `-h`  | Show help message                                | -       |

**💡 Tip:** Use `--no-*` to disable default features (e.g., `--no-eslint`, `--no-prettier`, `--no-git`, `--no-env`) for a minimal setup.

```bash
# Minimal TypeScript-only setup
npx create-tsx-app@latest my-util --no-eslint --no-prettier --no-git --no-env
```

## 📋 Requirements

- **Node.js** >= 18.0.0
- **Package Manager**: npm, pnpm, yarn, or bun

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup

```bash
git clone https://github.com/mattiamalonni/create-tsx-app.git
cd create-tsx-app
npm install

# Test locally
npm run dev -- /tmp/test-project --template express
```

## Happy coding! 🚀

## 📄 License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

## 🔗 Links

**[GitHub](https://github.com/mattiamalonni/create-tsx-app)**
• **[Npm](https://www.npmjs.com/package/create-tsx-app)**
• **[Issues](https://github.com/mattiamalonni/create-tsx-app/issues)**
