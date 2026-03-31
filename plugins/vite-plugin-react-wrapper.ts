import type { Plugin } from 'vite';
import { resolve, join, relative, dirname, basename } from 'path';
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { gzipSync } from 'zlib';
import { globSync } from 'glob';

interface ComponentEvent {
  name: string;         // 원본 이벤트명 (예: show, shift-start)
  reactName: string;    // React prop명 (예: onShow, onShiftStart)
  detailType: string;   // 이벤트 detail 타입 (예: ShiftEventDetail, 없으면 unknown)
  importPath: string;   // detail 타입의 소스 import 경로 (예: ../../events/ShowEvent.js)
}

interface ComponentInfo {
  className: string;     // 클래스명 (예: UButton)
  tagName: string;       // 태그명 (예: u-button)
  filePath: string;      // 원본 파일 절대 경로
  events: ComponentEvent[];
}

interface PluginOptions {
  /** 컴포넌트 소스 디렉토리 경로 (기본값: 'src/components') */
  input?: string;
  /** React 래퍼 출력 폴더 - 빌드 outDir 기준 상대 경로 (기본값: 'react') */
  output?: string;
}

/**
 * Lit Element 컴포넌트를 React 래퍼로 자동 생성하는 Vite 플러그인
 */
export default function reactWrapperPlugin(options: PluginOptions): Plugin {
  let rootDir: string;
  let buildOutDir: string;
  let outDir: string;

  return {
    name: 'vite-plugin-react-wrapper',

    configResolved(config) {
      rootDir = config.root;
      buildOutDir = resolve(rootDir, config.build.outDir);
      outDir = resolve(buildOutDir, options.output || 'react');
    },

    closeBundle() {
      const log = (msg: string) => console.log(`\x1b[36m[react-wrapper]\x1b[0m ${msg}`);
      log('Generating React wrappers...');

      // 컴포넌트 수집
      const inputPattern = (options.input || 'src/components') + '/**/*.ts';
      const files = globSync(inputPattern, { cwd: rootDir, absolute: true });
      const components = files.flatMap((f: string) => parseComponent(f));

      if (components.length === 0) {
        log('No components found.');
        return;
      }

      // 출력 디렉토리 생성
      mkdirSync(outDir, { recursive: true });

      // 래퍼 생성
      const generated: FileInfo[] = [];
      for (const comp of components) {
        generated.push(...writeWrapper(comp, outDir, buildOutDir));
      }
      generated.push(...writeIndex(components, outDir, buildOutDir));

      // 결과 출력
      generated.sort((a, b) => a.size - b.size);
      for (const f of generated) {
        const kb = (f.size / 1024).toFixed(2);
        const gzKb = (f.gzipSize / 1024).toFixed(2);
        const pad = ' '.repeat(Math.max(0, 50 - f.path.length));
        console.log(`${f.path}${pad}${kb.padStart(6)} kB │ gzip: ${gzKb.padStart(6)} kB`);
      }

      log(`Generated ${components.length} React wrappers.`);
    }
  };
}

// --- 컴포넌트 파싱 ---

function parseComponent(filePath: string): ComponentInfo[] {
  const content = readFileSync(filePath, 'utf-8');

  // @customElement('tag-name') 데코레이터 확인
  const tagMatch = content.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  if (!tagMatch) return [];

  // export class ClassName 추출
  const classMatch = content.match(/export\s+class\s+(\w+)/);
  if (!classMatch) return [];

  const events = collectEvents(content);

  return [{
    className: classMatch[1],
    tagName: tagMatch[1],
    filePath,
    events,
  }];
}

function collectEvents(content: string): ComponentEvent[] {
  // import 구문에서 타입명 → 소스 경로 매핑 수집
  // 예: import { ShowEventDetail } from '../../events/ShowEvent.js';
  const typeImportMap = new Map<string, string>();
  for (const m of content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)) {
    const importPath = m[2];
    for (const name of m[1].split(',')) {
      const typeName = name.replace(/type\s+/, '').trim();
      if (typeName) typeImportMap.set(typeName, importPath);
    }
  }

  const eventMap = new Map<string, { detailType: string; importPath: string }>();

  // JSDoc @event 패턴: @event eventName
  for (const m of content.matchAll(/@event\s+([\w-]+)/g)) {
    if (!eventMap.has(m[1])) eventMap.set(m[1], { detailType: 'unknown', importPath: '' });
  }

  // this.fire<DetailType>('eventName') 패턴 - 제네릭 타입 추출
  for (const m of content.matchAll(/this\.fire\s*(?:<([^>]+)>)?\s*\(\s*['"]([\w-]+)['"]/g)) {
    const detailType = m[1] || 'unknown';
    const importPath = typeImportMap.get(detailType) || '';
    eventMap.set(m[2], { detailType, importPath });
  }

  return Array.from(eventMap, ([name, { detailType, importPath }]) => ({
    name,
    reactName: toCamelEvent(name),
    detailType,
    importPath,
  }));
}

/** kebab-case 이벤트명을 onCamelCase로 변환 (예: shift-start → onShiftStart) */
function toCamelEvent(name: string): string {
  return 'on' + name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
}

// --- 파일 생성 ---

type FileInfo = { path: string; size: number; gzipSize: number };

function writeFile(filePath: string, content: string, buildOutDir: string): FileInfo {
  writeFileSync(filePath, content, 'utf-8');
  return {
    path: relative(buildOutDir, filePath).replace(/\\/g, '/'),
    size: Buffer.byteLength(content, 'utf-8'),
    gzipSize: gzipSync(content).length,
  };
}

function computeImportPath(from: string, to: string): string {
  let rel = relative(dirname(from), to).replace(/\\/g, '/').replace(/\.ts$/, '');
  if (!rel.startsWith('.')) rel = './' + rel;
  return rel;
}

function writeWrapper(comp: ComponentInfo, outDir: string, buildOutDir: string): FileInfo[] {
  const { className, tagName, events } = comp;
  const jsPath = join(outDir, `${className}.js`);
  const dtsPath = join(outDir, `${className}.d.ts`);

  // 소스 파일의 빌드 출력 경로 추정 (src/ → 빌드 outDir 매핑)
  const srcIndex = comp.filePath.replace(/\\/g, '/').indexOf('/src/');
  const relFromSrc = srcIndex >= 0
    ? comp.filePath.substring(srcIndex + 5).replace(/\\/g, '/').replace(/\.ts$/, '')
    : basename(comp.filePath, '.ts');
  const builtModulePath = resolve(buildOutDir, relFromSrc + '.js');
  const importPath = computeImportPath(jsPath, builtModulePath);

  // events 객체 생성
  const eventsObj = events.length > 0
    ? `{\n${events.map(e => `    ${e.reactName}: '${e.name}',`).join('\n')}\n  }`
    : '{}';

  // .js
  const js = `import React from 'react';
import { createComponent } from '@lit/react';
import { ${className} } from '${importPath}';

export const ${className} = createComponent({
  react: React,
  tagName: '${tagName}',
  elementClass: ${className},
  events: ${eventsObj},
});
`;

  // .d.ts - import 구문 생성
  const dtsImportPath = importPath.replace(/\.js$/, '');
  const dtsImports = [
    `import React from 'react';`,
    `import { ${className} as ${className}Element } from '${dtsImportPath}';`,
  ];

  // 이벤트 detail 타입별 import - 소스 원본 경로 기준으로 빌드 경로 계산
  const srcDir = dirname(comp.filePath);
  const detailImportMap = new Map<string, string[]>(); // 빌드경로 → [타입명]
  for (const e of events) {
    if (e.detailType === 'unknown' || !e.importPath) continue;
    // 소스 상대경로를 절대경로로 변환 후 빌드 경로 계산
    const absEventSrc = resolve(srcDir, e.importPath).replace(/\\/g, '/');
    const eventSrcIndex = absEventSrc.indexOf('/src/');
    const relFromSrc = eventSrcIndex >= 0
      ? absEventSrc.substring(eventSrcIndex + 5).replace(/\.js$/, '')
      : '';
    if (!relFromSrc) continue;
    const absEventBuilt = resolve(buildOutDir, relFromSrc);
    const eventImportPath = computeImportPath(dtsPath, absEventBuilt + '.js').replace(/\.js$/, '');
    const types = detailImportMap.get(eventImportPath) || [];
    if (!types.includes(e.detailType)) types.push(e.detailType);
    detailImportMap.set(eventImportPath, types);
  }
  for (const [path, types] of detailImportMap) {
    dtsImports.push(`import { type ${types.join(', type ')} } from '${path}';`);
  }

  const eventTypes = events.length > 0
    ? events.map(e => {
        const type = e.detailType !== 'unknown' ? `CustomEvent<${e.detailType}>` : 'CustomEvent';
        return `  ${e.reactName}?: (event: ${type}) => void;`;
      }).join('\n') + '\n'
    : '';

  const dts = `${dtsImports.join('\n')}

export declare const ${className}: React.ForwardRefExoticComponent<
  Partial<${className}Element> & React.HTMLAttributes<${className}Element> & {
${eventTypes}  }
>;

export type ${className}Props = React.ComponentProps<typeof ${className}>;
`;

  return [
    writeFile(jsPath, js, buildOutDir),
    writeFile(dtsPath, dts, buildOutDir),
  ];
}

function writeIndex(components: ComponentInfo[], outDir: string, buildOutDir: string): FileInfo[] {
  const jsExports = components
    .map(c => `export { ${c.className} } from './${c.className}.js';`)
    .join('\n');

  const dtsExports = components
    .map(c => `export { ${c.className}, ${c.className}Props } from './${c.className}';`)
    .join('\n');

  return [
    writeFile(join(outDir, 'index.js'), jsExports + '\n', buildOutDir),
    writeFile(join(outDir, 'index.d.ts'), dtsExports + '\n', buildOutDir),
  ];
}
