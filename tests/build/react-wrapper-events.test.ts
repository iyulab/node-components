import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { resolve, join, dirname } from 'path';
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { globSync } from 'glob';
import {
  collectComponentEvents,
  findEventDeclarationViolations,
  isInternalElement,
  readEventMapEntries,
  detailFromEventType,
  eventPropType,
  EVENT_OF_ALIAS,
} from '../../plugins/vite-plugin-react-wrapper';
// @ts-expect-error — 문서 생성기는 .mjs 로, 타입 선언이 없다
import { renderReactEventsDoc, DOC_PATH, eventTags } from '../../scripts/react-events-doc.mjs';
// @ts-expect-error — .mjs, 타입 선언이 없다
import { isInternalElement as isInternalElementMjs } from '../../scripts/internal-element.mjs';

const root = resolve(__dirname, '../..');
const src = (p: string) => resolve(__dirname, '../../src', p);
const names = (p: string) => collectComponentEvents(src(p)).map(e => e.name).sort();
const find = (p: string, name: string) =>
  collectComponentEvents(src(p)).find(e => e.name === name);

describe('react wrapper — 이벤트 수집', () => {
  describe('상속 체인', () => {
    // 회귀: UDialog/UDrawer 는 show/hide 를 스스로 발화하지 않고 UOverlayElement 가 발화한다.
    // leaf 파일만 파싱하던 시절 두 컴포넌트는 events:{} 로 생성됐고, React 소비자는
    // onShow/onHide 를 붙여도 아무 일도 일어나지 않았다 — 에러도 경고도 없이.
    it('베이스 클래스가 발화하는 이벤트를 상속받는다', () => {
      expect(names('components/dialog/UDialog.ts')).toEqual(['hide', 'show']);
      expect(names('components/drawer/UDrawer.ts')).toEqual(['hide', 'show']);
    });

    it('상속받은 이벤트의 detail 타입 경로가 **선언한 파일** 기준으로 해석된다', () => {
      // UOverlayElement(src/components/)가 '../events/ShowEvent.js' 로 임포트하는 것을
      // leaf(src/components/dialog/) 기준으로 풀면 src/components/events/ 가 되어 깨진다.
      const show = find('components/dialog/UDialog.ts', 'show');
      expect(show?.detailType).toBe('ShowEventDetail');
      expect(show?.detailSource.replace(/\\/g, '/')).toContain('/src/events/ShowEvent.ts');
    });

    it('leaf 의 @event 재선언이 베이스의 detail 타입을 지우지 않는다', () => {
      // UPopover 는 show/hide 를 @event 로 재선언한다(@event 는 타입 정보가 없다).
      // 수집이 베이스→leaf 순서이고 @event 가 기존 항목을 덮지 않으므로 타입이 살아남는다.
      expect(find('components/popover/UPopover.ts', 'show')?.detailType).toBe('ShowEventDetail');
    });

    it('베이스가 이벤트를 선언하지 않으면 아무것도 추가되지 않는다', () => {
      // UFormControlElement 는 이벤트를 선언하지 않는다 — 상속 추적이 유령 이벤트를
      // 만들어내지 않는지 확인한다.
      expect(names('components/checkbox/UCheckbox.ts')).toEqual(['change']);
    });
  });

  describe('자기 파일 수집 (회귀 방지)', () => {
    it('@event 와 this.fire 를 함께 수집한다', () => {
      expect(names('components/tree-item/UTreeItem.ts')).toEqual([
        'check', 'collapse', 'expand', 'pick',
      ]);
    });

    it('this.fire<T> 의 제네릭에서 detail 타입을 추출한다', () => {
      const pick = find('components/chip/UChip.ts', 'pick');
      expect(pick?.detailType).toBe('PickEventDetail');
      expect(pick?.detailSource.replace(/\\/g, '/')).toContain('/src/events/PickEvent.ts');
    });

    it('이벤트를 발화하지 않는 컴포넌트는 빈 목록이다', () => {
      expect(names('components/icon/UIcon.ts')).toEqual([]);
      expect(names('components/badge/UBadge.ts')).toEqual([]);
    });
  });

  // 내부 요소(`@internal`)는 래퍼도 공개 문서도 만들지 않는다 — 표식을 읽는 곳이 플러그인(TS)과
  // 문서 생성기(.mjs) 두 곳이라, 같은 판정을 내는지 전 컴포넌트에서 대조한다.
  describe('내부 요소 표식', () => {
    it('u-calendar 는 내부 요소로 판정되고, 공개 컴포넌트는 아니다', () => {
      const read = (p: string) => readFileSync(src(p), 'utf-8');
      expect(isInternalElement(read('components/calendar/UCalendar.ts'))).toBe(true);
      expect(isInternalElement(read('components/date-picker/UDatePicker.ts'))).toBe(false);
    });

    it('⚪NEGATIVE — 등록 데코레이터 «위» JSDoc 의 표식만 센다 (본문 주석의 낱말은 무시)', () => {
      expect(isInternalElement("/** a */\n@customElement('x-a')\nclass A { /** @internal */ m() {} }")).toBe(false);
      expect(isInternalElement("/** @internal */\nfunction f() {}\n/** b */\n@customElement('x-b')\nclass B {}")).toBe(false);
      expect(isInternalElement("/**\n * b\n * @internal\n */\n@customElement('x-b')\nclass B {}")).toBe(true);
    });

    it('플러그인과 문서 생성기가 전 컴포넌트에서 같은 판정을 낸다', () => {
      const diff = globSync('src/components/**/*.ts', { cwd: root })
        .map(rel => [rel, readFileSync(resolve(root, rel), 'utf-8')] as const)
        .filter(([, text]) => isInternalElement(text) !== isInternalElementMjs(text))
        .map(([rel]) => rel);
      expect(diff).toEqual([]);
    });
  });

  describe('소비자 레퍼런스 문서', () => {
    it('문서가 JSDoc/소스와 동기화돼 있다', () => {
      const expected = renderReactEventsDoc(root);
      const actual = readFileSync(resolve(root, DOC_PATH), 'utf-8');
      expect(actual).toBe(expected);  // 다르면: npm run docs:react-events
    });

    // 문서 생성기(.mjs)는 권위 파서(TS 플러그인)를 직접 부를 수 없어 파싱을 축약 복제한다.
    // 둘이 조용히 어긋나면 문서가 거짓말을 하므로, 전 컴포넌트에서 결과를 대조한다.
    it('문서 생성기의 이벤트 수집이 권위 파서와 일치한다', () => {
      const doc = renderReactEventsDoc(root);
      const mismatches: string[] = [];
      for (const rel of globSync('src/components/**/*.ts', { cwd: root })) {
        const file = resolve(root, rel);
        const src = readFileSync(file, 'utf-8');
        const tag = src.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        if (!tag || isInternalElement(src)) continue;
        const authoritative = collectComponentEvents(file).map(e => e.name).sort();
        const section = doc.split(`## \`<${tag[1]}>\``)[1]?.split('\n## ')[0] ?? '';
        const documented = [...section.matchAll(/\| `on\w+` \| `([\w-]+)`/g)].map(m => m[1]).sort();
        if (JSON.stringify(authoritative) !== JSON.stringify(documented)) {
          mismatches.push(`${tag[1]}: 권위=[${authoritative}] 문서=[${documented}]`);
        }
      }
      expect(mismatches).toEqual([]);
    });
  });

  // 이 리포의 기록된 교훈: "게이트가 존재한다"는 것이 "게이트가 동작한다"는 뜻이 아니다.
  // 빌드를 실패시키는 조건을 실제로 발화시켜 확인한다.
  describe('빌드 게이트', () => {
    const check = (src: string, n = 0) => findEventDeclarationViolations(src, 'UFoo', 'u-foo', n);

    it('선언 없이 relay/dispatchEvent 로 발화하면 위반', () => {
      expect(check('class UFoo { x() { this.relay(e); } }')).toHaveLength(1);
      expect(check('class UFoo { x() { this.dispatchEvent(e); } }')).toHaveLength(1);
    });

    it('이벤트가 이미 수집됐으면 relay 는 위반이 아니다', () => {
      expect(check('class UFoo { x() { this.relay(e); } }', 1)).toHaveLength(0);
    });

    it('this.fire 의 이름이 리터럴이 아니면 위반', () => {
      expect(check("class UFoo { x() { this.fire(name); } }", 1)).toHaveLength(1);
      expect(check('class UFoo { x() { this.fire<D>(EVENT_NAME); } }', 1)).toHaveLength(1);
    });

    it('리터럴 이름으로 발화하면 위반이 아니다', () => {
      expect(check("class UFoo { x() { this.fire('show'); } }", 1)).toHaveLength(0);
      expect(check("class UFoo { x() { this.fire<D>('show'); } }", 1)).toHaveLength(0);
    });

    it('현재 소스 전체에 위반이 0건이다 (게이트를 켤 수 있는 상태)', () => {
      // 위반이 있으면 빌드가 실패하므로, 게이트 도입 시점의 기준선을 테스트로 고정한다.
      const files = globSync('src/components/**/*.ts', {
        cwd: resolve(__dirname, '../..'),
        absolute: true,
      });
      const all = files.flatMap(f => {
        const content = readFileSync(f, 'utf-8');
        const tag = content.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
        const cls = content.match(/export\s+(?:abstract\s+)?class\s+(\w+)/);
        if (!tag || !cls) return [];
        return findEventDeclarationViolations(
          content, cls[1], tag[1], collectComponentEvents(f).length,
        );
      });
      expect(all).toEqual([]);
    });
  });

  // 설명이 줄을 넘기면 생성 문서가 문장 중간에서 끊겼다(첫 줄만 읽었다) — 아홉 행이 그랬다.
  describe('@event 설명', () => {
    it('이어지는 줄을 합치고, 다음 태그·빈 줄·주석 끝에서 멈춘다', () => {
      const src = [
        '/**',
        ' * @event change - 값이 바뀌었을 때',
        ' *   — 사용자 조작만.',
        ' * @event input - 입력마다',
        ' *',
        ' * 다른 단락',
        ' */',
      ].join('\n');
      expect([...eventTags(src)]).toEqual([['change', '값이 바뀌었을 때 — 사용자 조작만.'], ['input', '입력마다']]);
    });

    it('NEGATIVE 한 줄 주석과 이름만 있는 태그', () => {
      expect([...eventTags('/** @event close - 닫힐 때 */')]).toEqual([['close', '닫힐 때']]);
      expect([...eventTags('/**\n * @event open\n */')]).toEqual([['open', '']]);
    });

    it('생성 문서의 설명 열이 문장 중간에서 끊기지 않는다 — 원본의 여러 줄 설명이 전부 실린다', () => {
      const doc = renderReactEventsDoc(root);
      const missing: string[] = [];
      for (const rel of globSync('src/components/**/*.ts', { cwd: root })) {
        const src = readFileSync(resolve(root, rel), 'utf-8');
        // 문서에 실리는 요소만 — 베이스 클래스의 설명은 leaf 가 덮을 수 있고, 내부 요소는 문서 밖이다.
        if (!/@customElement\s*\(/.test(src) || isInternalElementMjs(src)) continue;
        for (const [name, desc] of eventTags(src)) {
          if (desc && !doc.includes(desc)) missing.push(`${rel} @event ${name}`);
        }
      }
      expect(missing).toEqual([]);
    });
  });

  // 래퍼 d.ts 는 detail 타입을 이름으로 쓴다 — 그 이름의 출처를 싣지 못하면 소비자 쪽에서 풀리지 않는다.
  // `skipLibCheck` 소비자에게는 조용한 `any`, 아니면 `TS2304`. 게시본 둘이 실제로 그랬다:
  // components `UPagination.d.ts`(같은 파일이 선언한 `PageChangeDetail`) · chat-components `UFileBlock.d.ts`
  // (다른 패키지에서 import 한 `RemoveEventDetail`). 우리 react 스모크는 `skipLibCheck` 라 둘 다 못 봤다.
  describe('detail 타입의 출처', () => {
    const ev = (file: string, name: string) => collectComponentEvents(file).find(e => e.name === name);

    // 다른 패키지 모양의 소스는 임시 패키지로 만든다 — 형제 패키지(chat-components)의 실제 파일을 읽으면
    // 단독 클론(CI)에서 그 파일이 없어 이 시험이 죽는다. 시험이 재는 것은 수집기의 규칙이지 형제의 소스가 아니다.
    let fixtureSrc = '';
    beforeAll(() => {
      fixtureSrc = join(mkdtempSync(join(tmpdir(), 'wrapper-events-')), 'src');
      const write = (p: string, text: string) => {
        mkdirSync(dirname(join(fixtureSrc, p)), { recursive: true });
        writeFileSync(join(fixtureSrc, p), text);
      };
      write('components/blocks/UFileBlock.ts', [
        "import { RemoveEventDetail } from '@iyulab/components/dist/events/RemoveEvent.js';",
        "@customElement('u-file-block')",
        'export class UFileBlock extends UElement {',
        "  remove() { this.fire<RemoveEventDetail>('remove'); }",
        '}',
      ].join('\n'));
      write('events/LinkActivateEvent.ts', [
        'export interface LinkActivateEventDetail { href: string }',
        'export type LinkActivateEvent = CustomEvent<LinkActivateEventDetail>;',
        'declare global {',
        '  interface HTMLElementEventMap {',
        "    'link-activate': LinkActivateEvent;",
        '  }',
        '}',
      ].join('\n'));
      write('components/blocks/UMarkedBlock.ts', [
        '/**',
        ' * @event link-activate - a rendered link was activated',
        ' */',
        "@customElement('u-marked-block')",
        'export class UMarkedBlock extends UElement {}',
      ].join('\n'));
    });
    afterAll(() => rmSync(dirname(fixtureSrc), { recursive: true, force: true }));

    it('요소 파일이 스스로 선언한 detail 은 그 파일이 출처다', () => {
      const e = find('components/pagination/UPagination.ts', 'page-change');
      expect(e?.detailType).toBe('PageChangeDetail');
      expect(e?.detailSource.replace(/\\/g, '/')).toContain('/src/components/pagination/UPagination.ts');
    });

    it('다른 패키지에서 import 한 detail 은 그 지정자 그대로', () => {
      const e = ev(join(fixtureSrc, 'components/blocks/UFileBlock.ts'), 'remove');
      expect(e?.detailType).toBe('RemoveEventDetail');
      expect(e?.detailSpecifier).toBe('@iyulab/components/dist/events/RemoveEvent.js');
    });

    it('@event 만 있는 이벤트(컨트롤러가 발화)는 이벤트 맵 선언에서 타입을 얻는다', () => {
      const e = ev(join(fixtureSrc, 'components/blocks/UMarkedBlock.ts'), 'link-activate');
      expect(e?.detailType).toBe('LinkActivateEventDetail');
      expect(e?.detailSource.replace(/\\/g, '/')).toContain('/src/events/LinkActivateEvent.ts');
    });

    it('네이티브 이름(맵에 없는 change)은 추측하지 않는다 — unknown 그대로', () => {
      expect(find('components/checkbox/UCheckbox.ts', 'change')?.detailType).toBe('unknown');
    });

    it('래퍼 prop 타입 — detail 이 있으면 CustomEvent<T>, 없으면 이름이 정한다(표준 DOM 이름은 그 DOM 타입)', () => {
      expect(eventPropType({ name: 'search', detailType: '{ query: string }' })).toBe('CustomEvent<{ query: string }>');
      expect(eventPropType({ name: 'change', detailType: 'unknown' }))
        .toBe("EventOf<'change'>");
      expect(EVENT_OF_ALIAS).toBe('type EventOf<K extends string> = K extends keyof HTMLElementEventMap ? HTMLElementEventMap[K] : CustomEvent;');
    });

    it('🔴네이티브 생성자로 다시 내는 이벤트에 detail 타입이 붙지 않는다 — 실린 그대로 `Event` 계열', () => {
      // 소스가 `new Event('change')` · `relay(e)` 로 내는 표준 이름 이벤트는 detail 을 풀지 않는다(풀면 거짓 CustomEvent)
      for (const [file, name] of [
        ['components/checkbox/UCheckbox.ts', 'change'],
        ['components/input/UInput.ts', 'change'],
        ['components/input/UInput.ts', 'input'],
        ['components/copy-button/UCopyButton.ts', 'copy'],
      ] as const) {
        expect(eventPropType(find(file, name)!), `${file} ${name}`).toBe(`EventOf<'${name}'>`);
      }
    });

    it('워크스페이스 전 패키지에서, 이름으로 쓴 detail 타입은 전부 출처가 있다', () => {
      const orphans: string[] = [];
      for (const name of ['components', 'chat-components', 'data-components', 'editor-components', 'modern-app']) {
        // workspace-only: 형제가 없는 단독 클론에서는 glob 이 비어 자기 패키지만 잰다
        const root = resolve(__dirname, '../../..', name);
        for (const f of globSync('src/**/*.ts', { cwd: root, absolute: true })) {
          if (!/@customElement\s*\(/.test(readFileSync(f, 'utf-8'))) continue;
          for (const e of collectComponentEvents(f)) {
            if (e.detailType === 'unknown' || !/^\w+$/.test(e.detailType)) continue;
            if (!e.detailSource && !e.detailSpecifier) orphans.push(`${name} ${f.split(/[\\/]/).pop()} ${e.name}: ${e.detailType}`);
          }
        }
      }
      expect(orphans).toEqual([]);
    });
  });

  describe('이벤트 맵 읽기', () => {
    it('맨 바깥 항목만 — 인라인 객체 타입 안의 속성을 항목으로 읽지 않는다', () => {
      const src = "export interface XEventMap {\n  /** doc; with semicolon */\n  'search': CustomEvent<{ query: string; at: number }>;\n  open: OpenEvent;\n}";
      expect(readEventMapEntries(src)).toEqual([
        { map: 'XEventMap', name: 'search', type: 'CustomEvent<{ query: string; at: number }>' },
        { map: 'XEventMap', name: 'open', type: 'OpenEvent' },
      ]);
    });

    it('별칭(`type A = CustomEvent<X>`)을 같은 파일에서 푼다', () => {
      const src = 'export interface ADetail { a: 1 }\nexport type A = CustomEvent<ADetail>;';
      expect(detailFromEventType('A', '/p/src/A.ts', src)).toEqual({ detailType: 'ADetail', detailSource: '/p/src/A.ts' });
    });

    it('인라인 detail 은 이름을 참조하지 않을 때만 그대로 싣는다', () => {
      expect(detailFromEventType('CustomEvent<{ query: string }>', '/f.ts', '')?.detailType).toBe('{ query: string }');
    });

    it('⚪NEGATIVE — 출처를 못 푸는 이름 · 참조가 든 인라인 · CustomEvent 가 아닌 이벤트는 null', () => {
      expect(detailFromEventType('CustomEvent<Foo>', '/f.ts', 'const x = 1;')).toBeNull();
      expect(detailFromEventType('CustomEvent<{ row: DataRow }>', '/f.ts', '')).toBeNull();
      expect(detailFromEventType('MouseEvent', '/f.ts', '')).toBeNull();
    });
  });

  // 문서 생성기(.mjs)는 이벤트 맵 해석을 복제하지 않는다 — 지금 components 의 이벤트는 전부 `this.fire<T>` 나
  // `@event`(네이티브)로 타입이 정해진다. 맵에서만 타입을 얻는 이벤트가 생기면 이 대조가 문서의 낡음을 잡는다.
  it('문서의 detail 열이 래퍼 타입과 같다', () => {
    const doc = renderReactEventsDoc(root);
    const mismatches: string[] = [];
    for (const rel of globSync('src/components/**/*.ts', { cwd: root })) {
      const file = resolve(root, rel);
      const text = readFileSync(file, 'utf-8');
      const tag = text.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
      if (!tag || isInternalElement(text)) continue;
      const section = doc.split(`## \`<${tag[1]}>\``)[1]?.split('\n## ')[0] ?? '';
      for (const e of collectComponentEvents(file)) {
        const row = section.match(new RegExp('\\| `' + e.reactName + '` \\| `' + e.name + '` \\| `([^`]+)`'));
        if (row?.[1] !== e.detailType) mismatches.push(`${tag[1]} ${e.name}: 래퍼=${e.detailType} 문서=${row?.[1]}`);
      }
    }
    expect(mismatches).toEqual([]);
  });
});
