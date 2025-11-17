import { defineConfig } from 'vite';
// import { analyzer } from 'vite-bundle-analyzer';
// import TestPlugin from './unplugin-vite.js';

export default defineConfig({
  // plugins: [TestPlugin({}), analyzer()],
  build: {
    lib: {
      entry: './src/test/entrypoint.ts',
      formats: ['es'],
      fileName: 'output',
    },
    minify: false,
    outDir: './src/test/dist',
  },
  logLevel: 'info',
});
