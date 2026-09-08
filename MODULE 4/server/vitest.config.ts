import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    testTimeout: 10000,
    hookTimeout: 10000,
    globals: true,
    environment: 'node',
    fileParallelism: false,
    env: {
      DATABASE_URL: 'postgresql://postgres:123123@localhost:5432/conformalguardtest',
      RESET_RATE_LIMIT_SECONDS: '60',
    },
  },
});
