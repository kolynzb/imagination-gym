import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(),
    name: v.string(),
    createdAt: v.number(),
    memberCount: v.optional(v.number()),
  }).index("by_code", ["code"]),

  members: defineTable({
    roomCode: v.string(),
    name: v.string(),
    week: v.number(),
    day: v.number(),
    hours: v.number(),
    streak: v.number(),
    doneJson: v.optional(v.string()),
    progressVersion: v.optional(v.number()),
    lastActive: v.number(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    // Legacy authId was supplied by clients and cannot establish ownership.
    authId: v.optional(v.string()),
    tokenIdentifier: v.optional(v.string()),
  })
    .index("by_roomCode", ["roomCode"])
    .index("by_roomCode_and_name", ["roomCode", "name"])
    .index("by_email", ["email"])
    .index("by_roomCode_and_tokenIdentifier", ["roomCode", "tokenIdentifier"]),

  critPosts: defineTable({
    roomCode: v.string(),
    authorName: v.string(),
    ownerTokenIdentifier: v.optional(v.string()),
    week: v.number(),
    day: v.number(),
    storageId: v.id("_storage"),
    prompt: v.string(),
    createdAt: v.number(),
  }).index("by_roomCode", ["roomCode"]),
});
