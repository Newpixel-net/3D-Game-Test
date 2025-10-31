import { defineConfig } from 'vite';

export default defineConfig({
    root: './',
    publicDir: 'public',
    base: '/3D-Game-Test/',
    build: {
        outDir: 'docs',
        emptyOutDir: true,
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
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
        open: false,
        host: true,
    },
    optimizeDeps: {
        include: ['three'],
    },
});
