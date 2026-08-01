import type { Plugin } from 'vite';
import { resolve, join, relative, dirname, basename } from 'path';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { gzipSync } from 'zlib';
import { globSync } from 'glob';

interface ComponentEvent {
  name: string;         // 원본 이벤트명 (예: show, shift-start)
  reactName: string;    // React prop명 (예: onShow, onShiftStart)
  detailType: string;   // 이벤트 detail 타입 (예: ShiftEventDetail, 없으면 unknown)
  /**
   * detail 타입 모듈의 **절대 소스 경로** (없으면 '').
   *
   * 상대 경로가 아니라 절대 경로인 이유: 이벤트는 상속 체인의 어느 파일에서든 선언될 수
   * 있고, 그 파일의 import 경로는 **선언한 파일 기준**이다. 예를 들어
   * `src/components/UOverlayElement.ts` 는 `../events/ShowEvent.js`(= `src/events/`)를
   * 가리키는데, 이것을 상속받는 `src/components/dialog/UDialog.ts` 기준으로 풀면
   * `src/components/events/`(존재하지 않음)가 된다. 수집 시점에 선언 파일 기준으로
   * 절대화해 이 어긋남을 원천 차단한다.
   */
  detailSource: string;
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
  /** 래퍼 생성에서 제외할 glob 패턴 목록 (cwd: 프로젝트 루트) */
  exclude?: string[];
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
      let files = globSync(inputPattern, { cwd: rootDir, absolute: true });
      if (options.exclude?.length) {
        const excluded = new Set(
          options.exclude.flatMap(p => globSync(p, { cwd: rootDir, absolute: true }))
        );
        files = files.filter((f: string) => !excluded.has(f));
      }
      // 이벤트 선언 누락은 **빌드를 실패**시킨다. 경고로 두면 사람 기억에 의존하게 되고,
      // 누락된 이벤트는 React 소비자 쪽에서 에러 없이 조용히 죽는다 — 알아채기 가장 어려운
      // 실패 형태다. 전 컴포넌트를 훑은 뒤 위반을 한 번에 보고한다.
      const violations: string[] = [];
      const components = files.flatMap((f: string) => parseComponent(f, violations));

      if (violations.length > 0) {
        throw new Error(
          `[react-wrapper] 이벤트 선언 누락 ${violations.length}건:\n` +
          violations.map(v => `  - ${v}`).join('\n'),
        );
      }

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

function parseComponent(filePath: string, violations: string[] = []): ComponentInfo[] {
  const content = readFileSync(filePath, 'utf-8');

  // @customElement('tag-name') 데코레이터 확인
  const tagMatch = content.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  if (!tagMatch) return [];

  // export class ClassName 추출
  const classMatch = content.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
  if (!classMatch) return [];

  const events = collectComponentEvents(filePath);

  violations.push(...findEventDeclarationViolations(content, classMatch[1], tagMatch[1], events.length));

  return [{
    className: classMatch[1],
    tagName: tagMatch[1],
    filePath,
    events,
  }];
}

/**
 * 이벤트가 **정적으로 수집되지 않는 형태**로 발화되는지 검사한다. 반환값이 비어 있지 않으면
 * 빌드를 실패시킨다 — 누락된 이벤트는 React 소비자 쪽에서 에러도 경고도 없이 죽으므로
 * 경고로 두면 아무도 알아채지 못한다.
 *
 * `content` 는 **leaf 파일 본문만**이다 — 베이스까지 훑으면 `UElement` 의 `fire`/`relay`
 * 구현 자체가 걸려 전 컴포넌트가 위반이 된다. 베이스에서 발화하는 이벤트는 상속 수집
 * ({@link collectComponentEvents})이 이미 채우므로 여기서 볼 필요가 없다.
 */
export function findEventDeclarationViolations(
  content: string,
  className: string,
  tagName: string,
  eventCount: number,
): string[] {
  const violations: string[] = [];

  // relay/dispatchEvent 는 이름을 정적으로 도출할 수 없다. @event 태그도 없으면
  // events 맵이 빈 채로 생성되어 React 소비자가 구독할 방법이 사라진다.
  if (eventCount === 0 && /this\.(relay|dispatchEvent)\s*\(/.test(content)) {
    violations.push(
      `${className} (${tagName}): 이벤트를 발생시키지만(relay/dispatchEvent) @event 태그가 없어 ` +
      `React 래퍼에 이벤트 prop이 노출되지 않습니다. 클래스 JSDoc에 '@event <name>'을 추가하세요.`,
    );
  }

  // this.fire(변수) 처럼 이름이 리터럴이 아니면 역시 수집되지 않는다.
  for (const m of content.matchAll(/this\.fire\s*(?:<[^>]+>)?\s*\(\s*([^'"\s)])/g)) {
    violations.push(
      `${className} (${tagName}): this.fire(${m[1]}…) 의 이벤트명이 문자열 리터럴이 아니라 ` +
      `정적으로 수집할 수 없습니다. 클래스 JSDoc에 '@event <name>'을 추가하세요.`,
    );
  }

  return violations;
}

/**
 * 컴포넌트가 노출하는 이벤트를 **상속 체인 전체**에서 수집한다.
 *
 * leaf 파일만 읽으면 베이스 클래스가 발화하는 이벤트를 놓친다 — 예를 들어 `UDialog`·
 * `UDrawer` 는 `show`/`hide` 를 **`UOverlayElement` 가** 발화하므로, leaf 만 보면
 * `events: {}` 가 생성되고 React 소비자는 그 이벤트를 **구독할 방법이 없다**(에러도 경고도
 * 없이 조용히 실패한다).
 *
 * 수집 순서는 **베이스 → leaf**다. `@event` 는 이름만 주고(detail=unknown) 기존 항목을
 * 덮지 않는 반면 `this.fire<T>('name')` 은 타입까지 주며 덮으므로, 이 순서에서
 * ⑴베이스의 타입 정보가 leaf 의 `@event` 재선언에 지워지지 않고
 * ⑵leaf 가 같은 이벤트를 더 구체적 타입으로 발화하면 그것이 이긴다.
 */
export function collectComponentEvents(filePath: string): ComponentEvent[] {
  const eventMap = new Map<string, { detailType: string; detailSource: string }>();
  collectInto(eventMap, filePath, new Set());

  return Array.from(eventMap, ([name, { detailType, detailSource }]) => ({
    name,
    reactName: toCamelEvent(name),
    detailType,
    detailSource,
  }));
}

function collectInto(
  eventMap: Map<string, { detailType: string; detailSource: string }>,
  filePath: string,
  visited: Set<string>,
): void {
  if (visited.has(filePath) || !existsSync(filePath)) return;  // 순환 상속/누락 파일 방어
  visited.add(filePath);

  const content = readFileSync(filePath, 'utf-8');

  // import 구문에서 식별자 → 소스 경로 매핑 수집 (detail 타입과 베이스 클래스 양쪽에 쓴다)
  // 예: import { ShowEventDetail } from '../events/ShowEvent.js';
  const importMap = new Map<string, string>();
  for (const m of content.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)) {
    const importPath = m[2];
    for (const name of m[1].split(',')) {
      const typeName = name.replace(/type\s+/, '').trim();
      if (typeName) importMap.set(typeName, importPath);
    }
  }

  // 베이스 클래스를 먼저 수집한다 (제네릭 베이스 `extends UFormControlElement<T>` 포함)
  const extendsMatch = content.match(
    /export\s+(?:abstract\s+)?class\s+\w+(?:<[^>]*>)?\s+extends\s+(\w+)/,
  );
  if (extendsMatch) {
    const basePath = resolveLocalModule(filePath, importMap.get(extendsMatch[1]));
    if (basePath) collectInto(eventMap, basePath, visited);
  }

  // JSDoc @event 패턴: @event eventName — 이름만 제공하므로 기존 항목을 덮지 않는다
  for (const m of content.matchAll(/@event\s+([\w-]+)/g)) {
    if (!eventMap.has(m[1])) eventMap.set(m[1], { detailType: 'unknown', detailSource: '' });
  }

  // this.fire<DetailType>('eventName') 패턴 - 제네릭 타입 추출
  for (const m of content.matchAll(/this\.fire\s*(?:<([^>]+)>)?\s*\(\s*['"]([\w-]+)['"]/g)) {
    const detailType = m[1] || 'unknown';
    const detailSource = resolveLocalModule(filePath, importMap.get(detailType)) || '';
    eventMap.set(m[2], { detailType, detailSource });
  }
}

/** 같은 패키지 소스 안의 상대 import 를 절대 `.ts` 경로로 해석한다 (외부 모듈이면 null) */
function resolveLocalModule(fromFile: string, importPath: string | undefined): string | null {
  if (!importPath || !importPath.startsWith('.')) return null;
  const abs = resolve(dirname(fromFile), importPath.replace(/\.js$/, '.ts'));
  return existsSync(abs) ? abs : null;
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
import { ${className} as ${className}Element } from '${importPath}';

export const ${className} = createComponent({
  react: React,
  tagName: '${tagName}',
  elementClass: ${className}Element,
  events: ${eventsObj},
});
`;

  // .d.ts - import 구문 생성
  const dtsImportPath = importPath.replace(/\.js$/, '');
  const dtsImports = [
    `import React from 'react';`,
    `import { ${className} as ${className}Element } from '${dtsImportPath}';`,
  ];

  // 이벤트 detail 타입별 import - 소스 원본 경로 기준으로 빌드 경로 계산.
  // detailSource 는 **선언한 파일 기준으로 이미 절대화**돼 있다(상속받은 이벤트의 경로가
  // leaf 기준으로 잘못 풀리는 것을 막기 위함 — ComponentEvent.detailSource 주석 참조).
  const detailImportMap = new Map<string, string[]>(); // 빌드경로 → [타입명]
  for (const e of events) {
    if (e.detailType === 'unknown' || !e.detailSource) continue;
    const absEventSrc = e.detailSource.replace(/\\/g, '/');
    const eventSrcIndex = absEventSrc.indexOf('/src/');
    const relFromSrc = eventSrcIndex >= 0
      ? absEventSrc.substring(eventSrcIndex + 5).replace(/\.ts$/, '')
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

  // 래퍼 이벤트 prop(onChange 등)은 React.HTMLAttributes 의 동명 핸들러와 교집합되면
  // 어떤 시그니처도 대입 불가가 된다. HTMLAttributes 쪽에서 해당 키를 제거해 CustomEvent
  // 시그니처만 남긴다. 이벤트가 없으면 Omit<…, never> 로 HTMLAttributes 원형 유지.
  const eventKeyUnion = events.length > 0
    ? events.map(e => `'${e.reactName}'`).join(' | ')
    : 'never';

  // Partial<Element> 은 DOM 프로퍼티(children: HTMLCollection 등)를 포함해 React 의 JSX
  // children/이벤트/className 등과 충돌한다. keyof React.HTMLAttributes 를 제거해 컴포넌트
  // 고유 prop만 남기고, React 친화 타입(children: ReactNode 포함)은 HTMLAttributes 가 제공한다.
  //
  // `React.RefAttributes` 를 반드시 교집합에 넣는다 — `ForwardRefExoticComponent<P>` 는 P 에
  // ref 를 자동으로 더해 주지 않는다. @lit/react 의 `ReactWebComponent` 자신이
  // `PropsWithoutRef<…> & React.RefAttributes<I>` 로 선언돼 있으므로(런타임은 ref 를 전달한다),
  // 이것을 빠뜨리면 **런타임은 되는데 타입만 거부하는** 괴리가 생긴다.
  const dts = `${dtsImports.join('\n')}

export declare const ${className}: React.ForwardRefExoticComponent<
  Omit<Partial<${className}Element>, keyof React.HTMLAttributes<${className}Element>>
    & Omit<React.HTMLAttributes<${className}Element>, ${eventKeyUnion}>
    & React.RefAttributes<${className}Element>
    & {
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
