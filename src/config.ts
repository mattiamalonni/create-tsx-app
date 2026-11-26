import type { Template } from './validations';

export const TEMPLATE_DESCRIPTIONS: Record<Template, string> = {
  basic: 'Minimal TypeScript entry point for CLIs, scripts and utilities',
  express: 'Express 5 REST API with CORS, Helmet, Morgan and example routes',
  fastify: 'Fastify REST API with OpenAPI docs and example routes',
};

export interface FeatureOptions {
  lint: boolean;
  format: boolean;
  git: boolean;
  gitCommit: boolean;
  ci: boolean;
  docker: boolean;
  env: boolean;
  install: boolean;
  license: boolean;
}

export interface DependencySet {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

const CORE_DEV_DEPENDENCIES: Record<string, string> = {
  typescript: '^5.9.3',
  tsx: '^4.23.15',
  '@types/node': '^22.20.7',
};

const TEMPLATE_DEPENDENCIES: Record<Template, DependencySet> = {
  basic: { dependencies: {}, devDependencies: {} },
  express: {
    dependencies: {
      cors: '^2.8.6',
      express: '^5.3.0',
      helmet: '^8.3.0',
      morgan: '^1.12.1',
    },
    devDependencies: {
      '@types/cors': '^2.8.19',
      '@types/express': '^5.0.6',
      '@types/morgan': '^1.9.10',
    },
  },
  fastify: {
    dependencies: {
      '@fastify/cors': '^11.4.3',
      '@fastify/helmet': '^13.2.0',
      '@fastify/swagger': '^9.9.5',
      '@fastify/swagger-ui': '^6.1.5',
      fastify: '^5.12.8',
    },
    devDependencies: {},
  },
};

/** Builds the exact dependency manifest written to the generated package.json. */
export function getDependencies(template: Template, features: FeatureOptions): DependencySet {
  const base = TEMPLATE_DEPENDENCIES[template];
  const dependencies = { ...base.dependencies };
  const devDependencies = { ...CORE_DEV_DEPENDENCIES, ...base.devDependencies };

  if (features.lint) devDependencies.oxlint = '^1.95.0';
  if (features.format) devDependencies.oxfmt = '^0.80.0';
  if (features.env) dependencies.dotenv = '^18.0.10';

  return { dependencies, devDependencies };
}
