import { test as base, expect, type Page } from '@playwright/test';

export interface TestCloud { progress: string; version: number; failSave: boolean }

export const test = base.extend<{ cloud: TestCloud }>({
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
        }).then(async r => {
          const body = await r.json();
          if (!r.ok) {
            const error = new Error(body.error || 'Save failed');
            error.data = body.data;
            throw error;
          }
          return body;
        });
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
        if (cloud.failSave) await route.fulfill({ status: 500, json: { error: 'Save failed' } });
        else if (args.expectedVersion !== cloud.version) await route.fulfill({
          status: 409,
          json: { error: 'Progress conflict', data: { code: 'PROGRESS_CONFLICT', progressVersion: cloud.version, doneJson: cloud.progress } },
        });
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

export { expect };

export async function signIn(page: Page) {
  await page.getByRole('button', { name: 'Sign in with Google', exact: true }).click();
  await expect(page.locator('main h1')).toBeVisible();
}

export async function startCourse(page: Page) {
  await page.goto('/');
  await signIn(page);
}
