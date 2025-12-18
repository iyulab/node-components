import { resolve } from 'path';
import { defineConfig, normalizePath } from 'vite';
import dts from "vite-plugin-dts";
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';
import wrapper from './plugins/vite-plugin-react-wrapper';

export default defineConfig({
  // 개발 서버 설정
  server: {
    open: "./tests/index.html",
    port: 5173,
  },

  // 빌드 설정
  build: {
    target: 'esnext',
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
    minify: false,
    lib: {
      entry: [
        resolve(__dirname, 'src/index.ts'),
      ],
      formats: ['es'],
      fileName: (format: string, entry: string): string => {
        return format === 'es' ? `${entry}.js` : `${entry}.${format}.js`;
      },
    },
    rollupOptions: {
      // 외부 종속성 라이브러리
      external: [
        /^@floating-ui.*/,
        /^lit.*/,
        /^react.*/,
        /^reflect-metadata.*/
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
      },
      treeshake: {
        moduleSideEffects: true
      }
    }
  },

  // 플러그인 설정
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
      outDir: 'integrations/react',     // dist/integrations/react 폴더에 생성
    })
  ]
}); 