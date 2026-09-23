import { getAuthUserId, getAuthSessionId } from '@convex-dev/auth/server';
import type { MutationCtx, QueryCtx } from './_generated/server';

export async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error('Sign in with Google to use cloud crew features');
  if (identity.issuer === 'https://accounts.google.com' || identity.issuer === 'accounts.google.com') return identity;
  const userId = await getAuthUserId(ctx);
  const sessionId = await getAuthSessionId(ctx);
  const user = userId ? await ctx.db.get(userId) : null;
  const session = sessionId ? await ctx.db.get(sessionId) : null;
  if (!user?.googleTokenIdentifier || !session || session.userId !== userId || ('scheduler' in ctx && session.expirationTime <= Date.now())) {
    throw new Error('Sign in with Google to use cloud crew features');
  }
  return { ...identity, tokenIdentifier: user.googleTokenIdentifier, name: user.name };
}
