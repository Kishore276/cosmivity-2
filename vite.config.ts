import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      // Optimize JSX runtime for better performance
      jsxRuntime: 'automatic'
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    // Enable HMR optimizations
    hmr: {
      overlay: false // Disable error overlay for faster updates
    },
    // Pre-transform known deps
    warmup: {
      // Pre-bundle commonly used files
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/components/**/*',
        './src/pages/**/*'
      ]
    }
  },
  define: {
    global: 'globalThis',
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'framer-motion',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore'
    ],
    // Force re-optimization on dep changes
    force: false
  },
  // Build optimizations that also help dev
  esbuild: {
    // Faster transpilation
    target: 'esnext',
    // Remove console logs in production but keep in dev
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  // Cache configuration
  cacheDir: 'node_modules/.vite'
})
