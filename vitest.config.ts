import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      {
        resolve: { conditions: ['browser'] },
        test: {
          name: 'app',
          environment: 'node',
          include: ['tests/**/*.test.ts'],
          env: { VITE_CONVEX_URL: '', VITE_GOOGLE_CLIENT_ID: '', TZ: 'Africa/Kampala' },
        },
      },
      {
        test: {
          name: 'backend',
          environment: 'edge-runtime',
          include: ['convex/**/*.test.ts'],
        },
      },
    ],
  },
});
