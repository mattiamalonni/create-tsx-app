// Welcome to your new TypeScript project!
// This is a simple example to get you started.

function greet(name: string): string {
  return `Hello, ${name}! Welcome to your new TypeScript project with tsx.`;
}

function main(): void {
  const message = greet('Developer');
  console.log(message);

  // Example of modern JavaScript features
  const features = [
    'TypeScript support',
    'Fast compilation with tsx',
    'Modern ES modules',
    'Strict type checking',
  ];
  console.log('\nProject features:');
  features.forEach((feature, index) => {
    console.log(`${index + 1}. ${feature}`);
  });
}

main();
