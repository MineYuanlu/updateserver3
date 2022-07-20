import { defineConfig } from 'vite';
import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: path.resolve('./src/lib/components'),
      $database: path.resolve('./src/lib/database'),
      $defs: path.resolve('./src/lib/defs'),
      $helpers: path.resolve('./src/lib/helpers'),
      $lib: path.resolve('./src/lib'),
    },
  },
});
