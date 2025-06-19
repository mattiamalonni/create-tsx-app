# {{PROJECT_NAME}}

A modern TypeScript project created with [create-tsx-app](https://github.com/mattiamalonni/create-tsx-app).

## 🚀 Getting Started

### Development

Run the development server with file watching and environment variables:

```bash
npm run dev
```

This starts the development server with:

- ⚡ Fast TypeScript compilation with [tsx](https://github.com/privatenumber/tsx)
- 🔄 Automatic file watching and reloading
- 🌍 Environment variables loaded from `.env` file

### Production

Run the application in production mode:

```bash
npm run start
```

### Build

Compile TypeScript to JavaScript:

```bash
npm run build
```

### Type Checking

Run TypeScript type checking without emitting files:

```bash
npm run type-check
```

### Code Quality

Lint your code:

```bash
npm run lint          # Check for issues
npm run lint:fix      # Fix auto-fixable issues
```

Format your code:

```bash
npm run format        # Format all files
npm run format:check  # Check formatting without changing files
```

### Clean

Remove build artifacts:

```bash
npm run clean
```

## 📁 Project Structure

```
{{PROJECT_NAME}}/
├── src/
│   └── index.ts           # Main application entry point
├── .env                   # Environment variables (gitignored in production)
├── .git/                  # Git repository
├── .gitignore             # Git ignore patterns
├── eslint.config.js       # ESLint configuration (flat config)
├── .prettierrc.json       # Prettier configuration
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## 🛠️ Features

- ⚡ **Fast development** with [tsx](https://github.com/privatenumber/tsx) - no build step needed
- 🔧 **Modern TypeScript** configuration with strict type checking
- 📦 **ES Modules** support out of the box
- 🌍 **Environment variables** support with `.env` file
- � **Code linting** with ESLint 9 (flat config) and TypeScript rules
- 💅 **Code formatting** with Prettier, integrated with ESLint
- 📦 **Git repository** initialized with clean initial commit
- 🔄 **File watching** for seamless development experience
- 📏 **Consistent code style** across the entire project

## 🌍 Environment Variables

Your project supports environment variables through a `.env` file:

```env
NODE_ENV=development
PORT=3000
```

Access them in your code:

```typescript
console.log(process.env.NODE_ENV); // "development"
console.log(process.env.PORT); // "3000"
```

The environment variables are automatically loaded when using `npm run dev` or `npm run start`.

## 🧹 Code Style

This project uses ESLint and Prettier for consistent code quality:

- **ESLint**: Catches potential bugs and enforces best practices
- **Prettier**: Ensures consistent code formatting
- **Integration**: ESLint and Prettier work together without conflicts

Your editor should automatically pick up the configurations. For VS Code, install:

- [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier extension](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

## � Dependencies

### Runtime Dependencies

This is a TypeScript project compiled to JavaScript. The built application has no runtime dependencies.

### Development Dependencies

- **typescript** - TypeScript compiler
- **tsx** - Fast TypeScript execution and development
- **eslint** - Code linting
- **@typescript-eslint/\*** - TypeScript ESLint rules and parser
- **prettier** - Code formatting
- **eslint-plugin-prettier** - Prettier integration with ESLint
- **eslint-config-prettier** - Disables conflicting ESLint rules
- **dotenv** - Environment variable loading

## 🚀 Deployment

### Build for Production

1. Compile TypeScript:

   ```bash
   npm run build
   ```

2. The compiled JavaScript will be in the `dist/` directory

3. Deploy the `dist/` directory to your hosting platform

### Environment Variables in Production

Make sure to set your environment variables in your production environment. The `.env` file is for development only.

## 📚 Learn More

- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [tsx Documentation](https://github.com/privatenumber/tsx)
- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/)
- [Node.js Documentation](https://nodejs.org/docs/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run the linter: `npm run lint`
5. Format your code: `npm run format`
6. Commit your changes: `git commit -am 'Add some feature'`
7. Push to the branch: `git push origin feature-name`
8. Submit a pull request

Happy coding! 🚀
