// vite.config.ts
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom', // Simulate a browser environment for tests
        setupFiles: './src/setupTests.ts', // Run a setup file before tests
        globals: true, // Use Vitest's globals (describe, test, etc.) without importing
    },
});