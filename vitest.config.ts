import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: [
      'app/admin/**/*.test.ts',
      'app/lib/rbac.test.ts',
      'app/api/admin/**/*.test.ts',
      'app/api/products/filter/**/*.test.ts',
    ],
  },
});
