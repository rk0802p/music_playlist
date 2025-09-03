import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools()
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.ts', '.vue', '.json']
  },
  optimizeDeps: {
    include: ['jwt-decode', 'vue', 'vue-router', 'pinia']
  },
  build: {
    target: 'es2015',
    minify: 'esbuild', // Use esbuild instead of terser for better compatibility
    cssMinify: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          'axios': ['axios'],
          'utils': ['jwt-decode']
        }
      }
    },
    // Remove terser options since we're using esbuild
    esbuild: {
      drop: ['console', 'debugger']
    }
  },
  server: {
    headers: {
      'Cache-Control': 'public, max-age=31536000'
    }
  }
});
