import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // These tests exercise our UI, not YouTube availability or third-party playback.
  await page.route('https://www.youtube-nocookie.com/**', route => route.abort());
});

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

test('invalid backup import preserves existing notes', async ({ page }) => {
  await startCourse(page);
  await page.locator('#note-input').fill('Do not lose this note.');
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  page.on('dialog', dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles({
    name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{}'),
  });
  await expect(page.locator('.backup-message')).toBeVisible();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.locator('#note-input')).toHaveValue('Do not lose this note.');
  await page.reload();
  await expect(page.locator('#note-input')).toHaveValue('Do not lose this note.');
});

test('weekly reflections are saved in the app', async ({ page }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  await page.locator('.reflection-card textarea').first().fill('Ellipses are more consistent.');
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  await expect(page.locator('.reflection-card textarea').first()).toHaveValue('Ellipses are more consistent.');
});

test('four-part sessions and play days have usable timers', async ({ page }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  await page.getByTitle('W2 D2', { exact: true }).click();
  await expect(page.locator('.preset-btn')).toHaveCount(4);
  await page.locator('.preset-btn').nth(1).click();
  await expect(page.locator('.clock-display')).toHaveText('15:00');
  await page.locator('.preset-btn').nth(3).click();
  await expect(page.locator('.clock-display')).toHaveText('20:00');
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  await page.getByTitle('W1 D7', { exact: true }).click();
  await expect(page.locator('.preset-btn')).toHaveText(/Stopwatch/);
  await page.locator('.preset-btn').click();
  await page.clock.install();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.fastForward(65_000);
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.locator('.clock-display')).toHaveText('01:05');
  await page.getByRole('button', { name: 'Mark Day Complete' }).click();
  const logged = await page.locator('#hours-input').inputValue();
  await page.getByRole('button', { name: 'Log Hours', exact: true }).click();
  await expect(page.locator('#hours-input')).toHaveValue(logged);
  expect(Number(logged)).toBeGreaterThan(0);
});

test('portable backup downloads and restores notes', async ({ page }) => {
  await startCourse(page);
  await page.locator('#note-input').fill('Portable student notes.');
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /Export.*JSON|Export Backup/i }).click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.locator('#note-input').fill('Changed after backup.');
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  page.on('dialog', dialog => dialog.accept());
  await page.locator('input[type="file"]').setInputFiles(path!);
  await expect(page.locator('.backup-message')).toContainText('imported successfully');
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.locator('#note-input')).toHaveValue('Portable student notes.');
});

test('a student can download app-neutral session notes', async ({ page }) => {
  await startCourse(page);
  await page.locator('#note-input').fill('My independent study notes.');
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download Markdown', exact: true }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.md$/);
  const stream = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(Buffer.from(chunk));
  const markdown = Buffer.concat(chunks).toString('utf8');
  expect(markdown).toContain('My independent study notes.');
  expect(markdown).not.toMatch(/Obsidian|\[\[|01 Journal|02 Sources/);
});

test('the student interface fits a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startCourse(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});


test('long notes and a cleared hours field survive reload', async ({ page }) => {
  await startCourse(page);
  const note = 'n'.repeat(10001);
  await page.locator('#note-input').fill(note);
  await page.locator('#hours-input').fill('1.5');
  await page.locator('#hours-input').fill('');
  await page.reload();
  await expect(page.locator('#note-input')).toHaveValue(note);
});

test('a saved play day starts with a stopwatch after reload', async ({ page }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  await page.getByTitle('W1 D7', { exact: true }).click();
  await page.reload();
  await expect(page.locator('.clock-display')).toHaveText('00:00');
  await expect(page.locator('.preset-btn')).toHaveText(/Stopwatch/);
});

test('device recovery is available after a browser restart', async ({ page }) => {
  await startCourse(page);
  await page.locator('#note-input').fill('Before cloud restore');
  await page.evaluate(() => {
    localStorage.setItem('imaginationGym.v2.beforeCloudRestore', localStorage.getItem('imaginationGym.v2')!);
  });
  await page.locator('#note-input').fill('Cloud snapshot');
  await page.reload();
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  page.on('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: 'Restore Device Backup', exact: true }).click();
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await expect(page.locator('#note-input')).toHaveValue('Before cloud restore');
});


test('unreadable stored progress is not overwritten by defaults', async ({ page }) => {
  await startCourse(page);
  const raw = JSON.stringify({ dayNotes: { w1d1: 'Recover this original note' }, cw: 99 });
  await page.evaluate(raw => localStorage.setItem('imaginationGym.v2', raw), raw);
  await page.reload();
  await page.getByRole('button', { name: 'Skip, I know the method' }).click();
  await expect(page.getByRole('alert')).toContainText('could not save');
  await page.locator('#note-input').fill('New work');
  expect(await page.evaluate(() => localStorage.getItem('imaginationGym.v2'))).toBe(raw);
});


test('Google sign-in button is not recreated by timer ticks', async ({ page }) => {
  await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({
    contentType: 'application/javascript',
    body: `window.google = { accounts: { id: {
      initialize() {},
      renderButton(container) {
        window.googleRenderCount = (window.googleRenderCount || 0) + 1;
        container.innerHTML = '<button>Test Google sign-in</button>';
      }
    } } };`,
  }));
  await page.clock.install();
  await startCourse(page);
  await page.getByRole('button', { name: 'The Crew', exact: true }).click();
  await page.getByRole('button', { name: 'Profile & Switch Room' }).click();
  await expect(page.getByRole('button', { name: 'Test Google sign-in', exact: true })).toBeVisible();
  await page.clock.fastForward(3000);
  expect(await page.evaluate('window.googleRenderCount')).toBe(1);
});
