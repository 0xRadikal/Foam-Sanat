import { spawn } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const THRESHOLDS = {
  performance: 0.9,
  accessibility: 0.98,
  seo: 0.92,
  'best-practices': 0.92,
};

const PREVIEW_URL_CANDIDATES = [
  process.env.PREVIEW_URL,
  process.env.VERCEL_BRANCH_URL,
  process.env.VERCEL_URL,
  process.env.NEXT_PUBLIC_DEPLOYMENT_URL,
  process.env.DEPLOYMENT_URL,
];

function resolveTargetUrl() {
  const candidate = PREVIEW_URL_CANDIDATES.find((value) => Boolean(value && value.trim()));
  if (!candidate) {
    throw new Error(
      'PREVIEW_URL (or VERCEL_BRANCH_URL/DEPLOYMENT_URL) must be set to run Lighthouse/Axe against the preview deployment.',
    );
  }

  if (candidate.startsWith('http://') || candidate.startsWith('https://')) {
    return candidate;
  }

  return `https://${candidate}`;
}

async function run(command, args, options = {}) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', ...options });

    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`${command} ${args.join(' ')} exited with code ${code}`));
      }
    });
  });
}

async function runAxe(targetUrl, reportPath) {
  await run('npx', ['axe', targetUrl, '--chromium', '--timeout', '120', '--save', reportPath, '--exit']);
}

async function runLighthouse(targetUrl, basePath) {
  await run('npx', [
    'lighthouse',
    targetUrl,
    '--output',
    'json',
    '--output',
    'html',
    '--output-path',
    basePath,
    '--only-categories=performance,accessibility,seo,best-practices',
    '--quiet',
    '--chrome-flags=--headless=new',
    '--max-wait-for-load=120000',
  ]);
}

async function enforceThresholds(reportPath) {
  const raw = await readFile(reportPath, 'utf8');
  const report = JSON.parse(raw);
  const failures = [];

  for (const [category, threshold] of Object.entries(THRESHOLDS)) {
    const score = report?.categories?.[category]?.score ?? 0;
    if (score < threshold) {
      failures.push({ category, score, threshold });
    }
  }

  if (failures.length > 0) {
    const formatted = failures
      .map(({ category, score, threshold }) => `${category}: ${score} < ${threshold}`)
      .join('\n');
    throw new Error(`Lighthouse scores below threshold:\n${formatted}`);
  }

  const summary = Object.fromEntries(
    Object.keys(THRESHOLDS).map((category) => [category, report?.categories?.[category]?.score ?? 0]),
  );
  console.info('Lighthouse thresholds satisfied', summary);
}

async function main() {
  const targetUrl = resolveTargetUrl();
  const reportsDir = path.join(process.cwd(), 'reports');
  const axeReportPath = path.join(reportsDir, 'axe', 'axe-report.json');
  const lighthouseBase = path.join(reportsDir, 'lighthouse', 'preview');
  const lighthouseJson = `${lighthouseBase}.report.json`;

  await mkdir(path.dirname(axeReportPath), { recursive: true });
  await mkdir(path.dirname(lighthouseBase), { recursive: true });

  console.info(`Running Axe against ${targetUrl}`);
  await runAxe(targetUrl, axeReportPath);

  console.info(`Running Lighthouse against ${targetUrl}`);
  await runLighthouse(targetUrl, lighthouseBase);
  await enforceThresholds(lighthouseJson);

  console.info('Preview accessibility/performance audits completed', {
    axeReport: axeReportPath,
    lighthouseHtml: `${lighthouseBase}.report.html`,
    lighthouseJson,
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
