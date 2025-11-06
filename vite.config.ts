import { resolve } from 'path';
import { defineConfig, normalizePath } from 'vite';
import dts from "vite-plugin-dts";
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';
import wrapper from './plugins/vite-plugin-react-wrapper';

export default () => {
  return defineConfig({
    server: {
      open: "./tests/index.html",
      port: 5173,
    },
    build: {
      target: 'esnext',
      outDir: 'dist',
      emptyOutDir: true,
      copyPublicDir: false,
      minify: true,
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        formats: ['es', 'cjs'],
        fileName: (format: string, entry: string): string => {
          return format === 'cjs' ? `${entry}.cjs` : `${entry}.js`;
        },
      },
      rollupOptions: {
        // 외부 종속성 라이브러리
        external: [
          /^@floating-ui.*/,
          /^lit.*/,
          // /^@lit.*/,
          /^react.*/,
          /^mobx.*/,
          /^reflect-metadata.*/,
          /^i18next.*/,
          /^react-i18.*/,
          /^lit-i18.*/
        ],
        // 공통 파일
        output: {
          preserveModulesRoot: 'src',
          preserveModules: true,
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'chunks/[name]-[hash].js',
        }
      }
    },
    plugins: [
      dts({
        include: ["src/**/*"] 
      }),
      copy({
        targets: [
          {
            src: normalizePath(resolve(__dirname, './src/assets/styles')),
            dest: 'assets'
          }
        ]
      }),
      wrapper({
        componentsDir: 'src/components',  // 컴포넌트 소스 폴더
        outDir: 'react-components',       // dist/react-components 폴더에 생성
      })
    ]
  })
}