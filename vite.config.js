import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    publicDir: './',
    base: './',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'terser',
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                },
            },
        },
    },
    server: {
        port: 3000,
        open: true,
        host: true,
    },
    optimizeDeps: {
        include: ['three', 'cannon-es', 'gsap'],
    },
});
