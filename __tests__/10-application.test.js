import { test, expect } from '@playwright/test';

test.describe('registration', () => {
  test.beforeEach(async ({ page }) => {

    await page.goto('/');
    await page.waitForTimeout(300);

    await expect(page.locator('text=Hexlet Chat')).toBeVisible();
  });

  test('handle new user creation', async ({ page }) => {
    await page.click('text=Hexlet Chat');
    await expect(page).toHaveURL(/\/signup$/);
    await page.fill('input[name="username"]', 'user123');
    await page.fill('input[name="password"]', 'password123');
    await page.click('text=Зарегистрироваться');
    await expect(page.locator('text=Сообщения')).toBeVisible();
  });
});
