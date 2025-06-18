# create-tsx-app

A CLI tool that quickly scaffolds a new TypeScript project with [tsx](https://github.com/privatenumber/tsx) pre-configured. It sets up a clean and minimal project structure, allowing you to start coding immediately.

## Features

- **Interactive prompts** for project setup
- **Customizable project name and package.json**
- **Automatically installs dependencies** (`typescript` and `tsx`)
- **Smart package manager detection** - automatically uses the same package manager you used to run the command
- **Minimal boilerplate with a ready-to-run TypeScript setup**

## Usage

### **Basic Usage**

```sh
# Using npx directly
npx create-tsx-app@latest my-app

# Using pnpm
pnpm create tsx-app@latest my-app

# Using yarn
yarn create tsx-app my-app
```

This will:

- Ask for a project name (`my-app` by default)
- Check if the directory is empty
- Prompt to overwrite or keep existing files if necessary
- Generate a minimal TypeScript project
- Ask if you want to install dependencies
- **Automatically detect which package manager you used** and use it for installation

### **Command-Line Options**

| Option        | Alias | Description                                    |
| ------------- | ----- | ---------------------------------------------- |
| `--install`   | `-i`  | Automatically install dependencies             |
| `--overwrite` | `-o`  | Overwrite an existing directory without asking |

### **Example Usage with Flags**

```sh
# Automatically install dependencies without prompting
npx create-tsx-app@latest my-app --install
```

This will create the project and install dependencies automatically using the detected package manager.

```sh
# Overwrite existing directory without prompting
npx create-tsx-app@latest my-app --overwrite
```

This will remove existing files in `my-app` and proceed with the setup.

## Package Manager Detection

The tool automatically detects which package manager you used to run the command:

- **npm**: When using `npm create tsx-app` or `npx create-tsx-app`
- **pnpm**: When using `pnpm create tsx-app` or `pnpm dlx create-tsx-app`
- **yarn**: When using `yarn create tsx-app` or `yarn dlx create-tsx-app`

The detected package manager will be used for:

- Installing dependencies (if you choose to install them)
- Showing appropriate commands in success messages
- Ensuring consistency with your preferred tooling

## Dependency Installation

When you choose to install dependencies, the tool will:

- Install the required dev dependencies (`typescript` and `tsx`)
- Use the detected package manager for installation:
  - `npm install` for npm
  - `pnpm install` for pnpm
  - `yarn install` for yarn

This ensures dependencies are installed using your preferred package manager.

## Project Structure

After running the command, your project will have the following structure:

```
my-app/
├── src/                # Your source code directory
│   ├── index.ts        # Entry point
├── tsconfig.json       # TypeScript configuration
├── package.json        # Project metadata and dependencies
├── .gitignore          # Git ignore file
└── README.md           # Project documentation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © [Mattia Malonni](https://github.com/mattiamalonni)

## Links

- [GitHub Repository](https://github.com/mattiamalonni/create-tsx-app)
- [Issues](https://github.com/mattiamalonni/create-tsx-app/issues)
- [npm Package](https://www.npmjs.com/package/create-tsx-app)
