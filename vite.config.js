import { defineConfig } from 'vite';
import path from 'path';
import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    alias: {
      $components: path.resolve('./src/lib/components'),
      $db: path.resolve('./src/lib/db'),
      $def: path.resolve('./src/lib/def'),
      $helpers: path.resolve('./src/lib/helpers'),
      $lib: path.resolve('./src/lib'),
      $api: path.resolve('./src/lib/api'),
    },
  },
});
