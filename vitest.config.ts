import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['app/admin/**/*.test.ts', 'app/lib/rbac.test.ts'],
  },
});
