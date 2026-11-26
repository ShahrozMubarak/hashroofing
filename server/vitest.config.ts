import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    fileParallelism: false,
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      RESEND_API_KEY: '',
      CONTACT_RECIPIENT_EMAIL: '',
      RESEND_FROM_EMAIL: 'Auren Roofing <estimates@your-verified-domain.com>',
    },
  },
});
