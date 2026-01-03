import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import fs from 'fs';

const blogDir = resolve("./posts")
const blogFiles = fs.readdirSync(blogDir).filter(file => file.endsWith('.html'));
const input = {
    main: resolve(__dirname, 'index.html')
};

blogFiles.forEach(file => {
    const name = file.replace('.html', '');
    input[name] = resolve(blogDir, file);
});


export default defineConfig({
    base: '/',
    plugins: [vue()],
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            input
        }
    }
});