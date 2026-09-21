import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  rooms: defineTable({
    code: v.string(), // uppercase room code, e.g. "GYM-CREW"
    name: v.string(),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  members: defineTable({
    roomCode: v.string(),
    name: v.string(),
    week: v.number(),
    day: v.number(),
    hours: v.number(),
    streak: v.number(),
    doneJson: v.optional(v.string()), // Full serialized checklist & notes for cross-device sync
    lastActive: v.number(),
    email: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    authId: v.optional(v.string()),
  })
    .index("by_roomCode", ["roomCode"])
    .index("by_roomCode_and_name", ["roomCode", "name"])
    .index("by_email", ["email"]),

  critPosts: defineTable({
    roomCode: v.string(),
    authorName: v.string(),
    week: v.number(),
    day: v.number(),
    storageId: v.id("_storage"), // Convex storage ID for sketch image
    prompt: v.string(), // "What should we look at? (convergence, minor axes, etc.)"
    createdAt: v.number(),
  }).index("by_roomCode", ["roomCode"]),
});
