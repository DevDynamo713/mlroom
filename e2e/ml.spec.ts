import { test, expect } from '@playwright/test';
test('mlroom loads and creates experiment', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('MLRoom: demo');
  await page.locator('.name-input').fill('rf-tune');
  await page.locator('.model-input').selectOption('randomforest');
  await page.locator('.dataset-input').fill('kaggle-train');
  await page.locator('.add-btn').click();
  await expect(page.locator('.experiment-list').locator('div').first()).toBeVisible();
});