# create-tsx-app 🚀

**create-tsx-app** is a CLI tool that quickly scaffolds a new TypeScript project with [`tsx`](https://github.com/esbuild/tsx) pre-configured. It sets up a clean and minimal project structure, allowing you to start coding immediately.

## 🌟 Features

✅ **Interactive prompts** for project setup
✅ **Customizable project name and package.json**
✅ **Automatically installs dependencies** (`tsx`, `typescript`)
✅ **Option to overwrite existing directories**
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
| `--help`      | `-h`  | Show help information                              |

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

## 🛠️ Running the Project

After setup, navigate into your project directory:

```sh
cd my-app
npx tsx src/index.ts
```

To install dependencies manually:

```sh
npm install
```

## ⚡ Example Output

```sh
npx create-tsx-app my-app
```

```
Welcome to create-tsx-app! 🚀
This tool will help you set up a new TypeScript project with tsx.

✔ App name: my-app
✔ Do you want to install dependencies now? (y/n) y

Scaffolding project in /Users/yourname/my-app...
Installing dependencies...
Dependencies installed successfully.

Setup complete! 🎉
Start your project by running:

  cd my-app
  npm run dev
```

## 📜 License

This project is licensed under the **MIT License**.

---

### **🚀 Ready to Start?**

Run the command and get started with TypeScript + TSX in seconds:

```sh
npx create-tsx-app my-app
```

Happy coding! 🎉
