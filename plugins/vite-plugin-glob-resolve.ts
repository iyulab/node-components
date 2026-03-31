import type { Plugin } from 'vite';
import { readFileSync } from 'fs';
import { resolve, dirname, basename } from 'path';
import { createHash } from 'crypto';

const VIRTUAL_PREFIX = '\0glob-assets';
const SUPPORTED_QUERIES = ['?raw', '?inline', '?url'];

function shortHash(input: string): string {
  return createHash('md5').update(input).digest('hex').slice(0, 8);
}

/**
 * Rolldown의 preserveModules 모드에서 import.meta.glob의 query 옵션 사용 시
 * 빈 export가 생성되는 문제를 해결하는 플러그인.
 *
 * - `?raw`: 파일 내용을 문자열로 반환
 * - `?inline`: 파일 내용을 문자열로 반환
 * - `?url`: 파일을 asset으로 emit하고 URL을 반환
 *
 * 가상 모듈(\0 prefix)로 변환하여 파일명에 `?`가 포함되는 것을 방지합니다.
 */
export default function globResolve(): Plugin {
  const idToAbsPath = new Map<string, string>();

  return {
    name: 'vite:glob-resolve',
    enforce: 'pre',

    resolveId(source, importer) {
      for (const query of SUPPORTED_QUERIES) {
        if (source.endsWith(query)) {
          const rawPath = source.slice(0, -query.length);
          const absPath = importer
            ? resolve(dirname(importer), rawPath)
            : rawPath;
          const name = basename(absPath);
          const hash = shortHash(absPath);
          const queryName = query.slice(1);
          const virtualId = `${VIRTUAL_PREFIX}_${queryName}/${name}.${hash}`;
          idToAbsPath.set(virtualId, absPath);
          return virtualId;
        }
      }
      return null;
    },

    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null;

      const absPath = idToAbsPath.get(id);
      if (!absPath) return null;

      // virtualId에서 queryName 추출: "\0glob-assets_{queryName}/..."
      const queryName = id.slice(VIRTUAL_PREFIX.length + 1).split('/')[0];

      if (queryName === 'raw' || queryName === 'inline') {
        const content = readFileSync(absPath, 'utf-8');
        return `export default ${JSON.stringify(content)};`;
      }

      if (queryName === 'url') {
        const source = readFileSync(absPath);
        const fileName = basename(absPath);
        const ref = this.emitFile({
          type: 'asset',
          name: fileName,
          source,
        });
        return `export default import.meta.ROLLUP_FILE_URL_${ref};`;
      }

      return null;
    }
  };
}
