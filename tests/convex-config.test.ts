import { afterEach, expect, it, vi } from 'vitest';

const client = vi.hoisted(() => ({ urls: [] as string[] }));
vi.mock('convex/browser', () => ({
  ConvexClient: class {
    constructor(url: string) { client.urls.push(url); }
  },
}));

afterEach(() => { vi.unstubAllEnvs(); vi.resetModules(); client.urls.length = 0; });

it('removes a trailing deployment URL slash before constructing the client', async () => {
  vi.stubEnv('VITE_CONVEX_URL', 'https://example.eu-west-1.convex.cloud/');
  vi.stubEnv('VITE_CONVEX_SITE_URL', '');
  const { getConvexSiteUrl } = await import('../src/lib/convex');
  expect(client.urls).toEqual(['https://example.eu-west-1.convex.cloud']);
  expect(getConvexSiteUrl()).toBe('https://example.eu-west-1.convex.site');
});
