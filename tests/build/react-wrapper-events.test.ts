import { describe, it, expect } from 'vitest';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import { globSync } from 'glob';
import {
  collectComponentEvents,
  findEventDeclarationViolations,
} from '../../plugins/vite-plugin-react-wrapper';
// @ts-expect-error — 문서 생성기는 .mjs 로, 타입 선언이 없다
import { renderReactEventsDoc, DOC_PATH } from '../../scripts/react-events-doc.mjs';

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
        if (!tag) continue;
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
});
