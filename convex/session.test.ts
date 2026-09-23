/// <reference types="vite/client" />
import { convexTest } from 'convex-test';
import { makeFunctionReference } from 'convex/server';
import { describe, expect, test, vi } from 'vitest';
import { api } from './_generated/api';
import schema from './schema';

const modules = import.meta.glob('./**/*.ts');
const current = makeFunctionReference<'mutation'>('session:current');
const status = makeFunctionReference<'query'>('session:status');
const authSignIn = makeFunctionReference<'action'>('auth:signIn');
const progress = JSON.stringify({
  done: { w3d2p0: true }, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
  start: '2026-09-22', cw: 3, cd: 2, paceFlex: false, kitChecked: {}, theme: 'light', onboarded: true,
});

async function addAuthSession(t: ReturnType<typeof convexTest>, googleSubject: string, name: string) {
  const googleTokenIdentifier = `https://accounts.google.com|${googleSubject}`;
  const { userId, sessionId } = await t.run(async ctx => {
    const userId = await ctx.db.insert('users', { name, googleTokenIdentifier });
    const sessionId = await ctx.db.insert('authSessions', {
      userId,
      expirationTime: Date.now() + 60_000,
    });
    return { userId, sessionId };
  });
  const client = t.withIdentity({
    issuer: 'https://example.convex.site',
    subject: `${userId}|${sessionId}`,
    tokenIdentifier: `https://example.convex.site|${userId}|${sessionId}`,
  });
  return { client, googleTokenIdentifier, userId, sessionId };
}

describe('persistent Google session ownership', () => {
  test('distinguishes anonymous token negotiation from a revoked session', async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(status, {})).toBeNull();

    const alice = await addAuthSession(t, 'alice-sub', 'Alice');
    expect(await alice.client.query(status, {})).toBe(alice.googleTokenIdentifier);

    await t.run(ctx => ctx.db.delete(alice.sessionId));
    expect(await alice.client.query(status, {})).toBe(false);
  });

  test('maps a Convex Auth session to existing Google-owned progress', async () => {
    const t = convexTest(schema, modules);
    const alice = await addAuthSession(t, 'alice-sub', 'Alice');
    const google = t.withIdentity({
      issuer: 'https://accounts.google.com', subject: 'alice-sub',
      tokenIdentifier: alice.googleTokenIdentifier,
    });
    const original = await google.mutation(api.crew.signInOrRegister, { roomCode: 'STUDIO', name: 'Alice' });
    await google.mutation(api.crew.syncProgress, {
      roomCode: 'STUDIO', week: 3, day: 2, hours: 12, streak: 4,
      doneJson: progress, expectedVersion: 0,
    });

    expect(await alice.client.mutation(current, {})).toEqual({ name: 'Alice', account: alice.googleTokenIdentifier });
    const restored = await alice.client.mutation(api.crew.signInOrRegister, { name: 'Alice' });
    expect(restored.created).toBe(false);
    expect(restored.member._id).toBe(original.member._id);
    expect(restored.member.roomCode).toBe('STUDIO');
    expect(restored.member.doneJson).toBe(progress);
    expect(restored.member.progressVersion).toBe(1);
  });

  test('keeps different Google subjects separate, even in the same room', async () => {
    const t = convexTest(schema, modules);
    const alice = await addAuthSession(t, 'alice-sub', 'Shared name');
    const bob = await addAuthSession(t, 'bob-sub', 'Shared name');
    await alice.client.mutation(api.crew.signInOrRegister, { roomCode: 'STUDIO', name: 'Shared name' });
    await bob.client.mutation(api.crew.signInOrRegister, { roomCode: 'STUDIO', name: 'Shared name' });
    await alice.client.mutation(api.crew.syncProgress, {
      roomCode: 'STUDIO', week: 3, day: 2, hours: 12, streak: 4,
      doneJson: progress, expectedVersion: 0,
    });

    expect((await alice.client.query(api.crew.getMyProgress, { roomCode: 'STUDIO' }))?.doneJson).toBe(progress);
    expect((await bob.client.query(api.crew.getMyProgress, { roomCode: 'STUDIO' }))?.doneJson).toBeUndefined();
    expect((await bob.client.mutation(current, {})).account).toBe(bob.googleTokenIdentifier);
  });

  test('denies anonymous, deleted-session, and mismatched-session identities', async () => {
    const t = convexTest(schema, modules);
    await expect(t.mutation(current, {})).rejects.toThrow('Sign in');
    await expect(t.mutation(api.crew.signInOrRegister, { name: 'Anonymous' })).rejects.toThrow('Sign in');

    const alice = await addAuthSession(t, 'alice-sub', 'Alice');
    const bob = await addAuthSession(t, 'bob-sub', 'Bob');
    const mismatched = t.withIdentity({
      issuer: 'https://example.convex.site',
      subject: `${alice.userId}|${bob.sessionId}`,
      tokenIdentifier: `https://example.convex.site|${alice.userId}|${bob.sessionId}`,
    });
    await expect(mismatched.mutation(current, {})).rejects.toThrow('Sign in');
    await t.run(ctx => ctx.db.delete(alice.sessionId));
    await expect(alice.client.mutation(current, {})).rejects.toThrow('Sign in');
    await expect(alice.client.mutation(api.crew.signInOrRegister, { name: 'Alice' })).rejects.toThrow('Sign in');
  });

  test('denies mutations when the auth session has expired', async () => {
    const t = convexTest(schema, modules);
    const alice = await addAuthSession(t, 'alice-sub', 'Alice');
    await t.run(ctx => ctx.db.patch(alice.sessionId, { expirationTime: Date.now() - 1 }));

    await expect(alice.client.mutation(current, {})).rejects.toThrow('Sign in');
    await expect(alice.client.mutation(api.crew.signInOrRegister, {
      roomCode: 'STUDIO', name: 'Alice',
    })).rejects.toThrow('Sign in');
    expect(await t.run(ctx => ctx.db.query('members').take(1))).toEqual([]);
  });

  test('scheduled session expiry removes read access after the deadline', async () => {
    const t = convexTest(schema, modules);
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-09-23T12:00:00Z'));
      const alice = await addAuthSession(t, 'alice-sub', 'Alice');
      await alice.client.mutation(current, {});
      await alice.client.mutation(api.crew.signInOrRegister, { roomCode: 'STUDIO', name: 'Alice' });
      expect(await alice.client.query(api.crew.getMyProgress, { roomCode: 'STUDIO' })).not.toBeNull();

      vi.advanceTimersByTime(60_001);
      await t.finishInProgressScheduledFunctions();
      expect(await t.run(ctx => ctx.db.get(alice.sessionId))).toBeNull();
      await expect(alice.client.query(api.crew.getMyProgress, { roomCode: 'STUDIO' })).rejects.toThrow('Sign in');
    } finally {
      vi.useRealTimers();
    }
  });

  test('rejects a forged Google credential before creating an account', async () => {
    const t = convexTest(schema, modules);
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client.apps.googleusercontent.com');
    try {
      await expect(t.action(authSignIn, {
        provider: 'google-gis', params: { credential: 'forged.google.credential' },
      })).rejects.toThrow();
      const accounts = await t.run(ctx => ctx.db.query('authAccounts').take(1));
      const users = await t.run(ctx => ctx.db.query('users').take(1));
      expect(accounts).toEqual([]);
      expect(users).toEqual([]);
    } finally {
      vi.unstubAllEnvs();
    }
  });
});
