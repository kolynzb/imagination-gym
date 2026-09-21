import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const memberDocValidator = v.object({
  _id: v.id("members"),
  _creationTime: v.number(),
  roomCode: v.string(),
  name: v.string(),
  week: v.number(),
  day: v.number(),
  hours: v.number(),
  streak: v.number(),
  doneJson: v.optional(v.string()),
  lastActive: v.number(),
});

export const getMembers = query({
  args: { roomCode: v.string() },
  returns: v.array(memberDocValidator),
  handler: async (ctx, args) => {
    const code = args.roomCode.toUpperCase().trim();
    return await ctx.db
      .query("members")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", code))
      .take(100);
  },
});

export const getMemberProgress = query({
  args: { roomCode: v.string(), name: v.string() },
  returns: v.union(v.null(), memberDocValidator),
  handler: async (ctx, args) => {
    const code = args.roomCode.toUpperCase().trim();
    const name = args.name.trim();
    return await ctx.db
      .query("members")
      .withIndex("by_roomCode_and_name", (q) => q.eq("roomCode", code).eq("name", name))
      .first();
  },
});

export const getCritPosts = query({
  args: { roomCode: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("critPosts"),
      _creationTime: v.number(),
      roomCode: v.string(),
      authorName: v.string(),
      week: v.number(),
      day: v.number(),
      storageId: v.id("_storage"),
      prompt: v.string(),
      createdAt: v.number(),
      imageUrl: v.union(v.string(), v.null()),
    })
  ),
  handler: async (ctx, args) => {
    const code = args.roomCode.toUpperCase().trim();
    const posts = await ctx.db
      .query("critPosts")
      .withIndex("by_roomCode", (q) => q.eq("roomCode", code))
      .order("desc")
      .take(50);

    return await Promise.all(
      posts.map(async (post) => ({
        ...post,
        imageUrl: await ctx.storage.getUrl(post.storageId),
      }))
    );
  },
});

export const signInOrRegister = mutation({
  args: {
    roomCode: v.string(),
    name: v.string(),
  },
  returns: v.union(v.null(), memberDocValidator),
  handler: async (ctx, args) => {
    const code = args.roomCode.toUpperCase().trim();
    const name = args.name.trim();
    if (!code || !name) throw new Error("Room code and name are required");

    // Ensure room exists
    const room = await ctx.db
      .query("rooms")
      .withIndex("by_code", (q) => q.eq("code", code))
      .first();

    if (!room) {
      await ctx.db.insert("rooms", {
        code,
        name: `${code} Crew`,
        createdAt: Date.now(),
      });
    }

    // Find member
    let member = await ctx.db
      .query("members")
      .withIndex("by_roomCode_and_name", (q) => q.eq("roomCode", code).eq("name", name))
      .first();

    if (!member) {
      const newId = await ctx.db.insert("members", {
        roomCode: code,
        name,
        week: 1,
        day: 1,
        hours: 0,
        streak: 0,
        lastActive: Date.now(),
      });
      member = await ctx.db.get(newId);
    } else {
      await ctx.db.patch(member._id, {
        lastActive: Date.now(),
      });
    }

    return member;
  },
});

export const syncProgress = mutation({
  args: {
    roomCode: v.string(),
    name: v.string(),
    week: v.number(),
    day: v.number(),
    hours: v.number(),
    streak: v.number(),
    doneJson: v.optional(v.string()),
  },
  returns: v.id("members"),
  handler: async (ctx, args) => {
    const code = args.roomCode.toUpperCase().trim();
    const name = args.name.trim();
    if (!code || !name) throw new Error("Room code and name required");

    const existingMember = await ctx.db
      .query("members")
      .withIndex("by_roomCode_and_name", (q) => q.eq("roomCode", code).eq("name", name))
      .first();

    if (existingMember) {
      await ctx.db.patch(existingMember._id, {
        week: args.week,
        day: args.day,
        hours: args.hours,
        streak: args.streak,
        doneJson: args.doneJson ?? existingMember.doneJson,
        lastActive: Date.now(),
      });
      return existingMember._id;
    } else {
      return await ctx.db.insert("members", {
        roomCode: code,
        name,
        week: args.week,
        day: args.day,
        hours: args.hours,
        streak: args.streak,
        doneJson: args.doneJson,
        lastActive: Date.now(),
      });
    }
  },
});

export const generateUploadUrl = mutation({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

export const postCrit = mutation({
  args: {
    roomCode: v.string(),
    authorName: v.string(),
    week: v.number(),
    day: v.number(),
    storageId: v.id("_storage"),
    prompt: v.string(),
  },
  returns: v.id("critPosts"),
  handler: async (ctx, args) => {
    const code = args.roomCode.toUpperCase().trim();
    return await ctx.db.insert("critPosts", {
      roomCode: code,
      authorName: args.authorName.trim(),
      week: args.week,
      day: args.day,
      storageId: args.storageId,
      prompt: args.prompt.trim(),
      createdAt: Date.now(),
    });
  },
});
