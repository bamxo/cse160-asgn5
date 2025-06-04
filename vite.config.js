export default {
  root: './',
  base: '/cse160-asgn5/',
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  optimizeDeps: {
    include: ['three']
  },
  define: {
    // Ensure proper polyfills for Node.js APIs
    'process.env': {},
    'global': {}
  }
} 