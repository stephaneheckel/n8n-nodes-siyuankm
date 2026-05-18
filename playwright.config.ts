import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: './tests/playwright',
	timeout: 60_000,
	fullyParallel: false,
	reporter: [['list']],
	use: {
		baseURL: process.env.N8N_URL || 'http://10.0.0.108:5678',
		actionTimeout: 15_000,
		navigationTimeout: 30_000,
		headless: true,
	},
});
