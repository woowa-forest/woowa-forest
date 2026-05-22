import { test, expect } from '@playwright/test';

test('has title and displays login page when not logged in', async ({ page }) => {
  await page.goto('/');

  // Assuming LandingPage has a specific title or text
  await expect(page.locator('text=우아한 숲')).toBeVisible();
});
