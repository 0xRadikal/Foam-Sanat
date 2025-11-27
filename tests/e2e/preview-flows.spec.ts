import { expect, test, type Page } from '@playwright/test';

type SupportedLocale = 'fa' | 'en';

type LocaleCopy = {
  dir: 'rtl' | 'ltr';
  home: string;
  products: string;
  details: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  commentPlaceholder: string;
  submitLabel: string;
  pendingLabel: string;
  noComments: string;
  localeToggleLabel: RegExp;
};

const localeCopy: Record<SupportedLocale, LocaleCopy> = {
  fa: {
    dir: 'rtl',
    home: 'خانه',
    products: 'محصولات',
    details: 'جزئیات',
    namePlaceholder: 'نام شما',
    emailPlaceholder: 'ایمیل شما',
    commentPlaceholder: 'نظر شما',
    submitLabel: 'ارسال نظر',
    pendingLabel: 'در انتظار تایید',
    noComments: 'هنوز نظری نیست',
    localeToggleLabel: /تغییر زبان به انگلیسی/i,
  },
  en: {
    dir: 'ltr',
    home: 'Home',
    products: 'Products',
    details: 'Details',
    namePlaceholder: 'Your Name',
    emailPlaceholder: 'Your Email',
    commentPlaceholder: 'Your Review',
    submitLabel: 'Submit',
    pendingLabel: 'Pending review',
    noComments: 'No comments',
    localeToggleLabel: /Switch to Persian/i,
  },
};

async function mockCommentsApi(page: Page, locale: SupportedLocale) {
  await page.route('**/api/comments*', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ comments: [] }),
      });
      return;
    }

    if (method === 'POST') {
      const payload = (await route.request().postDataJSON()) as {
        productId?: string;
        rating?: number;
        author?: string;
        text?: string;
        email?: string;
      };

      const createdAt = new Date().toISOString();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({
          comment: {
            id: `pw-${locale}-${Date.now()}`,
            productId: payload?.productId ?? 'unknown',
            rating: payload?.rating ?? 5,
            author: payload?.author ?? 'Playwright User',
            text: payload?.text ?? 'Automated comment',
            createdAt,
            status: 'pending',
            replies: [],
          },
        }),
      });
      return;
    }

    await route.continue();
  });
}

test.describe('Locale switching', () => {
  test('toggles between Persian and English header content', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('html')).toHaveAttribute('dir', localeCopy.fa.dir);
    await expect(page.getByRole('link', { name: localeCopy.fa.home })).toBeVisible();

    await page.getByRole('button', { name: localeCopy.fa.localeToggleLabel }).click();

    await expect(page.locator('html')).toHaveAttribute('dir', localeCopy.en.dir);
    await expect(page.getByRole('link', { name: localeCopy.en.home })).toBeVisible();
  });
});

test.describe('Localized product comment flows', () => {
  for (const locale of Object.keys(localeCopy) as SupportedLocale[]) {
    const copy = localeCopy[locale];

    test(`navigates and submits a comment in ${locale.toUpperCase()}`, async ({ page }) => {
      await mockCommentsApi(page, locale);

      await page.goto(`/products?lang=${locale}`);

      await expect(page.locator('html')).toHaveAttribute('dir', copy.dir);
      await expect(page.getByRole('link', { name: copy.home })).toBeVisible();

      await page.getByRole('button', { name: copy.details }).first().click();

      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      await expect(dialog.getByText(copy.noComments).first()).toBeVisible();

      const commentText = `Automated ${locale} comment ${Date.now()}`;

      await dialog.getByPlaceholder(copy.namePlaceholder).fill('Playwright QA');
      await dialog.getByPlaceholder(copy.emailPlaceholder).fill('qa@example.com');
      await dialog.getByPlaceholder(copy.commentPlaceholder).fill(commentText);

      await dialog.getByRole('button', { name: copy.submitLabel }).click();

      await expect(dialog.getByText(copy.pendingLabel)).toBeVisible();
      await expect(dialog.getByText(commentText)).toBeVisible();
    });
  }
});
