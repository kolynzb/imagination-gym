import { test, expect } from '@playwright/test';

async function startCourse(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip, I know the method' }).click();
}

test('a local student can browse the course and keep daily notes', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await startCourse(page);
  for (const label of ['This Week', 'Roadmap', '25 Exercises', 'Video Vault', 'Method & Kit', 'Stats & Streak', 'The Crew', 'Today']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('main h1')).toBeVisible();
  }
  await page.locator('#note-input').fill('Keep shoulder strokes confident.');
  await page.reload();
  await expect(page.locator('#note-input')).toHaveValue('Keep shoulder strokes confident.');
  await expect(page.locator('main')).not.toContainText('Obsidian');
  expect(errors).toEqual([]);
});

test('onboarding shortcuts do not change progress behind the dialog', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Skip, I know the method' }).waitFor();
  await page.keyboard.press('1');
  await page.keyboard.press('Space');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('imaginationGym.v2') || '{}'));
  expect(saved.done?.w1d1p0).not.toBe(true);
  await page.getByRole('button', { name: 'Skip, I know the method' }).click();
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
});

test('the student interface fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startCourse(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
