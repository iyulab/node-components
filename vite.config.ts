import { resolve } from 'path';
import { rmSync } from 'fs';
import { defineConfig } from 'vite';
import dts from "vite-plugin-dts";
import { viteStaticCopy as copy } from 'vite-plugin-static-copy';
import react from './plugins/vite-plugin-react-wrapper';
import glob from './plugins/vite-plugin-glob-resolve';

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
    rolldownOptions: {
      // 외부 종속성 라이브러리
      external: [
        /^@floating-ui.*/,
        /^lit.*/,
        /^focus-trap.*/,
        /^tabbable.*/,
      ],
      output: {
        preserveModules: true,
        preserveModulesRoot: resolve(__dirname, 'src'),
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
          src: 'src/assets/styles/*.css',
          dest: 'styles',
          rename: { stripBase: true }
        }
      ]
    }),
    glob(),
    react({
      input: 'src/components',
      output: 'react',
    }),
    // 빌드 완료 후 불필요한 산출물 정리
    {
      name: 'vite:build-cleanup',
      closeBundle() {
        const outDir = resolve(__dirname, 'dist');
        // Vite 8(Rolldown)이 CSS import를 자동 추출하여 생성하는 파일 제거
        rmSync(resolve(outDir, 'components.css'), { force: true });
      }
    }
  ]
});
