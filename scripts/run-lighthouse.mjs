import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { ensureChromiumDependencies, ensureChromiumExecutable } from './ensure-chromium.mjs';

function resolveLighthouseBin() {
  const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
  return path.join(scriptsDir, '..', 'node_modules', '.bin', 'lighthouse');
}

async function runLighthouse(targetUrl) {
  const chromePath = ensureChromiumExecutable();
  ensureChromiumDependencies();
  const lighthouseBin = resolveLighthouseBin();

  const args = [
    targetUrl,
    '--output',
    'html',
    '--output-path',
    './lighthouse-report.html',
    '--only-categories=performance,accessibility,seo,best-practices',
    '--throttling-method=devtools',
    '--chrome-flags=--headless=new --no-sandbox --disable-dev-shm-usage',
  ];

  await new Promise((resolve, reject) => {
    const child = spawn(lighthouseBin, args, {
      stdio: 'inherit',
      env: {
        ...process.env,
        CHROME_PATH: process.env.CHROME_PATH || chromePath,
      },
    });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Lighthouse exited with code ${code}`));
      }
    });
  });
}

const targetUrl = process.argv[2] ?? 'http://localhost:3000';

runLighthouse(targetUrl).catch((error) => {
  console.error('Lighthouse run failed:', error);
  process.exitCode = 1;
});
