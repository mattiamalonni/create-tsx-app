import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export interface UserConfig {
  template?: string;
  packageManager?: string;
  scope?: string;
  author?: string;
  lint?: boolean;
  format?: boolean;
  git?: boolean;
  gitCommit?: boolean;
  ci?: boolean;
  docker?: boolean;
  env?: boolean;
  install?: boolean;
  license?: boolean;
  offline?: boolean;
  overwrite?: boolean;
}

const CONFIG_FILES = ['create-tsx-app.config.ts', 'create-tsx-app.config.mts'] as const;

const BOOLEAN_KEYS = ['lint', 'format', 'git', 'gitCommit', 'ci', 'docker', 'env', 'install', 'license', 'offline', 'overwrite'] as const;
const STRING_KEYS = ['template', 'packageManager', 'scope', 'author'] as const;

function normalize(value: unknown): UserConfig {
  if (!value || typeof value !== 'object') return {};
  const source = value as Record<string, unknown>;
  const config: UserConfig = {};

  for (const key of BOOLEAN_KEYS) {
    if (typeof source[key] === 'boolean') config[key] = source[key];
  }
  for (const key of STRING_KEYS) {
    if (typeof source[key] === 'string') config[key] = source[key];
  }

  return config;
}

/** Loads optional team defaults from the current working directory. */
export async function loadUserConfig(cwd: string): Promise<UserConfig> {
  for (const file of CONFIG_FILES) {
    const fullPath = path.join(cwd, file);
    if (!fs.existsSync(fullPath)) continue;

    try {
      const imported = (await import(pathToFileURL(fullPath).href)) as { default?: unknown };
      return normalize(imported.default);
    } catch (error) {
      console.warn(`Could not load ${file}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return {};
    }
  }

  return {};
}
