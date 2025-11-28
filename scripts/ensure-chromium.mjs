import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { chromium } from 'playwright';

function resolveExecutablePath() {
  try {
    const candidate = chromium.executablePath();
    if (candidate && existsSync(candidate)) {
      return candidate;
    }
  } catch (error) {
    // Continue to installation
  }
  return null;
}

export function ensureChromiumExecutable() {
  const existing = resolveExecutablePath();
  if (existing) {
    return existing;
  }

  console.info('Chromium not found; installing via Playwright (chromium)...');
  const result = spawnSync('npx', ['playwright', 'install', 'chromium'], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error('Failed to install Chromium with Playwright');
  }

  const installed = resolveExecutablePath();
  if (!installed) {
    throw new Error('Chromium installation completed but no executable was found');
  }

  return installed;
}

export function ensureChromiumDependencies() {
  const result = spawnSync('npx', ['playwright', 'install-deps', 'chromium'], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    throw new Error('Failed to install Chromium system dependencies with Playwright');
  }
}
