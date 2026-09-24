import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const extensions = ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'];

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/after-hours/' : '/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^react-native$/, replacement: 'react-native-web' },
    ],
    extensions,
  },
  build: {
    rollupOptions: {
      output: {
        // Keep the stable React runtime cacheable across app-only updates.
        manualChunks(id) {
          if (/node_modules\/(react|react-dom|scheduler)\//.test(id.replaceAll('\\', '/'))) return 'react-runtime';
        },
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: extensions,
    },
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
  },
  server: {
    port: 3000,
    open: false,
  },
});
