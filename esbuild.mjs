import { build } from 'esbuild';

build({
    entryPoints: ['src/index.browser.ts'],
    platform: 'browser',
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.browser.mjs',
    define: {
        'process.env.NODE_ENV': '"production"',
    },
});

build({
    entryPoints: ['src/index.browser.ts'],
    platform: 'browser',
    bundle: true,
    format: 'cjs',
    outfile: 'dist/index.browser.js',
    define: {
        'process.env.NODE_ENV': '"production"',
    },
});

build({
    entryPoints: ['src/index.ts'],
    platform: 'node',
    bundle: true,
    format: 'esm',
    outfile: 'dist/index.mjs',
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    external: ['node-fetch'],
});

build({
    entryPoints: ['src/index.ts'],
    platform: 'node',
    bundle: true,
    format: 'cjs',
    outfile: 'dist/index.js',
    define: {
        'process.env.NODE_ENV': '"production"',
    },
    external: ['node-fetch'],
});
