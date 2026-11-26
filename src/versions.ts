import type { FilePlan } from './scaffold';

const DEFAULT_REGISTRY = 'https://registry.npmjs.org/';

interface PackageManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/** Fetches the registry's `latest` tag for each package, tolerating failures. */
export async function resolveLatestVersions(names: string[]): Promise<Record<string, string>> {
  const registry = (process.env.npm_config_registry ?? DEFAULT_REGISTRY).replace(/\/+$/, '');

  const results = await Promise.all(
    names.map(async (name): Promise<readonly [string, string] | null> => {
      try {
        const response = await fetch(`${registry}/${name.replace('/', '%2f')}/latest`, {
          signal: AbortSignal.timeout(3000),
          headers: { accept: 'application/json' },
        });
        if (!response.ok) return null;

        const data = (await response.json()) as { version?: unknown; 'dist-tags'?: { latest?: unknown } };
        const version = data['dist-tags']?.latest ?? data.version;
        return typeof version === 'string' ? ([name, `^${version}`] as const) : null;
      } catch {
        return null;
      }
    }),
  );

  return Object.fromEntries(results.filter((entry): entry is readonly [string, string] => entry !== null));
}

/** Rewrites the generated manifest with current versions, keeping failed lookups as fallbacks. */
export async function refreshPlanVersions(plan: FilePlan[]): Promise<{ resolved: number; failed: number }> {
  const entry = plan.find((file) => file.path === 'package.json');
  if (!entry?.content) return { resolved: 0, failed: 0 };

  const manifest = JSON.parse(entry.content) as PackageManifest;
  const names = [...Object.keys(manifest.dependencies ?? {}), ...Object.keys(manifest.devDependencies ?? {})];
  const versions = await resolveLatestVersions(names);

  for (const section of ['dependencies', 'devDependencies'] as const) {
    const dependencies = manifest[section];
    if (!dependencies) continue;
    for (const name of Object.keys(dependencies)) {
      if (versions[name]) dependencies[name] = versions[name];
    }
  }

  entry.content = `${JSON.stringify(manifest, null, 2)}\n`;
  return { resolved: Object.keys(versions).length, failed: names.length - Object.keys(versions).length };
}
