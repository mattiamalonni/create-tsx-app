# create-tsx-app 🚀

**create-tsx-app** is a CLI tool that quickly scaffolds a new TypeScript project with [`tsx`](https://github.com/privatenumber/tsx) pre-configured. It sets up a clean and minimal project structure, allowing you to start coding immediately.

## 🌟 Features

✅ **Interactive prompts** for project setup
<br />
✅ **Customizable project name and package.json**
<br />
✅ **Automatically installs dependencies** (`tsx`, `typescript`)
<br />
✅ **Option to overwrite existing directories**
<br />
✅ **Minimal boilerplate with a ready-to-run TypeScript setup**

## 📦 Installation

You can use `npx` to run `create-tsx-app` without installing it globally:

```sh
npx create-tsx-app my-project
```

Or, install it globally:

```sh
npm install -g create-tsx-app
create-tsx-app my-project
```

## 🚀 Usage

### **Basic Usage**

```sh
npx create-tsx-app my-app
```

This will:

- Ask for a project name (`my-app` by default)
- Check if the directory is empty
- Prompt to overwrite or keep existing files if necessary
- Generate a minimal TypeScript project
- Ask if you want to install dependencies

### **Command-Line Options**

| Option        | Alias | Description                                        |
| ------------- | ----- | -------------------------------------------------- |
| `--install`   | `-i`  | Automatically install dependencies (`npm install`) |
| `--overwrite` | `-o`  | Overwrite an existing directory without asking     |

### **Example Usage with Flags**

```sh
npx create-tsx-app my-app --install
```

This will create the project and install dependencies automatically.

```sh
npx create-tsx-app my-app --overwrite
```

This will remove existing files in `my-app` and proceed with the setup.

## 📂 Project Structure

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

### **🚀 Ready to Start?**

Run the command and get started with TypeScript + TSX in seconds:

```sh
npx create-tsx-app my-app
```

Happy coding! 🎉
