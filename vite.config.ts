import { defineConfig, normalizePath } from 'vite';
import dts from "vite-plugin-dts";
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';
import { resolve } from 'path';
import glob from "fast-glob";

const entries = {} as Record<string, string>;
glob.sync(['src/**/*.ts']).map((path: string) => {
  // console.log(path);
  /**
   * ex)
   * name: 'base/u-label/index'
   * path: 'src/components/base/u-label/index.ts'
   */
  if(path.includes('model')) return;
  const name = path.replace('src/', '').replace('.ts', '');
  entries[name] = resolve(__dirname, path);
});

export default () => {
  return defineConfig({
    server: {
      port: 5173,
      open: "./tests/index.html",
    },
    publicDir: resolve(__dirname, 'assets'),
    build: {
      target: 'esnext',
      copyPublicDir: true,
      emptyOutDir: true,
      outDir: 'dist',
      lib: {
        entry: entries,
        fileName: (format: string, entry: string): string => {
          return `${entry}.${format}.js`;
        },
        formats: ['es', 'cjs']
      },
      rollupOptions: {
        // Shoelace 외부종속성: lit/*, react, @lit/react
        // 이외 문제 발생가능성: mobx, reflect-metadata
        external: [
          /^lit.*/,
          /^@lit.*/,
          /^@floating-ui.*/,
          'react',
          'mobx',
          'reflect-metadata',
        ],
        // 공통 파일
        output: {
          chunkFileNames: 'shared/[name]-[hash].js',
        }
      }
    },
    plugins: [
      dts({
        include: [ "src/**/*"] 
      }),
      copy({
        targets: [
          {
            src: normalizePath(resolve(__dirname, './src/assets/styles')),
            dest: 'assets'
          }
        ]
      })
    ]
  })
}