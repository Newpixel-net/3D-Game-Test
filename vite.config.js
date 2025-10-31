import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
    return {
        root: './',
        publicDir: 'public',
        // Use base path only for production (GitHub Pages), not dev
        base: command === 'build' ? '/3D-Game-Test/' : '/',
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
    };
});
