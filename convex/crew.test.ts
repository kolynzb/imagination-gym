/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { describe, expect, test } from "vitest";
import { api } from "./_generated/api";
import { internal } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");
const progress = (done: Record<string, boolean> = {}, cw = 1, cd = 1) => JSON.stringify({
  done, dayHours: {}, dayNotes: {}, weekNotes: {}, ms: {}, counters: {},
  start: '2026-09-22', cw, cd, paceFlex: false, kitChecked: {}, theme: 'light', onboarded: true,
});

describe("Crew authorization", () => {
  test("sign-in creates an account without requiring room setup", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    const result = await alice.mutation(api.crew.signInOrRegister, { name: "Alice" });
    expect(result.member.roomCode).toBe("GYM-CREW");
    expect(result.created).toBe(true);
    await expect(t.mutation(api.crew.signInOrRegister, { name: "Alice" })).rejects.toThrow("Sign in");
  });

  test("sign-in restores only the caller's most recently used room", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    const bob = t.withIdentity({ tokenIdentifier: "google|bob", subject: "bob" });
    const first = await alice.mutation(api.crew.signInOrRegister, { name: "Alice", roomCode: "FIRST" });
    const latest = await alice.mutation(api.crew.signInOrRegister, { name: "Alice", roomCode: "LATEST" });
    await bob.mutation(api.crew.signInOrRegister, { name: "Bob", roomCode: "PRIVATE" });
    await t.run(async ctx => {
      await ctx.db.patch(first.member._id, { lastActive: 100 });
      await ctx.db.patch(latest.member._id, { lastActive: 200, doneJson: progress({ w3d2p0: true }, 3, 2), week: 3, day: 2 });
    });
    const restored = await alice.mutation(api.crew.signInOrRegister, { name: "Alice" });
    expect(restored.member.roomCode).toBe("LATEST");
    expect(restored.member.doneJson).toContain("w3d2p0");
    expect(restored.created).toBe(false);
  });

  test("denies unauthenticated reads and writes", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.crew.getMembers, { roomCode: "PRIVATE" })).rejects.toThrow("Sign in");
    await expect(t.mutation(api.crew.syncProgress, {
      roomCode: "PRIVATE", week: 1, day: 1, hours: 0, streak: 0, expectedVersion: 0, doneJson: "{}",
    })).rejects.toThrow("Sign in");
  });

  test("isolates members, returns safe leaderboard data, and restores only the caller", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    const bob = t.withIdentity({ tokenIdentifier: "google|bob", subject: "bob" });
    await alice.mutation(api.crew.signInOrRegister, { roomCode: "STUDIO-A", name: "Alice" });
    await bob.mutation(api.crew.signInOrRegister, { roomCode: "STUDIO-A", name: "Bob" });
    await alice.mutation(api.crew.syncProgress, {
      roomCode: "STUDIO-A", week: 3, day: 2, hours: 12, streak: 4, expectedVersion: 0, doneJson: progress({ w3d2p0: true }, 3, 2),
    });

    const members = await alice.query(api.crew.getMembers, { roomCode: "STUDIO-A" });
    expect(members).toHaveLength(2);
    expect(members[0]).not.toHaveProperty("authId");
    expect(members[0]).not.toHaveProperty("email");
    expect((await alice.query(api.crew.getMyProgress, { roomCode: "STUDIO-A" }))?.doneJson).toContain("w3d2p0");
    expect((await bob.query(api.crew.getMyProgress, { roomCode: "STUDIO-A" }))?.doneJson).toBeUndefined();

    await expect(bob.mutation(api.crew.syncProgress, {
      roomCode: "OTHER-ROOM", week: 8, day: 7, hours: 99, streak: 9, expectedVersion: 0, doneJson: "{}",
    })).rejects.toThrow("Join this room");
  });

  test("does not authorize legacy authId records or expose legacy posts", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    await t.run(async (ctx) => {
      await ctx.db.insert("rooms", { code: "LEGACY", name: "Legacy", createdAt: 1, memberCount: 1 });
      for (let i = 0; i < 100; i++) {
        await ctx.db.insert("members", { roomCode: "LEGACY", name: "Impostor", week: 1, day: 1, hours: 0, streak: 0, lastActive: 1, authId: "google|alice" });
      }
    });
    await expect(alice.query(api.crew.getMembers, { roomCode: "LEGACY" })).rejects.toThrow("Join this room");

    await alice.mutation(api.crew.signInOrRegister, { roomCode: "LEGACY", name: "Alice" });
    expect(await alice.query(api.crew.getMembers, { roomCode: "LEGACY" })).toHaveLength(1);
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["legacy"], { type: "image/png" })));
    await t.run((ctx) => ctx.db.insert("critPosts", { roomCode: "LEGACY", authorName: "Impostor", week: 1, day: 1, storageId, prompt: "legacy", createdAt: 1 }));
    expect(await alice.query(api.crew.getCritPosts, { roomCode: "LEGACY" })).toEqual([]);
  });

  test("rejects malformed progress without overwriting the last valid progress", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    await alice.mutation(api.crew.signInOrRegister, { roomCode: "PROGRESS", name: "Alice" });
    const valid = progress({ w1d1p0: true });
    await alice.mutation(api.crew.syncProgress, { roomCode: "PROGRESS", week: 1, day: 1, hours: 1, streak: 1, expectedVersion: 0, doneJson: valid });
    await expect(alice.mutation(api.crew.syncProgress, { roomCode: "PROGRESS", week: 1, day: 1, hours: 2, streak: 2, expectedVersion: 1, doneJson: "{not json" })).rejects.toThrow("Progress data is invalid");
    expect((await alice.query(api.crew.getMyProgress, { roomCode: "PROGRESS" }))?.doneJson).toBe(valid);
  });

  test("persists a timer checkpoint and returns it with a revision conflict", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    await alice.mutation(api.crew.signInOrRegister, { roomCode: "TIMERS", name: "Alice" });
    const timer = { timerMode: "countdown", timerPartIndex: 0, timerTargetSeconds: 600,
      timerRemaining: 535, timerElapsed: 65, timerRunning: false, timerStartedAt: null };
    const payload = { roomCode: "TIMERS", week: 1, day: 1, hours: 0, streak: 0, expectedVersion: 0,
      doneJson: JSON.stringify({ ...JSON.parse(progress()), timer }) };
    await alice.mutation(api.crew.syncProgress, payload);
    const saved = await alice.query(api.crew.getMyProgress, { roomCode: "TIMERS" });
    expect(JSON.parse(saved!.doneJson!).timer).toEqual(timer);
    await expect(alice.mutation(api.crew.syncProgress, payload)).rejects.toMatchObject({
      data: { code: "PROGRESS_CONFLICT", progressVersion: 1, doneJson: saved!.doneJson },
    });
  });

  test("rejects stale device writes instead of replacing newer progress", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    await alice.mutation(api.crew.signInOrRegister, { roomCode: "VERSIONS", name: "Alice" });
    const payload = { roomCode: "VERSIONS", week: 1, day: 1, hours: 0, streak: 0, expectedVersion: 0, doneJson: progress({ w1d1p0: true }) };
    expect(await alice.mutation(api.crew.syncProgress, payload)).toBe(1);
    await expect(alice.mutation(api.crew.syncProgress, { ...payload, doneJson: progress() })).rejects.toMatchObject({ data: { code: "PROGRESS_CONFLICT", progressVersion: 1, doneJson: expect.any(String) } });
    expect((await alice.query(api.crew.getMyProgress, { roomCode: "VERSIONS" }))?.doneJson).toBe(payload.doneJson);
  });

  test("private recording rejects a known, unowned storage id and requires membership", async () => {
    const t = convexTest(schema, modules);
    const storageId = await t.run((ctx) => ctx.storage.store(new Blob(["sketch"], { type: "image/png" })));
    await expect(t.mutation(internal.crew.recordUploadedCrit, {
      roomCode: "PRIVATE", tokenIdentifier: "google|alice", week: 1, day: 1, storageId, contentType: "image/png", size: 6, prompt: "Review this",
    })).rejects.toThrow("Join this room");
  });

  test("HTTP upload rejects anonymous and non-members without creating posts", async () => {
    const t = convexTest(schema, modules);
    const request = {
      method: "POST",
      headers: { Authorization: "Bearer test", "Content-Type": "image/png", "X-Crit-Room-Code": "UPLOAD", "X-Crit-Week": "1", "X-Crit-Day": "1", "X-Crit-Size": "6", "X-Crit-Prompt": "Review this" },
      body: new Blob(["sketch"], { type: "image/png" }),
    };
    expect((await t.fetch("/crit-upload", request)).status).toBe(401);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    expect((await alice.fetch("/crit-upload", request)).status).toBe(403);
  });

  test("HTTP upload stores a fresh owned blob and records a valid post", async () => {
    const t = convexTest(schema, modules);
    const alice = t.withIdentity({ tokenIdentifier: "google|alice", subject: "alice" });
    await alice.mutation(api.crew.signInOrRegister, { roomCode: "UPLOAD", name: "Alice" });
    const oldStorageId = await t.run((ctx) => ctx.storage.store(new Blob(["sketch"], { type: "image/png" })));
    const failedResponse = await alice.fetch("/crit-upload", {
      method: "POST",
      headers: { Authorization: "Bearer test", "Content-Type": "image/png", "X-Crit-Room-Code": "UPLOAD", "X-Crit-Week": "1", "X-Crit-Day": "1", "X-Crit-Size": "7", "X-Crit-Prompt": "Review this" },
      body: new Blob(["sketch"], { type: "image/png" }),
    });
    expect(failedResponse.status).toBe(400);
    expect(await alice.query(api.crew.getCritPosts, { roomCode: "UPLOAD" })).toEqual([]);
    const response = await alice.fetch("/crit-upload", {
      method: "POST",
      headers: { Authorization: "Bearer test", "Content-Type": "image/png", "X-Crit-Room-Code": "UPLOAD", "X-Crit-Week": "1", "X-Crit-Day": "1", "X-Crit-Size": "6", "X-Crit-Prompt": "Review this" },
      body: new Blob(["sketch"], { type: "image/png" }),
    });
    expect(response.status).toBe(201);
    const posts = await alice.query(api.crew.getCritPosts, { roomCode: "UPLOAD" });
    expect(posts).toHaveLength(1);
    const storedPost = await t.run((ctx) => ctx.db.query("critPosts").withIndex("by_roomCode", (q) => q.eq("roomCode", "UPLOAD")).unique());
    expect(storedPost?.storageId).not.toBe(oldStorageId);
  });
});
