/** Validatori condivisi, senza dipendenze esterne e senza effetti collaterali. */

export const VALID_TEMPLATES = ['basic', 'express', 'fastify'] as const;
export type Template = (typeof VALID_TEMPLATES)[number];

/** Versione minima di Node richiesta dalla CLI (allineata a `engines.node`). */
export const MIN_NODE_VERSION = '22.18.0';

export function isTemplate(value: string): value is Template {
  return (VALID_TEMPLATES as readonly string[]).includes(value);
}

export function isValidPackageName(name: string): boolean {
  return /^(?:@[a-z\d][a-z\d\-._~]*\/)?[a-z\d][a-z\d\-._~]*$/.test(name) && name.length <= 214;
}

function parseVersion(version: string): number[] {
  return version
    .replace(/^v/, '')
    .split('.')
    .map((part) => Number.parseInt(part, 10) || 0);
}

export function compareVersions(a: string, b: string): number {
  const left = parseVersion(a);
  const right = parseVersion(b);

  for (let index = 0; index < 3; index += 1) {
    const difference = (left[index] ?? 0) - (right[index] ?? 0);
    if (difference !== 0) return difference;
  }

  return 0;
}

export function validateNodeVersion(): { isValid: boolean; currentVersion: string; requiredVersion: string } {
  const currentVersion = process.version;
  return {
    isValid: compareVersions(currentVersion, MIN_NODE_VERSION) >= 0,
    currentVersion,
    requiredVersion: MIN_NODE_VERSION,
  };
}
