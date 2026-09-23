declare const process: { env: Record<string, string | undefined> };
import { convexAuth, createAccount } from '@convex-dev/auth/server';
import { ConvexCredentials } from '@convex-dev/auth/providers/ConvexCredentials';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { DataModel } from './_generated/dataModel';

const googleKeys = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [ConvexCredentials<DataModel>({
    id: 'google-gis',
    authorize: async (params, ctx) => {
      if (typeof params.credential !== 'string' || !process.env.GOOGLE_CLIENT_ID) return null;
      const { payload } = await jwtVerify(params.credential, googleKeys, {
        algorithms: ['RS256'],
        issuer: ['https://accounts.google.com', 'accounts.google.com'],
        audience: process.env.GOOGLE_CLIENT_ID,
        requiredClaims: ['sub', 'exp', 'iat'],
      });
      if (!payload.sub) return null;
      const { user } = await createAccount(ctx, {
        provider: 'google-gis',
        account: { id: payload.sub },
        profile: {
          name: typeof payload.name === 'string' ? payload.name : 'Artist',
          googleTokenIdentifier: `https://accounts.google.com|${payload.sub}`,
        },
      });
      return { userId: user._id };
    },
  })],
  session: { totalDurationMs: 30 * 24 * 60 * 60 * 1000, inactiveDurationMs: 7 * 24 * 60 * 60 * 1000 },
  jwt: { durationMs: process.env.AUTH_JWT_DURATION_MS ? Math.max(30_000, Number(process.env.AUTH_JWT_DURATION_MS)) : 10 * 60 * 1000 },
});
