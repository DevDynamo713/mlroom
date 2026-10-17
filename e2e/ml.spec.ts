import { test, expect } from '@playwright/test';
test('mlroom loads and adds model', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('MLRoom: demo');
  await page.locator('.name-input').fill('fraud-detector');
  await page.locator('.acc-input').fill('0.92');
  await page.locator('.base-input').fill('0.95');
  await page.locator('.add-btn').click();
  await expect(page.locator('.model-list').locator('div').first()).toBeVisible();
});