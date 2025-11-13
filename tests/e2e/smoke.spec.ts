import { test, expect } from '@playwright/test';

const CONTACT_ERROR_REGEX = /Error|خطا/i;

test.describe('Home page smoke tests', () => {
  test('renders hero section with primary calls to action', async ({ page }) => {
    await page.goto('/');

    const hero = page.getByTestId('hero-section');
    await expect(hero).toBeVisible();
    await expect(hero.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(hero.locator('a[href="#contact"]').first()).toBeVisible();
    await expect(hero.locator('a[href="#products"]').first()).toBeVisible();
  });
});

test.describe('Contact form validation', () => {
  test('shows error state for invalid submissions', async ({ page }) => {
    await page.goto('/#contact');

    const contactForm = page.getByTestId('contact-form');
    await expect(contactForm).toBeVisible();

    await page.fill('#name', 'Test User');
    await page.fill('#email', 'test@example.com');
    await page.fill('#phone', 'abc');
    await page.fill('#message', 'This is a sample inquiry message used for automated testing.');

    const responsePromise = page.waitForResponse((response) =>
      response.url().includes('/api/contact') && response.request().method() === 'POST'
    );

    await Promise.all([
      responsePromise,
      contactForm.getByRole('button').click(),
    ]);

    const response = await responsePromise;
    expect(response.status()).toBeGreaterThanOrEqual(400);

    const statusMessage = page.getByTestId('contact-form-status');
    await expect(statusMessage).toBeVisible();
    await expect(statusMessage).toContainText(CONTACT_ERROR_REGEX);
  });
});

test.describe('Products modal flow', () => {
  test('opens and closes the product details modal', async ({ page }) => {
    await page.goto('/products');

    const detailTrigger = page.getByTestId('product-details-button').first();
    await expect(detailTrigger).toBeVisible();

    await detailTrigger.click();

    const modal = page.getByTestId('product-detail-modal');
    await expect(modal).toBeVisible();
    await expect(modal.getByRole('heading', { level: 2 })).toBeVisible();

    await modal.getByRole('button', { name: /Close|بستن/i }).click();
    await expect(modal).not.toBeVisible();
  });
});
