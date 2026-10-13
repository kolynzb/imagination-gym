import { mkdir } from 'node:fs/promises';
import { test, expect, startCourse } from './fixtures';

const views = [
  ['This Week', 'Week'], ['Roadmap', 'Roadmap & 4-Phase Pipeline'],
  ['25 Exercises', 'Drills'], ['Video Vault', 'Video Vault (30 Videos)'],
  ['Stats & Streak', 'Stats & 56-Day Calendar'], ['The Crew', 'Crew'],
  ['Method & Kit', 'Method, Kit & Rubric'], ['Today', 'Today'],
] as const;

for (const width of [390, 1440]) {
  test(`all product views fit ${width}px and navigation starts at the heading`, async ({ page }) => {
    await mkdir('scratch/screenshots', { recursive: true });
    await page.setViewportSize({ width, height: 960 });
    await startCourse(page);
    for (const [desktop, mobile] of views) {
      if (width < 860 && !['Week', 'Drills', 'Crew', 'Today'].includes(mobile)) {
        await page.getByRole('button', { name: '⋯ Menu', exact: true }).click();
      }
      await page.getByRole('button', { name: width < 860 ? mobile : desktop, exact: true }).click();
      const view = { 'This Week': 'week', Roadmap: 'roadmap', '25 Exercises': 'exercises', 'Video Vault': 'vault', 'Stats & Streak': 'progress', 'The Crew': 'crew', 'Method & Kit': 'method', Today: 'today' }[desktop];
      await expect(page.locator(`.${view}-view`)).toBeVisible();
      await expect(page.locator('main h1')).toBeVisible();
      await expect.poll(async () => (await page.locator('main h1').boundingBox())!.y).toBeGreaterThanOrEqual(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      await page.screenshot({ animations: 'disabled', path: `scratch/screenshots/layout-${desktop.replaceAll(' ', '-').toLowerCase()}-${width}.png` });
      await page.locator('main').getByRole('heading').last().scrollIntoViewIfNeeded();
    }
  });
}

test('video topics and search combine, and only the selected lesson mounts a player', async ({ page }) => {
  await page.route('https://i.ytimg.com/**', route => route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360"><rect width="480" height="360" fill="gray"/></svg>' }));
  await startCourse(page);
  await page.getByRole('button', { name: 'Video Vault', exact: true }).click();
  await expect(page.locator('.video-card iframe')).toHaveCount(0);
  await expect.poll(() => page.locator('.video-preview img').first().evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(480);
  const thumbnail = await page.locator('.player-wrapper').first().boundingBox();
  expect(thumbnail!.width / thumbnail!.height).toBeCloseTo(16 / 9, 1);
  await page.locator('.video-preview').first().click();
  await expect(page.locator('.video-card iframe')).toHaveCount(1);
  await page.locator('.video-preview').first().click();
  await expect(page.locator('.video-card iframe')).toHaveCount(1);
  await page.locator('.phase-filters button').nth(1).click();
  await expect(page.locator('.vault-group')).toHaveCount(1);
  await expect(page.locator('.video-card iframe')).toHaveCount(0);
  await page.getByRole('textbox', { name: 'Search videos' }).fill('does-not-exist');
  await expect(page.getByRole('heading', { name: /No videos match/ })).toBeVisible();
  await page.getByRole('button', { name: 'Clear Search', exact: true }).click();
  await expect(page.locator('.video-card')).toHaveCount(30);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('combobox', { name: 'Topic', exact: true }).selectOption({ index: 1 });
  await expect(page.locator('.vault-group')).toHaveCount(1);
  await expect(page.locator('.video-preview').first()).toBeInViewport();
});

test('roadmap browses without changing active practice and keeps source resource cards', async ({ page, cloud }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Roadmap', exact: true }).click();
  await page.locator('.ladder-col').nth(1).click();
  await expect(page.getByRole('heading', { name: '3D Form Construction', exact: true })).toBeVisible();
  expect(JSON.parse(cloud.progress).cw).toBe(1);
  await page.getByRole('button', { name: 'Week 1', exact: true }).click();
  await expect(page.locator('.week-view')).toBeVisible();
  await expect(page.locator('.day-row')).toHaveCount(7);
  await expect(page.locator('.day-row[aria-current="step"]')).toContainText('0/3 parts complete');
  expect((await page.locator('.days-section').boundingBox())!.y).toBeLessThan((await page.locator('.top-grid').boundingBox())!.y);
  await expect(page.getByRole('link', { name: 'Drawabox: Ghosted Lines', exact: true })).toHaveAttribute('href', 'https://drawabox.com/lesson/1/10');
  await page.getByRole('button', { name: '25 Exercises', exact: true }).click();
  await page.getByRole('textbox', { name: 'Search exercises' }).fill('Straights');
  await page.getByRole('button', { name: 'View exercise →', exact: true }).first().click();
  await expect(page.getByRole('dialog', { name: 'Exercise details' })).toBeVisible();
});

test('mobile menu supports keyboard dismissal and does not trigger practice shortcuts', async ({ page, cloud }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startCourse(page);
  const menu = page.getByRole('button', { name: '⋯ Menu', exact: true });
  await menu.click();
  await expect(page.getByRole('button', { name: 'Dismiss menu', exact: true })).toBeFocused();
  await page.keyboard.press('1');
  expect(JSON.parse(cloud.progress).done).toEqual({});
  await page.keyboard.press('Shift+Tab');
  await expect(page.getByRole('button', { name: 'Dark', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'More views menu' })).toHaveCount(0);
  await expect(menu).toBeFocused();
});

test('resource cards remain readable in dark mode with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await startCourse(page);
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.getByRole('button', { name: 'This Week', exact: true }).click();
  await page.getByRole('heading', { name: 'Keep these nearby', exact: true }).scrollIntoViewIfNeeded();
  await expect(page.locator('.week-resources .resource-card').first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ animations: 'disabled', path: 'scratch/screenshots/layout-resources-dark.png' });
});
