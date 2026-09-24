import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { test, expect, startCourse } from './fixtures';

test('Space activates the focused Exit button without starting the timer', async ({ page }) => {
  await startCourse(page);
  const initialTime = await page.locator('.clock-display').innerText();
  await page.getByRole('button', { name: 'Focus Mode', exact: true }).click();

  const exit = page.getByRole('button', { name: /Exit Focus/ });
  await exit.focus();
  await page.keyboard.press('Space');

  await expect(page.locator('.focus-modal')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toHaveCount(0);
  await expect(page.locator('.clock-display')).toHaveText(initialTime);
});

test('Today and Focus expose named checkbox state; Focus has full instructions and completion controls', async ({ page }) => {
  await startCourse(page);

  const todayPart = page.getByRole('checkbox', { name: /Part A: .* complete/ });
  await expect(todayPart).toHaveAttribute('aria-checked', 'false');
  await todayPart.click();
  await expect(todayPart).toHaveAttribute('aria-checked', 'true');

  await page.getByRole('button', { name: 'Focus Mode', exact: true }).click();
  await expect(page.locator('.part-instructions').first()).toContainText(/shoulder/);

  const focusPart = page.locator('.focus-modal').getByRole('checkbox', { name: /Part A: .* complete/ });
  await expect(focusPart).toHaveAttribute('aria-checked', 'true');

  const interval = page.locator('#focus-interval');
  await expect(interval).toHaveValue('0');
  await page.getByRole('button', { name: 'Next part interval' }).click();
  await expect(interval).toHaveValue('1');
  await expect(page.locator('.timer-clock')).toHaveText('50:00');

  await page.getByRole('button', { name: 'Mark Session Complete' }).click();
  const focusCheckboxes = page.locator('.focus-modal').getByRole('checkbox');
  await expect(focusCheckboxes).toHaveCount(3);
  for (const checkbox of await focusCheckboxes.all()) {
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  }
  await expect(page.locator('.focus-modal').getByRole('button', { name: /Go to Next Day/ })).toBeVisible();
});

test('mobile and portrait tablet keep the guided entry visible and the timer before lesson details', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startCourse(page);

  const header = page.locator('.day-header');
  const timer = page.locator('.timer-box');
  const lessons = page.locator('.parts-container');
  await expect(timer).toHaveCount(1);
  await expect(timer).toBeVisible();
  const headerBox = await header.boundingBox();
  const timerBox = await timer.boundingBox();
  const lessonsBox = await lessons.boundingBox();
  expect(headerBox).not.toBeNull();
  expect(timerBox).not.toBeNull();
  expect(lessonsBox).not.toBeNull();
  expect(timerBox!.y).toBeGreaterThanOrEqual(headerBox!.y + headerBox!.height);
  expect(timerBox!.y + timerBox!.height).toBeLessThanOrEqual(lessonsBox!.y);
  const startBox = await page.getByRole('button', { name: 'Start guided practice →', exact: true }).boundingBox();
  expect(startBox).not.toBeNull();
  expect(startBox!.y + startBox!.height).toBeLessThanOrEqual(844);

  await page.setViewportSize({ width: 820, height: 1180 });
  await expect(timer).toHaveCount(1);
  const tabletTimerBox = await timer.boundingBox();
  const tabletLessonsBox = await lessons.boundingBox();
  expect(tabletTimerBox).not.toBeNull();
  expect(tabletLessonsBox).not.toBeNull();
  expect(tabletTimerBox!.y + tabletTimerBox!.height).toBeLessThanOrEqual(tabletLessonsBox!.y);
});

test('Focus keeps an unsaved checkpoint retry visible without a conflict dialog', async ({ page, cloud }) => {
  await startCourse(page);
  cloud.failSave = true;
  await page.locator('#note-input').fill('Keep this offline draft safe.');
  await expect(page.getByRole('alert')).toContainText('have not saved');
  await page.getByRole('button', { name: 'Focus Mode', exact: true }).click();

  const focusAlert = page.locator('.focus-modal').getByRole('alert');
  await expect(focusAlert).toContainText('have not saved');
  cloud.failSave = false;
  await focusAlert.getByRole('button', { name: 'Retry save' }).click();
  await expect(focusAlert).toHaveCount(0);
});

test('captures rendered desktop and phone Today and Focus screens', async ({ page }) => {
  const screenshotDir = resolve(process.cwd(), 'scratch/screenshots');
  await mkdir(screenshotDir, { recursive: true });
  await page.clock.setFixedTime(new Date('2026-09-23T09:00:00.000Z'));
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Sign in with Google', exact: true })).toBeVisible();
  await page.screenshot({ path: resolve(screenshotDir, 'practice-welcome-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: resolve(screenshotDir, 'practice-welcome-phone.png') });

  await page.setViewportSize({ width: 1440, height: 960 });
  await startCourse(page);
  await page.screenshot({ path: resolve(screenshotDir, 'practice-today-desktop.png') });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: resolve(screenshotDir, 'practice-today-phone.png') });
  const phoneStart = await page.getByRole('button', { name: 'Start guided practice →', exact: true }).boundingBox();
  expect(phoneStart).not.toBeNull();
  expect(phoneStart!.y + phoneStart!.height).toBeLessThanOrEqual(780);
  await page.setViewportSize({ width: 1440, height: 960 });
  await page.getByRole('button', { name: 'Focus Mode', exact: true }).click();
  await expect(page.locator('.focus-modal')).toBeVisible();
  await page.screenshot({ path: resolve(screenshotDir, 'practice-focus-desktop.png') });

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: resolve(screenshotDir, 'practice-focus-phone.png') });
});

test('exercise drawer isolates the background and restores keyboard focus', async ({ page }) => {
  await startCourse(page);
  const opener = page.getByRole('button', { name: 'Ex 01 Drawer ↗', exact: true });
  await opener.click();
  const drawer = page.getByRole('dialog', { name: 'Exercise details' });
  await expect(drawer.locator('.close-btn')).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('inert', '');
  await expect(page.locator('.navigation-wrapper')).toHaveAttribute('inert', '');
  await page.keyboard.press('Escape');
  await expect(drawer).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');
});

test('Day 1 guidance is keyboard-accessible without toggling the timer and stays within mobile width', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startCourse(page);
  await page.locator('.reference-guide > summary').first().click();
  await page.locator('.reference-guide > summary').nth(1).click();
  const warmup = page.locator('summary').filter({ hasText: 'How to practise · Part A' });
  await warmup.focus();
  await page.keyboard.press('Space');
  await expect(warmup.locator('..')).toHaveAttribute('open', '');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
  const image = page.getByRole('img', { name: /Three stages: place two endpoint dots/ });
  await expect(image).toBeVisible();
  expect(await image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Focus Mode', exact: true }).click();
  const why = page.locator('.focus-modal summary').filter({ hasText: 'Why rehearse before drawing?' });
  await why.focus();
  await page.keyboard.press('Space');
  await expect(why.locator('..')).toHaveAttribute('open', '');
  await expect(page.locator('.focus-modal').getByRole('button', { name: 'Start (Space)', exact: true })).toBeVisible();
});

test('setup demonstrations load on demand and unload when collapsed', async ({ page }) => {
  await startCourse(page);
  await page.locator('.reference-guide > summary').first().click();
  const setup = page.getByRole('region', { name: 'Before you start drawing', exact: true });
  await expect(setup.locator('iframe')).toHaveCount(0);
  await setup.locator('summary').click();
  await setup.getByRole('button', { name: 'Holding your pen', exact: true }).click();
  await expect(setup.locator('iframe')).toHaveAttribute('src', /_IR8zH4RCfU/);
  await setup.getByRole('button', { name: 'Wrist, elbow and shoulder', exact: true }).click();
  await expect(setup.locator('iframe')).toHaveCount(1);
  await expect(setup.locator('iframe')).toHaveAttribute('src', /0_AdsK8x9Lw/);
  await setup.locator('summary').click();
  await expect(setup.locator('iframe')).toHaveCount(0);
});
