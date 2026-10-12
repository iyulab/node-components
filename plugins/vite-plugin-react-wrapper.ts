import type { Plugin } from 'vite';
import { resolve, join, relative, dirname, basename, sep } from 'path';
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
  /**
   * detail 타입을 **다른 패키지**에서 가져올 때의 지정자(예: `@iyulab/components/dist/events/RemoveEvent.js`).
   * 그 경우 `detailSource` 는 비고, d.ts 는 이 지정자 그대로 import 한다 — 비워 두면 래퍼 d.ts 가
   * import 없이 이름만 써서 소비자 쪽에서 풀리지 않는다(`TS2304`).
   */
  detailSpecifier?: string;
}

/** detail 타입을 어디서 가져오는가 — 같은 패키지 소스(절대 경로) 또는 다른 패키지(지정자). */
interface DetailOrigin { detailSource: string; detailSpecifier?: string }

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
  /**
   * 생성 배럴(`<output>/index`)이 함께 재수출할 **추가 모듈 지정자** 목록.
   *
   * ★왜 필요한가: 어떤 패키지는 **손으로 쓴 래퍼**를 함께 갖는다(제네릭 프로퍼티·커스텀
   *   이벤트 매핑처럼 생성기가 도출할 수 없는 것). 그것이 별도 서브패스에만 살면 소비자는
   *   «배럴에서 얻는 것»과 «딥 경로에서 얻는 것»이 달라지고, 배럴이 딥의 상위집합이라는
   *   관례가 깨진다. ⇒ 배럴이 그 손 래퍼까지 재수출해 한 갈래로 만든다.
   *
   * ⚠**반드시 «패키지 지정자»를 준다 — 상대 경로를 주지 말 것.** 상대 경로는 `exports`
   *   맵을 거치지 않으므로 워크스페이스에서 배럴만 `dist` 트리를 싣고 나머지는 `src` 를
   *   실어 **같은 태그를 두 클래스가 등록**한다(이 리포가 `TS2717` 로 한 번 겪은 형태).
   *   예: `'@iyulab/modern-app/dist/react.js'`.
   */
  reexport?: string[];
}

/**
 * Lit Element 컴포넌트를 React 래퍼로 자동 생성하는 Vite 플러그인
 */
export default function reactWrapperPlugin(options: PluginOptions): Plugin {
  let rootDir: string;
  let buildOutDir: string;
  let outDir: string;
  /** 자기 패키지 이름 — 래퍼가 원본 클래스를 «패키지 스펙»으로 가리키기 위해 필요하다. 손으로 쓰지 않고 매니페스트에서 읽는다. */
  let pkgName: string;

  return {
    name: 'vite-plugin-react-wrapper',

    configResolved(config) {
      rootDir = config.root;
      buildOutDir = resolve(rootDir, config.build.outDir);
      outDir = resolve(buildOutDir, options.output || 'react');
      pkgName = JSON.parse(readFileSync(resolve(rootDir, 'package.json'), 'utf-8')).name;
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
        generated.push(...writeWrapper(comp, outDir, buildOutDir, pkgName));
      }
      generated.push(...writeIndex(components, outDir, buildOutDir, options.reexport ?? []));

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

/**
 * 등록 데코레이터 바로 위 JSDoc 에 `@internal` 이 있는가 — 다른 컴포넌트가 내부에서만 쓰는
 * 요소(예: 날짜 피커들의 달력 격자)는 공개 표면이 아니므로 래퍼도 문서도 만들지 않는다.
 * 표식은 컴포넌트 소스 한 곳에 두고, 표면을 만드는 쪽(이 플러그인 · `scripts/*-doc.mjs`)이
 * 각자 읽는다 — 제외 목록을 설정 파일마다 따로 두면 서로 어긋난다.
 */
export function isInternalElement(content: string): boolean {
  const doc = content.match(/\/\*\*((?:(?!\*\/)[\s\S])*)\*\/\s*@customElement\s*\(/);
  return !!doc && /@internal\b/.test(doc[1]);
}

function parseComponent(filePath: string, violations: string[] = []): ComponentInfo[] {
  const content = readFileSync(filePath, 'utf-8');

  // @customElement('tag-name') 데코레이터 확인
  const tagMatch = content.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
  if (!tagMatch || isInternalElement(content)) return [];

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
  const eventMap = new Map<string, EventEntry>();
  const chain = new Set<string>();
  collectInto(eventMap, filePath, chain);

  // `@event` 만 있고 detail 타입을 모르는 이벤트는 **이벤트 맵 선언**에서 찾는다 — 요소 범위 맵
  // (`UInputEventMap` 처럼 상속 체인 파일의 `*EventMap`)이 먼저, 패키지 전역 증강
  // (`HTMLElementEventMap`·`GlobalEventHandlersEventMap`)이 다음. 타입은 그 선언 한 곳이 정본이다 —
  // 컨트롤러가 대신 발화하는 이벤트(`this.fire` 가 없다)도 여기서 타입을 얻는다.
  const srcRoot = packageSrcRoot(filePath);
  for (const [name, entry] of eventMap) {
    if (entry.detailType !== 'unknown') continue;
    const found = lookupEventMaps(name, [...chain], srcRoot);
    if (found) eventMap.set(name, found);
  }

  return Array.from(eventMap, ([name, { detailType, detailSource, detailSpecifier }]) => ({
    name,
    reactName: toCamelEvent(name),
    detailType,
    detailSource,
    ...(detailSpecifier ? { detailSpecifier } : {}),
  }));
}

type EventEntry = { detailType: string } & DetailOrigin;

function collectInto(
  eventMap: Map<string, EventEntry>,
  filePath: string,
  visited: Set<string>,
): void {
  if (visited.has(filePath) || !existsSync(filePath)) return;  // 순환 상속/누락 파일 방어
  visited.add(filePath);

  const content = readFileSync(filePath, 'utf-8');

  // import 구문에서 식별자 → 소스 경로 매핑 수집 (detail 타입과 베이스 클래스 양쪽에 쓴다)
  // 예: import { ShowEventDetail } from '../events/ShowEvent.js';
  const importMap = readImportMap(content);

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
    eventMap.set(m[2], { detailType, ...detailOrigin(detailType, filePath, content, importMap) });
  }
}

/** 이 파일이 그 이름을 export 선언하는가. */
function declaresExport(content: string, name: string): boolean {
  return new RegExp(`export\\s+(?:interface|type|class|enum)\\s+${name}\\b`).test(content);
}

/**
 * detail 타입 이름의 출처 — 이 파일이 import 했으면 그 import 를, 이 파일이 스스로 export 선언했으면 이 파일을.
 * ⚠뒤쪽이 빠져 있었다: `UPagination` 의 `PageChangeDetail` 처럼 요소 파일이 선언한 detail 은 출처가 비어
 * 래퍼 d.ts 가 import 없이 이름만 썼다(`skipLibCheck` 소비자에게는 조용한 `any`, 아니면 `TS2304`).
 */
function detailOrigin(name: string, file: string, content: string, importMap: Map<string, string>): DetailOrigin {
  const imported = importMap.get(name);
  if (imported) return resolveDetailOrigin(file, imported);
  return declaresExport(content, name) ? { detailSource: file } : { detailSource: '' };
}

function readImportMap(content: string): Map<string, string> {
  const importMap = new Map<string, string>();
  for (const m of content.matchAll(/import\s+(?:type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)) {
    for (const name of m[1].split(',')) {
      const typeName = name.replace(/type\s+/, '').trim();
      if (typeName) importMap.set(typeName, m[2]);
    }
  }
  return importMap;
}

/** 상대 import 는 같은 패키지 소스(절대 경로)로, 패키지 지정자는 그대로 — 둘 다 아니면 출처 없음. */
function resolveDetailOrigin(fromFile: string, importPath: string | undefined): DetailOrigin {
  if (importPath && !importPath.startsWith('.')) return { detailSource: '', detailSpecifier: importPath };
  return { detailSource: resolveLocalModule(fromFile, importPath) || '' };
}

/** 소스 파일이 속한 패키지의 `src` 디렉터리(없으면 그 파일의 디렉터리). */
function packageSrcRoot(filePath: string): string {
  const norm = filePath.split(sep).join('/');
  const i = norm.lastIndexOf('/src/');
  return i >= 0 ? norm.slice(0, i + 4) : dirname(filePath);
}

/** 이벤트 맵 인터페이스의 `'name': Type;` 항목들 — `map` 은 맵 이름(예: `HTMLElementEventMap`). */
export function readEventMapEntries(content: string): { map: string; name: string; type: string }[] {
  const out: { map: string; name: string; type: string }[] = [];
  for (const m of content.matchAll(/interface\s+(\w*EventMap)\s*\{/g)) {
    // 짝 맞는 닫는 중괄호까지 — 항목 타입 안의 `{ query: string }` 를 건너뛴다.
    let depth = 1;
    let i = m.index + m[0].length;
    const start = i;
    for (; i < content.length && depth > 0; i++) {
      if (content[i] === '{') depth++;
      else if (content[i] === '}') depth--;
    }
    const body = content.slice(start, i - 1).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    // 항목 = 맨 바깥 깊이의 `이름: 타입;` — 인라인 객체 타입 안의 `query: string;` 을 항목으로 읽지 않는다.
    let depthB = 0;
    let from = 0;
    for (let j = 0; j < body.length; j++) {
      const c = body[j];
      if (c === '{' || c === '<' || c === '(') depthB++;
      else if (c === '}' || c === '>' || c === ')') depthB--;
      else if (c === ';' && depthB === 0) {
        const e = body.slice(from, j).match(/^\s*['"]?([\w-]+)['"]?\s*:\s*([\s\S]+)$/);
        if (e) out.push({ map: m[1], name: e[1], type: e[2].trim() });
        from = j + 1;
      }
    }
  }
  return out;
}

const GLOBAL_EVENT_MAPS = new Set(['HTMLElementEventMap', 'GlobalEventHandlersEventMap']);
const globalMapCache = new Map<string, { name: string; type: string; file: string }[]>();

function globalEventMapEntries(srcRoot: string): { name: string; type: string; file: string }[] {
  let entries = globalMapCache.get(srcRoot);
  if (!entries) {
    entries = [];
    for (const file of globSync('**/*.ts', { cwd: srcRoot, absolute: true, ignore: ['**/*.test.ts', '**/*.d.ts'] })) {
      const content = readFileSync(file, 'utf-8');
      if (!content.includes('EventMap')) continue;
      for (const e of readEventMapEntries(content)) {
        if (GLOBAL_EVENT_MAPS.has(e.map)) entries.push({ name: e.name, type: e.type, file });
      }
    }
    globalMapCache.set(srcRoot, entries);
  }
  return entries;
}

function lookupEventMaps(name: string, chainFiles: string[], srcRoot: string): EventEntry | null {
  // 요소 범위 맵 — 상속 체인 파일 안의 `*EventMap`. leaf 부터(가장 구체적인 선언이 이긴다).
  for (const file of [...chainFiles].reverse()) {
    const content = readFileSync(file, 'utf-8');
    const hit = readEventMapEntries(content).find(e => e.name === name && !GLOBAL_EVENT_MAPS.has(e.map));
    const resolved = hit && detailFromEventType(hit.type, file, content);
    if (resolved) return resolved;
  }
  for (const hit of globalEventMapEntries(srcRoot).filter(e => e.name === name)) {
    const resolved = detailFromEventType(hit.type, hit.file, readFileSync(hit.file, 'utf-8'));
    if (resolved) return resolved;
  }
  return null;
}

/**
 * 래퍼 이벤트 prop 이 핸들러에 넘기는 이벤트의 타입 글자.
 *
 * - detail 타입을 풀었으면 `CustomEvent<T>`.
 * - 못 풀었으면(`unknown`) 이름이 결정한다: 표준 DOM 이벤트 이름(`change`·`input`·`copy` …)은 컴포넌트가
 *   네이티브 생성자로 다시 내는 이벤트라(`new Event('change')` · `relay` · `ClipboardEvent`) **그 DOM 타입**
 *   (`HTMLElementEventMap['change']` = `Event`), 그 밖에는 `CustomEvent`.
 *   종전에는 전부 `CustomEvent` 였다 — 소비자가 `e.detail` 을 타입 검사 통과한 채 읽고 런타임에 `undefined` 를 얻었다.
 * - 표준 이름 판정을 손으로 쓴 목록에 두지 않고 타입 시스템에 맡긴다 — d.ts 의 제네릭 별칭
 *   ({@link EVENT_OF_ALIAS})이 소비자 쪽에서 푼다(`EventOf<'change'>` → `Event`). `fire('change')` 로
 *   `CustomEvent` 를 내는 요소도 `Event` 로 보이는데, detail 이 없으므로 잃는 것이 없다(상위 타입).
 *   ⚠별칭이 **제네릭**이어야 한다 — 리터럴을 직접 쓴 조건부(`'change' extends keyof M ? M['change'] : …`)는 참 갈래에서
 *   좁혀지지 않아 `TS2538` 이고, 소비자의 `skipLibCheck` 아래 그 오류는 조용한 `any` 가 된다(타입 스모크가 잡았다).
 */
export function eventPropType(e: { name: string; detailType: string }): string {
  if (e.detailType !== 'unknown') return `CustomEvent<${e.detailType}>`;
  return `EventOf<'${e.name}'>`;
}

/** {@link eventPropType} 이 쓰는 별칭 — 그것을 쓰는 래퍼 d.ts 에만 싣는다. */
export const EVENT_OF_ALIAS =
  'type EventOf<K extends string> = K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] : CustomEvent;';

const INLINE_PRIMITIVES = new Set(['string', 'number', 'boolean', 'null', 'undefined', 'unknown', 'true', 'false', 'readonly']);

/**
 * 이벤트 타입 글자에서 detail 타입과 그 출처를 푼다 — `CustomEvent<X>` 이거나, 같은 파일의
 * `type A = CustomEvent<X>` 별칭 `A`. `X` 는 그 파일이 선언했거나 import 한 이름 하나, 또는 다른 이름을
 * 참조하지 않는 인라인 타입(`{ query: string }`). 못 풀면 null — 추측해서 거짓 타입을 내지 않는다.
 */
export function detailFromEventType(type: string, file: string, content: string): EventEntry | null {
  const alias = type.match(/^(\w+)$/);
  if (alias) {
    const def = content.match(new RegExp(`type\\s+${alias[1]}\\s*=\\s*([^;]+);`));
    return def ? detailFromEventType(def[1].trim(), file, content) : null;
  }
  const custom = type.match(/^CustomEvent<([\s\S]+)>$/);
  if (!custom) return null;
  const detail = custom[1].trim();
  if (/^\w+$/.test(detail)) {
    const origin = detailOrigin(detail, file, content, readImportMap(content));
    return origin.detailSource || origin.detailSpecifier ? { detailType: detail, ...origin } : null;
  }
  // 인라인 타입 — 속성 이름과 원시 타입만 쓸 때(다른 이름을 참조하면 import 할 길이 없다).
  const keys = new Set([...detail.matchAll(/(\w+)\??\s*:/g)].map(k => k[1]));
  const idents = (detail.replace(/(['"])(?:(?!\1).)*\1/g, '').match(/[A-Za-z_]\w*/g) ?? [])
    .filter(id => !INLINE_PRIMITIVES.has(id) && !keys.has(id));
  return idents.length === 0 ? { detailType: detail, detailSource: '' } : null;
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

/**
 * 래퍼가 원본 엘리먼트 클래스를 가리키는 경로.
 *
 * 🔴**상대 경로가 아니라 «패키지 스펙»으로 낸다**. 상대 경로는 패키지
 * `exports` 맵을 거치지 않으므로, 로컬 워크스페이스에서 래퍼는 **항상 진짜 `dist`**
 * 의 클래스를 싣는다. 그런데 같은 워크스페이스의 소비자가 하는 deep import 는
 * `"./dist/*": "./src/*"` 리다이렉트를 타 **`src` 의 클래스**를 싣는다 — 같은 논리적
 * 컴포넌트가 **두 nominal 타입**으로 존재하게 되고, 둘 다 같은 태그로
 * `HTMLElementTagNameMap` 을 병합하려 해 `TS2717` 이 난다.
 *
 * ⇒ 래퍼도 패키지 스펙으로 적으면 **`exports` 맵이 분기를 대신한다**: 로컬에서는
 * 리다이렉트를 타 `src` 로, 게시본에서는 배포 워크플로가 `./src/` 를 `./dist/` 로
 * 치환하므로 진짜 `dist` 로 간다. **두 세계 모두에서 클래스가 하나다.**
 *
 * ⚠**`.js` 확장자를 `.d.ts` 쪽에서도 유지한다** — `exports` 서브패스 매칭은 문자
 * 그대로라 확장자를 떼면 `"./dist/*"` 패턴이 다른 문자열을 만든다.
 */
function computeImportPath(to: string, buildOutDir: string, pkgName: string): string {
  const sub = relative(buildOutDir, to).split(sep).join('/');
  return pkgName + '/dist/' + sub;
}

function writeWrapper(comp: ComponentInfo, outDir: string, buildOutDir: string, pkgName: string): FileInfo[] {
  const { className, tagName, events } = comp;
  const jsPath = join(outDir, `${className}.js`);
  const dtsPath = join(outDir, `${className}.d.ts`);

  // 소스 파일의 빌드 출력 경로 추정 (src/ → 빌드 outDir 매핑)
  const srcIndex = comp.filePath.replace(/\\/g, '/').indexOf('/src/');
  const relFromSrc = srcIndex >= 0
    ? comp.filePath.substring(srcIndex + 5).replace(/\\/g, '/').replace(/\.ts$/, '')
    : basename(comp.filePath, '.ts');
  const builtModulePath = resolve(buildOutDir, relFromSrc + '.js');
  const importPath = computeImportPath(builtModulePath, buildOutDir, pkgName);

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
  const dtsImportPath = importPath; // `.js` 유지 — exports 서브패스는 문자 그대로 매칭된다
  const dtsImports = [
    `import React from 'react';`,
    `import { ${className} as ${className}Element } from '${dtsImportPath}';`,
  ];

  // 이벤트 detail 타입별 import - 소스 원본 경로 기준으로 빌드 경로 계산.
  // detailSource 는 **선언한 파일 기준으로 이미 절대화**돼 있다(상속받은 이벤트의 경로가
  // leaf 기준으로 잘못 풀리는 것을 막기 위함 — ComponentEvent.detailSource 주석 참조).
  const detailImportMap = new Map<string, string[]>(); // 빌드경로 → [타입명]
  for (const e of events) {
    if (e.detailType === 'unknown') continue;
    // 다른 패키지의 detail 타입은 그 지정자 그대로 — 이미 «패키지 스펙»이다.
    if (e.detailSpecifier) {
      const types = detailImportMap.get(e.detailSpecifier) || [];
      if (!types.includes(e.detailType)) types.push(e.detailType);
      detailImportMap.set(e.detailSpecifier, types);
      continue;
    }
    if (!e.detailSource) continue;  // 인라인 타입(`{ query: string }`) — import 할 것이 없다
    const absEventSrc = e.detailSource.replace(/\\/g, '/');
    const eventSrcIndex = absEventSrc.indexOf('/src/');
    const relFromSrc = eventSrcIndex >= 0
      ? absEventSrc.substring(eventSrcIndex + 5).replace(/\.ts$/, '')
      : '';
    if (!relFromSrc) continue;
    const absEventBuilt = resolve(buildOutDir, relFromSrc);
    // 이벤트 detail 타입도 같은 이유로 «패키지 스펙»이어야 한다 — 상대 경로면 로컬에서
    // 소비자가 보는 detail 타입과 다른 nominal 타입이 된다(위 computeImportPath 주석).
    const eventImportPath = computeImportPath(absEventBuilt + '.js', buildOutDir, pkgName);
    const types = detailImportMap.get(eventImportPath) || [];
    if (!types.includes(e.detailType)) types.push(e.detailType);
    detailImportMap.set(eventImportPath, types);
  }
  for (const [path, types] of detailImportMap) {
    dtsImports.push(`import { type ${types.join(', type ')} } from '${path}';`);
  }

  const eventTypes = events.length > 0
    ? events.map(e => `  ${e.reactName}?: (event: ${eventPropType(e)}) => void;`).join('\n') + '\n'
    : '';

  // 래퍼 이벤트 prop(onChange 등)은 React.HTMLAttributes 의 동명 핸들러와 교집합되면
  // 어떤 시그니처도 대입 불가가 된다. HTMLAttributes 쪽에서 해당 키를 제거해 CustomEvent
  // 시그니처만 남긴다. 이벤트가 없으면 Omit<…, never> 로 HTMLAttributes 원형 유지.
  const eventKeyUnion = events.length > 0
    ? events.map(e => `'${e.reactName}'`).join(' | ')
    : 'never';

  // 엘리먼트 쪽 = `Partial<El>` 에서 React.HTMLAttributes 와 겹치는 키를 뺀 것. DOM 프로퍼티
  // (children: HTMLCollection 등)는 거기서 빠지므로 React 의 JSX children/className 등과 충돌하지
  // 않고, 그것들은 HTMLAttributes 가 React 친화 타입(children: ReactNode 포함)으로 제공한다.
  // React 가 모르는 DOM 프로퍼티(`autofocus` 등)는 엘리먼트 쪽에 남는다.
  //
  // 🔴**단, 컴포넌트가 «스스로 선언한» prop(`OwnProps` = `HTMLElement` 에 없는 키)은 겹쳐도
  // 엘리먼트 쪽이 이긴다** — 그 이름은 HTMLAttributes 쪽에서 뺀다.
  // 종전에는 반대(`Omit<Partial<El>, keyof React.HTMLAttributes>`)라, React 가 HTML 속성으로도
  // 아는 이름(`color` — 폐기된 `<font color>` 계열)의 정밀 타입이 `string` 으로 열렸다:
  // 역할 축(`TagColor`·`ButtonColor` …)이 타입 검사를 통과하지 않는 값을 받았다.
  //
  // `React.RefAttributes` 를 반드시 교집합에 넣는다 — `ForwardRefExoticComponent<P>` 는 P 에
  // ref 를 자동으로 더해 주지 않는다. @lit/react 의 `ReactWebComponent` 자신이
  // `PropsWithoutRef<…> & React.RefAttributes<I>` 로 선언돼 있으므로(런타임은 ref 를 전달한다),
  // 이것을 빠뜨리면 **런타임은 되는데 타입만 거부하는** 괴리가 생긴다.
  const dts = `${dtsImports.join('\n')}

${events.some(e => e.detailType === 'unknown') ? `${EVENT_OF_ALIAS}\n` : ''}type ${className}OwnProps = Omit<${className}Element, keyof HTMLElement>;

export declare const ${className}: React.ForwardRefExoticComponent<
  Partial<Omit<${className}Element, Exclude<keyof React.HTMLAttributes<${className}Element>, keyof ${className}OwnProps>>>
    & Omit<React.HTMLAttributes<${className}Element>, keyof ${className}OwnProps | ${eventKeyUnion}>
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

function writeIndex(
  components: ComponentInfo[],
  outDir: string,
  buildOutDir: string,
  reexport: string[],
): FileInfo[] {
  // 손 래퍼 재수출을 **먼저** 둔다 — 소비자가 읽는 순서를 「손으로 쓴 것 → 생성된 것」으로
  // 맞춘다. ⚠이름이 겹치면 `export *` 는 그 이름을 **조용히 내보내지 않으므로**, 순서가
  //   충돌을 해소해 주지는 않는다(겹치지 않게 `exclude` 로 가르는 것이 호출부의 책임).
  const reexports = reexport.map(spec => `export * from '${spec}';`).join('\n');
  const prefix = reexports ? reexports + '\n' : '';

  const jsExports = prefix + components
    .map(c => `export { ${c.className} } from './${c.className}.js';`)
    .join('\n');

  const dtsExports = prefix + components
    .map(c => `export { ${c.className}, ${c.className}Props } from './${c.className}';`)
    .join('\n');

  return [
    writeFile(join(outDir, 'index.js'), jsExports + '\n', buildOutDir),
    writeFile(join(outDir, 'index.d.ts'), dtsExports + '\n', buildOutDir),
  ];
}
