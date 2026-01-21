import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.spec.ts'],
    setupFiles: ['src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/app/**/*.ts'],
      exclude: [
        '**/*.spec.ts',
        '**/test-setup.ts',
        '**/*.model.ts',
        '**/app.config.ts',
        '**/app.routes.ts',
        '**/main.ts',
        '**/index.ts',
        '**/*.d.ts'
      ],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50
      }
    }
  }
});
