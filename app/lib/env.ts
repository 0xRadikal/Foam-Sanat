// app/lib/env.ts
// Centralized environment variable helpers and validation
import envConfig from '../../env.config';

type EnvVisibility = 'public' | 'server';
type Severity = 'required' | 'recommended';

type EnvVarConfig = {
  keys: string[];
  visibility: EnvVisibility;
  severity?: Severity;
};

const isServerRuntime = typeof window === 'undefined';
const isProd = process.env.NODE_ENV === 'production';

const normalizeList = (value: string | string[]): string[] =>
  Array.isArray(value) ? [...value] : [value];

const traceKeyList = (keys: string[]): string => keys.join(' | ');

const buildEnvMatrix = () => {
  const publicRequired = envConfig.public?.required ?? [];
  const publicRecommended = envConfig.public?.recommended ?? [];
  const serverRequired = envConfig.server?.required ?? [];
  const serverRecommended = envConfig.server?.recommended ?? [];

  const mapEntry = (keys: string[], visibility: EnvVisibility, severity: Severity): EnvVarConfig[] =>
    keys.map((key) => ({ keys: [key], visibility, severity }));

  return [
    ...mapEntry(publicRequired, 'public', 'required'),
    ...mapEntry(publicRecommended, 'public', 'recommended'),
    ...mapEntry(serverRequired, 'server', 'required'),
    ...mapEntry(serverRecommended, 'server', 'recommended'),
  ];
};

const ENV_MATRIX = buildEnvMatrix();
let hasValidated = false;

function logMissing(keys: string[], visibility: EnvVisibility, severity: Severity) {
  const header = severity === 'required' ? '❌ CRITICAL' : '⚠️  Optional';
  const message = `${header}: Missing ${visibility} environment variable(s):\n${keys
    .map((key) => `  • ${key}`)
    .join('\n')}`;

  if (severity === 'required') {
    console.error({ event: 'env.missing.required', keys, message });
    if (isProd) {
      throw new Error(message);
    }
    return;
  }

  console.warn({ event: 'env.missing.optional', keys, message });
}

export function validateEnv({ force = false }: { force?: boolean } = {}) {
  if (!isServerRuntime) return;
  if (hasValidated && !force) return;

  const missingRequired: EnvVarConfig[] = [];
  const missingRecommended: EnvVarConfig[] = [];

  for (const entry of ENV_MATRIX) {
    const value = process.env[entry.keys[0]];
    if (value) continue;

    if (entry.severity === 'required') {
      missingRequired.push(entry);
    } else {
      missingRecommended.push(entry);
    }
  }

  if (missingRequired.length > 0) {
    for (const visibility of ['server', 'public'] as const) {
      const keys = missingRequired
        .filter((item) => item.visibility === visibility)
        .map((item) => item.keys[0]);

      if (keys.length > 0) {
        logMissing(keys, visibility, 'required');
      }
    }
  }

  if (missingRecommended.length > 0) {
    for (const visibility of ['server', 'public'] as const) {
      const keys = missingRecommended
        .filter((item) => item.visibility === visibility)
        .map((item) => item.keys[0]);

      if (keys.length > 0) {
        logMissing(keys, visibility, 'recommended');
      }
    }
  }

  hasValidated = true;
}

export function ensureServerEnvVars(requiredKeys: string[]) {
  if (!isServerRuntime || requiredKeys.length === 0) return;

  const missing = requiredKeys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    logMissing(missing, 'server', 'required');
  }
}

type GetEnvOptions = {
  fallback?: string;
  visibility: EnvVisibility;
  allowEmpty?: boolean;
  severity?: Severity;
};

export function getEnvValue(keys: string | string[], options: GetEnvOptions): string {
  const keyList = normalizeList(keys);
  const value = keyList.map((key) => process.env[key]).find(Boolean);

  if (value !== undefined && (options.allowEmpty || value !== '')) {
    return value;
  }

  const severity = options.severity ?? 'required';
  const message = `Missing ${options.visibility} environment value for ${traceKeyList(keyList)}.`;

  // Avoid noisy client-side logs for optional public values; return the fallback silently.
  if (!isServerRuntime && severity === 'recommended') {
    return options.fallback ?? '';
  }

  if (severity === 'required' && isProd) {
    throw new Error(message);
  }

  const logMethod = severity === 'required' ? console.warn : console.info;
  logMethod(`${message}${options.fallback ? ` Falling back to: ${options.fallback}` : ''}`);

  return options.fallback ?? '';
}
