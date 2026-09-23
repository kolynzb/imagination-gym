import { test, expect, startCourse, signIn } from './fixtures';

test('paused practice time survives reload and logging only credits it once', async ({ page, cloud }) => {
  await startCourse(page);
  await page.clock.install();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.fastForward(65000);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect.poll(() => JSON.parse(cloud.progress).timer?.timerRunning).toBe(false);
  const elapsed = JSON.parse(cloud.progress).timer.timerElapsed;
  expect(elapsed).toBeGreaterThanOrEqual(65);
  await page.reload();
  await signIn(page);
  await expect(page.locator('.clock-display')).not.toHaveText('10:00');
  await page.getByRole('button', { name: 'Log Hours', exact: true }).click();
  await expect.poll(() => Number(JSON.parse(cloud.progress).dayHours.w1d1)).toBeCloseTo(elapsed / 3600, 5);
  await page.reload();
  await signIn(page);
  await page.getByRole('button', { name: 'Log Hours', exact: true }).click();
  expect(Number(JSON.parse(cloud.progress).dayHours.w1d1)).toBeCloseTo(elapsed / 3600, 5);
});

test('independent remote and local notes both survive a stale revision', async ({ page, cloud }) => {
  await startCourse(page);
  cloud.progress = JSON.stringify({ ...JSON.parse(cloud.progress), dayNotes: { w1d2: 'Other device note' } });
  cloud.version++;
  await page.locator('#note-input').fill('This tab note');
  await expect.poll(() => JSON.parse(cloud.progress).dayNotes).toEqual({ w1d1: 'This tab note', w1d2: 'Other device note' });
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('same-note conflict keeps both versions visible and saves the selected version', async ({ page, cloud }) => {
  await startCourse(page);
  cloud.progress = JSON.stringify({ ...JSON.parse(cloud.progress), dayNotes: { w1d1: 'Other device note' } });
  cloud.version++;
  await page.locator('#note-input').fill('This tab note');
  const dialog = page.getByRole('dialog', { name: 'Choose which changes to keep' });
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('Other device note');
  await expect(dialog).toContainText('This tab note');
  await page.screenshot({path:'scratch/qa-conflict-fixed.png'});
  await dialog.getByRole('button', { name: 'Keep this tab’s version' }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => JSON.parse(cloud.progress).dayNotes.w1d1).toBe('This tab note');
  await page.reload();
  await signIn(page);
  await expect(page.locator('#note-input')).toHaveValue('This tab note');
});


test('new student completes onboarding and restores the chosen date', async ({ page, cloud }) => {
  cloud.progress = JSON.stringify({ ...JSON.parse(cloud.progress), onboarded: false });
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  const onboarding = page.getByRole('dialog', { name: 'Course onboarding walkthrough' });
  await expect(onboarding).toBeVisible();
  await onboarding.getByRole('button', { name: 'Next →', exact: true }).click();
  await onboarding.locator('input[type="date"]').fill('2026-10-05');
  await onboarding.getByRole('button', { name: 'Next →', exact: true }).click();
  await onboarding.getByRole('button', { name: "Let's Draw →", exact: true }).click();
  await expect(onboarding).toHaveCount(0);
  await expect.poll(() => JSON.parse(cloud.progress).onboarded).toBe(true);
  await expect.poll(() => JSON.parse(cloud.progress).start).toBe('2026-10-05');
  await page.reload();
  await signIn(page);
  await expect(onboarding).toHaveCount(0);
});
