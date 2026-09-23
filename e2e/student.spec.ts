import { test as base, expect, type Page } from '@playwright/test';

interface TestCloud { progress: string; version: number; failSave: boolean }
const test = base.extend<{ cloud: TestCloud }>({
  cloud: [async ({ page }, use) => {
    const cloud = { progress: JSON.stringify({
      done: {}, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
      start: '2026-09-22', cw: 1, cd: 1, paceFlex: false, kitChecked: {}, theme: 'light', onboarded: true,
    }), version: 0, failSave: false };
    // Identity and transport doubles: backend authorization is covered by convex/crew.test.ts.
    await page.route('https://www.youtube-nocookie.com/**', route => route.abort());
    await page.route('**/src/lib/convex.ts', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        const rpc = (fn, args) => fetch('/__test_convex', {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ fn, args })
        }).then(async r => { if (!r.ok) throw new Error('Save failed'); return r.json(); });
        export const api = { crew: { signInOrRegister: 'signIn', syncProgress: 'sync', getMembers: 'members', getCritPosts: 'posts' } };
        export const convex = { mutation: rpc, onUpdate(fn, args, cb) { rpc(fn, args).then(cb); return () => {}; } };
        export const isConvexEnabled = () => true;
        export const getConvexSiteUrl = () => location.origin;
        export const setGoogleCredential = () => {};
        export const clearCloudAuth = () => {};
      `,
    }));
    await page.route('**/__test_convex', async route => {
      const { fn, args } = route.request().postDataJSON();
      if (fn === 'signIn') {
        const progress = JSON.parse(cloud.progress);
        await route.fulfill({ json: { member: {
          _id: 'test-student', name: args.name, roomCode: args.roomCode || 'STUDIO',
          week: progress.cw, day: progress.cd, progressVersion: cloud.version, doneJson: cloud.progress,
        }, created: false } });
      } else if (fn === 'sync') {
        if (cloud.failSave || args.expectedVersion !== cloud.version) await route.fulfill({ status: 409, json: { error: 'Save failed' } });
        else { cloud.progress = args.doneJson; cloud.version++; await route.fulfill({ json: cloud.version }); }
      } else await route.fulfill({ json: [] });
    });
    await page.route('https://accounts.google.com/gsi/client', route => route.fulfill({
      contentType: 'application/javascript',
      body: `
        let onCredential;
        window.googleRenderCount = 0;
        window.google = { accounts: { id: {
          initialize(options) { onCredential = options.callback; },
          renderButton(container) {
            window.googleRenderCount++;
            const button = document.createElement('button');
            button.textContent = 'Sign in with Google';
            button.onclick = () => onCredential({ credential: 'test.' + btoa(JSON.stringify({ name: 'Student', sub: 'test-student' })) + '.test' });
            container.replaceChildren(button);
          }
        } } };
      `,
    }));
    await use(cloud);
  }, { auto: true }],
});

async function signIn(page: Page) {
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  await expect(page.locator('main h1')).toBeVisible();
}
async function startCourse(page: Page) {
  await page.goto('/');
  await signIn(page);
}

test('a signed-in student can browse the course and keep daily notes', async ({ page, cloud }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await startCourse(page);
  for (const label of ['This Week', 'Roadmap', '25 Exercises', 'Video Vault', 'Method & Kit', 'Stats & Streak', 'The Crew', 'Today']) {
    await page.getByRole('button', { name: label, exact: true }).click();
    await expect(page.locator('main h1')).toBeVisible();
  }
  await page.locator('#note-input').fill('Keep shoulder strokes confident.');
  await expect.poll(() => JSON.parse(cloud.progress).dayNotes.w1d1).toBe('Keep shoulder strokes confident.');
  await page.reload();
  await signIn(page);
  await expect(page.locator('#note-input')).toHaveValue('Keep shoulder strokes confident.');
  await expect(page.locator('main')).not.toContainText('Obsidian');
  expect(errors).toEqual([]);
});

test('sign-in is the only entry and shortcuts cannot change progress behind it', async ({ page, cloud }) => {
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).toBeVisible();
  await expect(page.locator('main')).toHaveCount(0);
  await expect(page.getByText(/local profile|local practice|backup|offline sync/i)).toHaveCount(0);
  await page.keyboard.press('1');
  await page.keyboard.press('Space');
  expect(cloud.version).toBe(0);
  await signIn(page);
});



test('weekly reflections are saved in the account', async ({ page, cloud }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  await page.locator('.reflection-card textarea').first().fill('Ellipses are more consistent.');
  await expect.poll(() => JSON.parse(cloud.progress).weekNotes['1']).toBe('Ellipses are more consistent.');
  await page.getByRole('button', { name: 'Today', exact: true }).click();
  await page.reload();
  await signIn(page);
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


test('long notes and a cleared hours field survive reload', async ({ page, cloud }) => {
  await startCourse(page);
  const note = 'n'.repeat(10001);
  await page.locator('#note-input').fill(note);
  await page.locator('#hours-input').fill('1.5');
  await page.locator('#hours-input').fill('');
  await expect.poll(() => JSON.parse(cloud.progress).dayNotes.w1d1).toBe(note);
  await page.reload();
  await signIn(page);
  await expect(page.locator('#note-input')).toHaveValue(note);
});

test('a saved play day starts with a stopwatch after reload', async ({ page, cloud }) => {
  await startCourse(page);
  await page.getByRole('button', { name: 'Stats & Streak', exact: true }).click();
  await page.getByTitle('W1 D7', { exact: true }).click();
  await expect.poll(() => JSON.parse(cloud.progress).cd).toBe(7);
  await page.reload();
  await signIn(page);
  await expect(page.locator('.clock-display')).toHaveText('00:00');
  await expect(page.locator('.preset-btn')).toHaveText(/Stopwatch/);
});







test('Google sign-in button is not recreated by timer ticks', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).toBeVisible();
  await page.clock.fastForward(3000);
  expect(await page.evaluate('window.googleRenderCount')).toBe(1);
});

test('saving never changes existing browser data', async ({ page, cloud }) => {
  await page.addInitScript(() => localStorage.setItem('imaginationGym.v2', 'old-progress-untouched'));
  await startCourse(page);
  await page.locator('#note-input').fill('Account progress');
  await expect.poll(() => JSON.parse(cloud.progress).dayNotes.w1d1).toBe('Account progress');
  expect(await page.evaluate(() => localStorage.getItem('imaginationGym.v2'))).toBe('old-progress-untouched');
});

test('failed saves offer retry without claiming success', async ({ page, cloud }) => {
  await startCourse(page);
  cloud.failSave = true;
  await page.locator('#note-input').fill('Keep this pending edit');
  await expect(page.getByRole('alert')).toContainText('have not saved');
  expect(JSON.parse(cloud.progress).dayNotes.w1d1).toBeUndefined();
  cloud.failSave = false;
  await page.getByRole('button', { name: 'Retry save', exact: true }).click();
  await expect.poll(() => JSON.parse(cloud.progress).dayNotes.w1d1).toBe('Keep this pending edit');
  await expect(page.getByRole('alert')).toHaveCount(0);
});
