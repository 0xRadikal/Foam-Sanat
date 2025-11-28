import { chromium } from 'playwright';
import { AxeBuilder } from '@axe-core/playwright';
import { ensureChromiumDependencies, ensureChromiumExecutable } from './ensure-chromium.mjs';

async function runAxe(url) {
  const executablePath = ensureChromiumExecutable();
  let browser;

  try {
    browser = await chromium.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (error) {
    console.warn('Chromium launch failed, installing system dependencies via Playwright...');
    ensureChromiumDependencies();
    browser = await chromium.launch({
      headless: true,
      executablePath,
      args: ['--no-sandbox', '--disable-dev-shm-usage'],
    });
  }
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'networkidle' });
  const { violations } = await new AxeBuilder({ page }).analyze();

  console.log(`Accessibility violations: ${violations.length}`);
  violations.forEach((violation, index) => {
    console.log(`\n${index + 1}. ${violation.id} - ${violation.help}`);
    console.log(`   Impact: ${violation.impact}`);
    console.log(`   Nodes:`);
    violation.nodes.forEach((node) => {
      console.log(`    - ${node.target.join(' ')}`);
    });
  });

  await context.close();
  await browser.close();
  if (violations.length > 0) {
    console.warn('Accessibility checks reported violations (see above).');
  }
}

const targetUrl = process.argv[2] ?? 'http://localhost:3000';
runAxe(targetUrl).catch((error) => {
  console.error('Axe run failed:', error);
  process.exitCode = 1;
});
