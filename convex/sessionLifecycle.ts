import { internalMutation } from './_generated/server';
import { internal } from "./_generated/api";
import { v } from 'convex/values';

export const expire = internalMutation({
  args: { sessionId: v.id('authSessions') },
  returns: v.null(),
  handler: async (ctx, { sessionId }) => {
    const session = await ctx.db.get(sessionId);
    if (session && session.expirationTime > Date.now()) return null;
    if (session) await ctx.db.delete(sessionId);
    const tokens = await ctx.db.query('authRefreshTokens').withIndex('sessionId', q => q.eq('sessionId', sessionId)).take(100);
    for (const token of tokens) await ctx.db.delete(token._id);
    if (tokens.length === 100) await ctx.scheduler.runAfter(0, internal.sessionLifecycle.expire, { sessionId });
    return null;
  },
});
