import './env.js';

const greet = (name: string): string => `Hello, ${name}! 🚀`;

const main = (): void => {
  console.log(greet('World'));
  console.log('Edit src/index.ts and run `npm run dev` to see your changes instantly.');
};

main();
