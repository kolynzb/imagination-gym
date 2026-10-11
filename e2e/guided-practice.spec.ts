import { mkdir } from 'node:fs/promises';
import { test, expect, startCourse, signIn } from './fixtures';

test('video practice saves partial completion and notes, restores XP, and resumes next part', async ({ page, cloud }) => {
  await mkdir('scratch/screenshots', { recursive: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await startCourse(page);
  await page.getByRole('button', { name: 'Start practice', exact: true }).click();
  const practice = page.getByRole('dialog', { name: 'Guided practice', exact: true });
  await expect(practice.locator('iframe')).toHaveAttribute('src', /0_AdsK8x9Lw/);
  await practice.getByRole('button', { name: 'Holding your pen', exact: true }).click();
  await expect(practice.locator('iframe')).toHaveAttribute('src', /_IR8zH4RCfU/);
  expect(await practice.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await practice.getByRole('button', { name: 'Complete part · +20 XP', exact: true }).click();
  await expect(practice.getByText('+20 XP', { exact: true })).toBeVisible();
  await expect.poll(() => JSON.parse(cloud.progress).done.w1d1p0).toBe(true);
  await practice.getByRole('button', { name: 'Finish for now', exact: true }).click();
  await practice.getByRole('textbox', { name: 'One thing you noticed (optional)' }).fill('Give my arm more room.');
  await practice.getByRole('button', { name: 'Back to Today', exact: true }).click();
  await expect.poll(() => JSON.parse(cloud.progress).dayNotes.w1d1).toBe('Give my arm more room.');
  await page.reload(); await signIn(page);
  await expect(page.getByText('20 XP total · 20 per completed part')).toBeVisible();
  await page.getByRole('button', { name: 'Continue practice', exact: true }).click();
  await expect(practice.locator('iframe')).toHaveAttribute('src', /LkJG6pKTuRc/);
  await practice.getByRole('button', { name: 'Ghosted planes', exact: true }).click();
  await expect(practice.locator('iframe')).toHaveAttribute('src', /JsG7cMasVjo/);
  await page.screenshot({ path: 'scratch/screenshots/practice-videos-phone.png' });
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.screenshot({ path: 'scratch/screenshots/practice-videos-desktop.png' });
});

test('failed saves remain visible and retry preserves completion without extra XP', async ({ page, cloud }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Start practice', exact: true }).click();
  cloud.failSave = true;
  const practice = page.getByRole('dialog', { name: 'Guided practice', exact: true });
  await practice.getByRole('button', { name: 'Complete part · +20 XP', exact: true }).click();
  await expect(practice.getByRole('button', { name: 'Retry save', exact: true })).toBeVisible();
  expect(JSON.parse(cloud.progress).done.w1d1p0).toBeUndefined();
  cloud.failSave = false;
  await practice.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect.poll(() => JSON.parse(cloud.progress).done.w1d1p0).toBe(true);
  await expect(practice.getByRole('button', { name: 'Retry save', exact: true })).toHaveCount(0);
  await expect(practice.getByText('+20 XP', { exact: true })).toBeVisible();
});

test('existing progress earns a level and later days use their own lesson and completion keys', async ({ page, cloud }) => {
  const { WEEKS } = await import('../src/lib/curriculum');
  const keys = WEEKS.flatMap((w, wi) => w.days.flatMap((d, di) => d.parts.map((_, p) => `w${wi+1}d${di+1}p${p}`)));
  cloud.progress = JSON.stringify({ ...JSON.parse(cloud.progress), cw: 2, cd: 1, done: Object.fromEntries(keys.slice(0,9).map(k => [k,true])) });
  await startCourse(page);
  await expect(page.getByText('180 XP total · 20 per completed part')).toBeVisible();
  await page.getByRole('button', { name: 'Start practice', exact: true }).click();
  const practice = page.getByRole('dialog', { name: 'Guided practice', exact: true });
  await expect(practice.locator('iframe')).not.toHaveAttribute('src', /0_AdsK8x9Lw/);
  await practice.getByRole('button', { name: 'Complete part · +20 XP', exact: true }).click();
  await expect(practice.getByText('Level 2. A new mark.', { exact: true })).toBeVisible();
  await expect.poll(() => JSON.parse(cloud.progress).done.w2d1p0).toBe(true);
  await page.screenshot({ path: 'scratch/screenshots/practice-level-up.png' });
});

test('session path switches instruction without awarding XP and keeps source resources nearby', async ({ page, cloud }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Start practice', exact: true }).click();
  const practice = page.getByRole('dialog', { name: 'Guided practice', exact: true });
  const path = practice.getByRole('navigation', { name: 'Session parts' });
  await path.getByRole('button', { name: /Stroke trajectory/ }).click();
  await expect(practice.locator('iframe')).toHaveAttribute('src', /LkJG6pKTuRc/);
  await expect(path.getByRole('button', { name: /Stroke trajectory/ })).toHaveAttribute('aria-current', 'step');
  expect(JSON.parse(cloud.progress).done).toEqual({});
  await practice.getByText('Keep these nearby').click();
  await expect(practice.getByRole('link', { name: 'Drawabox: Ghosted Lines' })).toHaveAttribute('href', 'https://drawabox.com/lesson/1/10');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'scratch/screenshots/session-path-desktop.png' });
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await practice.evaluate(el => el.scrollWidth <= el.clientWidth)).toBe(true);
  await page.screenshot({ path: 'scratch/screenshots/session-path-mobile.png' });
});
