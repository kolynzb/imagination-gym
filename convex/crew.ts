import { internalMutation, internalQuery, mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { v } from "convex/values";
import { parseProgress } from "../src/lib/progress";

export const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

export function isSupportedImageType(value: string): boolean {
  return value === "image/jpeg" || value === "image/png" || value === "image/webp";
}

const leaderboardMemberValidator = v.object({
  _id: v.id("members"),
  name: v.string(),
  week: v.number(),
  day: v.number(),
  hours: v.number(),
  streak: v.number(),
  lastActive: v.number(),
  avatarUrl: v.optional(v.string()),
});

const ownMemberValidator = leaderboardMemberValidator.extend({
  roomCode: v.string(),
  doneJson: v.optional(v.string()),
  progressVersion: v.number(),
});

function roomCode(value: string) {
  const code = value.toUpperCase().trim();
  if (!/^[A-Z0-9-]{3,48}$/.test(code)) throw new Error("Use a valid room code");
  return code;
}

function displayName(value: string) {
  const name = value.trim().slice(0, 48);
  if (!name) throw new Error("A display name is required");
  return name;
}

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Sign in with Google to use cloud crew features");
  return identity;
}

async function requireMember(ctx: QueryCtx | MutationCtx, code: string) {
  const identity = await requireIdentity(ctx);
  const member = await ctx.db
    .query("members")
    .withIndex("by_roomCode_and_tokenIdentifier", (q) => q.eq("roomCode", code).eq("tokenIdentifier", identity.tokenIdentifier))
    .first();
  if (!member) throw new Error("Join this room before viewing or posting to it");
  return { identity, member };
}

function asLeaderboardMember(member: Doc<"members">) {
  return {
    _id: member._id,
    name: member.name,
    week: member.week,
    day: member.day,
    hours: member.hours,
    streak: member.streak,
    lastActive: member.lastActive,
    ...(member.avatarUrl ? { avatarUrl: member.avatarUrl } : {}),
  };
}

export const getRoomInfo = query({
  args: { roomCode: v.string() },
  returns: v.union(v.null(), v.object({ code: v.string(), name: v.string(), memberCount: v.number() })),
  handler: async (ctx, args) => {
    const room = await ctx.db.query("rooms").withIndex("by_code", (q) => q.eq("code", roomCode(args.roomCode))).first();
    return room ? { code: room.code, name: room.name, memberCount: room.memberCount ?? 0 } : null;
  },
});

export const getMembers = query({
  args: { roomCode: v.string() },
  returns: v.array(leaderboardMemberValidator),
  handler: async (ctx, args) => {
    const code = roomCode(args.roomCode);
    await requireMember(ctx, code);
    const members = await ctx.db.query("members").withIndex("by_roomCode_and_tokenIdentifier", (q) => q.eq("roomCode", code).gt("tokenIdentifier", undefined)).take(100);
    return members.filter((member) => member.tokenIdentifier !== undefined).map(asLeaderboardMember).sort((a, b) => b.hours - a.hours);
  },
});

export const getMyProgress = query({
  args: { roomCode: v.string() },
  returns: v.union(v.null(), ownMemberValidator),
  handler: async (ctx, args) => {
    const code = roomCode(args.roomCode);
    const { member } = await requireMember(ctx, code);
    return { ...asLeaderboardMember(member), roomCode: member.roomCode, progressVersion: member.progressVersion ?? 0, ...(member.doneJson ? { doneJson: member.doneJson } : {}) };
  },
});

export const getCritPosts = query({
  args: { roomCode: v.string() },
  returns: v.array(v.object({
    _id: v.id("critPosts"), roomCode: v.string(), authorName: v.string(), week: v.number(), day: v.number(),
    prompt: v.string(), createdAt: v.number(), imageUrl: v.union(v.string(), v.null()),
  })),
  handler: async (ctx, args) => {
    const code = roomCode(args.roomCode);
    await requireMember(ctx, code);
    const posts = (await ctx.db.query("critPosts").withIndex("by_roomCode", (q) => q.eq("roomCode", code)).order("desc").take(100))
      .filter((post) => post.ownerTokenIdentifier !== undefined)
      .slice(0, 50);
    return await Promise.all(posts.map(async (post) => ({
      _id: post._id, roomCode: post.roomCode, authorName: post.authorName, week: post.week, day: post.day,
      prompt: post.prompt, createdAt: post.createdAt, imageUrl: await ctx.storage.getUrl(post.storageId),
    })));
  },
});

export const signInOrRegister = mutation({
  args: { roomCode: v.optional(v.string()), name: v.string() },
  returns: v.object({ member: ownMemberValidator, created: v.boolean() }),
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const previous = args.roomCode ? null : await ctx.db.query("members")
      .withIndex("by_tokenIdentifier_and_lastActive", q => q.eq("tokenIdentifier", identity.tokenIdentifier))
      .order("desc").first();
    const code = roomCode(args.roomCode ?? previous?.roomCode ?? "GYM-CREW");
    const name = displayName(args.name);
    let room = await ctx.db.query("rooms").withIndex("by_code", (q) => q.eq("code", code)).first();
    if (!room) {
      const roomId = await ctx.db.insert("rooms", { code, name: `${code} Crew`, createdAt: Date.now(), memberCount: 0 });
      room = await ctx.db.get(roomId);
    }
    if (!room) throw new Error("Could not create room");
    let member = await ctx.db.query("members").withIndex("by_roomCode_and_tokenIdentifier", (q) => q.eq("roomCode", code).eq("tokenIdentifier", identity.tokenIdentifier)).first();
    const created = !member;
    if (!member) {
      const memberId = await ctx.db.insert("members", { roomCode: code, name, week: 1, day: 1, hours: 0, streak: 0, lastActive: Date.now(), tokenIdentifier: identity.tokenIdentifier, ...(identity.pictureUrl ? { avatarUrl: identity.pictureUrl } : {}) });
      await ctx.db.patch(room._id, { memberCount: (room.memberCount ?? 0) + 1 });
      member = await ctx.db.get(memberId);
    } else {
      await ctx.db.patch(member._id, { name, lastActive: Date.now(), ...(identity.pictureUrl ? { avatarUrl: identity.pictureUrl } : {}) });
      member = await ctx.db.get(member._id);
    }
    if (!member) throw new Error("Could not create member");
    return { member: { ...asLeaderboardMember(member), roomCode: member.roomCode, progressVersion: member.progressVersion ?? 0, ...(member.doneJson ? { doneJson: member.doneJson } : {}) }, created };
  },
});

export const syncProgress = mutation({
  args: { roomCode: v.string(), week: v.number(), day: v.number(), hours: v.number(), streak: v.number(), doneJson: v.string(), expectedVersion: v.number() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const code = roomCode(args.roomCode);
    const { member } = await requireMember(ctx, code);
    if (!Number.isInteger(args.week) || args.week < 1 || args.week > 8 || !Number.isInteger(args.day) || args.day < 1 || args.day > 7 || !Number.isFinite(args.hours) || args.hours < 0 || !Number.isFinite(args.streak) || args.streak < 0) throw new Error("Invalid progress values");
    if (!Number.isInteger(args.expectedVersion) || args.expectedVersion !== (member.progressVersion ?? 0)) throw new Error("Cloud progress changed on another device. Sign in again before saving.");
    if (args.doneJson.length > 900_000) throw new Error("Progress is too large to sync");
    let serializedProgress: unknown;
    try {
      serializedProgress = JSON.parse(args.doneJson);
      serializedProgress = parseProgress(serializedProgress);
    } catch {
      throw new Error("Progress data is invalid");
    }
    const progressVersion = (member.progressVersion ?? 0) + 1;
    await ctx.db.patch(member._id, { week: args.week, day: args.day, hours: args.hours, streak: args.streak, doneJson: JSON.stringify(serializedProgress), progressVersion, lastActive: Date.now() });
    return progressVersion;
  },
});

export const canUploadCrit = internalQuery({
  args: { roomCode: v.string(), tokenIdentifier: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const member = await ctx.db.query("members").withIndex("by_roomCode_and_tokenIdentifier", (q) => q.eq("roomCode", roomCode(args.roomCode)).eq("tokenIdentifier", args.tokenIdentifier)).first();
    return member !== null;
  },
});

export const recordUploadedCrit = internalMutation({
  args: { roomCode: v.string(), tokenIdentifier: v.string(), week: v.number(), day: v.number(), storageId: v.id("_storage"), contentType: v.string(), size: v.number(), prompt: v.string() },
  returns: v.id("critPosts"),
  handler: async (ctx, args) => {
    const code = roomCode(args.roomCode);
    if (!Number.isInteger(args.week) || args.week < 1 || args.week > 8 || !Number.isInteger(args.day) || args.day < 1 || args.day > 7) throw new Error("Invalid week or day");
    if (!isSupportedImageType(args.contentType) || !Number.isInteger(args.size) || args.size <= 0 || args.size > MAX_IMAGE_BYTES) throw new Error("Use a JPG, PNG, or WebP image under 8 MB");
    const prompt = args.prompt.trim().slice(0, 500);
    if (!prompt) throw new Error("Add a short critique prompt");
    const member = await ctx.db.query("members").withIndex("by_roomCode_and_tokenIdentifier", (q) => q.eq("roomCode", code).eq("tokenIdentifier", args.tokenIdentifier)).first();
    if (!member) throw new Error("Join this room before posting to it");
    const metadata = await ctx.db.system.get("_storage", args.storageId);
    if (!metadata || (metadata.contentType !== undefined && (!isSupportedImageType(metadata.contentType) || metadata.contentType !== args.contentType)) || metadata.size !== args.size || metadata.size > MAX_IMAGE_BYTES) throw new Error("Uploaded image did not match the approved file");
    const postId = await ctx.db.insert("critPosts", { roomCode: code, authorName: member.name, ownerTokenIdentifier: args.tokenIdentifier, week: args.week, day: args.day, storageId: args.storageId, prompt, createdAt: Date.now() });
    return postId;
  },
});
