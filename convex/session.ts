import { getAuthSessionId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";
import { mutation, query, internalQuery } from './_generated/server';
import { v } from 'convex/values';
import { requireIdentity } from './identity';

export const current = mutation({
  args: {},
  returns: v.object({ name: v.string(), account: v.string() }),
  handler: async ctx => {
    const identity = await requireIdentity(ctx);
    const sessionId = await getAuthSessionId(ctx);
    if (identity.issuer !== 'https://accounts.google.com' && identity.issuer !== 'accounts.google.com' && sessionId) {
      const session = await ctx.db.get(sessionId);
      if (!session || session.expirationTime <= Date.now()) throw new Error('Sign in again to continue.');
      if (!session.expiryScheduled) {
        await ctx.scheduler.runAt(session.expirationTime, internal.sessionLifecycle.expire, { sessionId });
        await ctx.db.patch(sessionId, { expiryScheduled: true });
      }
    }
    return { name: identity.name || 'Artist', account: identity.tokenIdentifier };
  },
});

export const uploadIdentity = internalQuery({
  args: {},
  returns: v.string(),
  handler: async ctx => (await requireIdentity(ctx)).tokenIdentifier,
});

export const status = query({
  args: {},
  returns: v.union(v.string(), v.literal(false), v.null()),
  handler: async ctx => {
    if (!await ctx.auth.getUserIdentity()) return null;
    try { return (await requireIdentity(ctx)).tokenIdentifier; }
    catch { return false; }
  },
});
