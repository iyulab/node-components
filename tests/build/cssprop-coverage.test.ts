import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, globSync } from 'fs';
import { resolve, join, dirname, basename } from 'path';
// @ts-expect-error — 문서 생성기는 .mjs 로, 타입 선언이 없다
import { renderCssPropsDoc, DOC_PATH } from '../../scripts/cssprops-doc.mjs';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(p, 'utf-8');
const files = (pattern: string) => globSync(pattern, { cwd: root }).map(p => join(root, p));

/**
 * 규약: **컴포넌트 스타일이 정의하는 CSS 커스텀 프로퍼티는 공개 API다.**
 * 따라서 `@cssprop` 으로 선언하거나, 아래 내부 목록에 이유와 함께 등재해야 한다.
 *
 * 이 검사가 존재하는 이유: 훅을 만들어 두고 선언하지 않으면 **소비자가 찾을 수 없다**.
 * 실제로 `--u-primary-color`(브랜드 훅)와 `--u-input-display`(폭 제어 훅)가 구현돼 있는데도
 * 문서에 없어서, 소비앱이 중립 팔레트를 하이잭하거나 컴포넌트에 CSS 를 덮어쓰는 우회를
 * 수년간 유지했다. "제공하고 있다"와 "발견 가능하다"는 다르다.
 */
const INTERNAL: Record<string, string> = {
  // JS 가 @property 값을 CSS 로 미러링한다 — 공개 API 는 속성 쪽이다.
  // 소비자가 이 변수를 덮어도 다음 렌더에서 덮어써진다.
  '--anchor-width': 'floating 앵커 실측폭 (런타임 계산)',
  '--anchor-height': 'floating 앵커 실측높이 (런타임 계산)',
  '--container-offset': 'u-dialog 컨테이너 오프셋 (런타임 계산)',
  '--menu-item-depth': 'u-menu-item 중첩 깊이 (런타임 계산)',
  '--tree-item-depth': 'u-tree-item 중첩 깊이 (런타임 계산)',
  '--tooltip-bridge-area': '트리거↔툴팁 사이 hover 브리지 (런타임 계산)',
  '--slides-per-view': 'u-carousel `perView` 속성의 미러',
  '--slide-gap': 'u-carousel `gap` 속성의 미러',
  '--skeleton-width': 'u-skeleton `width` 속성의 미러',
  '--skeleton-height': 'u-skeleton `height` 속성의 미러',

  // 다른 선언 토큰들에서 계산되는 파생값 — 단독으로 덮으면 트랙 기하와 어긋난다.
  '--switch-move-width': '--switch-track-width/--switch-thumb-size/--switch-thumb-offset 에서 계산',
};

/** 컴포넌트 `.ts` 전체에서 선언된 @cssprop 이름 */
function declaredProps(): Set<string> {
  const declared = new Set<string>();
  for (const f of files('src/components/**/*.ts')) {
    for (const m of read(f).matchAll(/@cssprop\s+(--[\w-]+)/g)) declared.add(m[1]);
  }
  return declared;
}

/** `<Component>.styles.ts` 가 정의하는 커스텀 프로퍼티 → 정의한 컴포넌트 */
function definedProps(): Map<string, string[]> {
  const defined = new Map<string, string[]>();
  for (const sf of files('src/components/**/*.styles.ts')) {
    const comp = basename(sf).replace('.styles.ts', '');
    if (!existsSync(join(dirname(sf), `${comp}.ts`))) continue;
    for (const m of read(sf).matchAll(/^\s*(--[\w-]+)\s*:/gm)) {
      const owners = defined.get(m[1]) ?? [];
      if (!owners.includes(comp)) owners.push(comp);
      defined.set(m[1], owners);
    }
  }
  return defined;
}

describe('CSS 커스텀 프로퍼티 선언 규약', () => {
  it('정의된 프로퍼티는 전부 @cssprop 으로 선언되거나 내부로 등재돼 있다', () => {
    const declared = declaredProps();
    const undeclared = [...definedProps()]
      .filter(([prop]) => !declared.has(prop) && !(prop in INTERNAL))
      .map(([prop, owners]) => `${prop} (정의: ${owners.join(',')})`)
      .sort();

    expect(undeclared).toEqual([]);
  });

  it('내부 목록에 죽은 항목이 없다', () => {
    // 프로퍼티가 사라졌는데 목록만 남으면 규약이 조용히 헐거워진다.
    const defined = definedProps();
    const jsSet = new Set<string>();
    for (const f of files('src/**/*.ts')) {
      for (const m of read(f).matchAll(/setProperty\(\s*[`'"](--[\w-]+)/g)) jsSet.add(m[1]);
    }
    const dead = Object.keys(INTERNAL).filter(p => !defined.has(p) && !jsSet.has(p));
    expect(dead).toEqual([]);
  });

  it('@cssprop 태그 철자는 하나로 통일돼 있다', () => {
    // `@cssproperty` 는 유효한 별칭이지만 혼용하면 grep/툴링이 한쪽을 놓친다.
    const mixed = files('src/**/*.ts').filter(f => /@cssproperty\b/.test(read(f)));
    expect(mixed.map(f => f.replace(root, ''))).toEqual([]);
  });

  it('소비자 레퍼런스 문서가 JSDoc 과 동기화돼 있다', () => {
    // 선언만 하고 문서에 싣지 않으면 소비자는 여전히 소스를 열어봐야 한다 —
    // 이 리포가 반복해 겪은 "제공하지만 발견 불가"의 마지막 한 칸이다.
    const expected = renderCssPropsDoc(root);
    const actual = readFileSync(join(root, DOC_PATH), 'utf-8');
    expect(actual).toBe(expected);  // 다르면: npm run docs:cssprops
  });

  it('읽기만 하고 아무 데서도 정의되지 않는 유령 프로퍼티가 없다', () => {
    // `--u-border-color-hover` 가 이 형태였다 — 정의도 폴백도 없어 해당 선언이 통째로 무효였다.
    const defined = definedProps();
    const globalTokens = new Set(
      [...read(join(root, 'src/assets/styles/light.css')).matchAll(/^\s*(--[\w-]+)\s*:/gm)]
        .map(m => m[1]),
    );
    const ghosts = new Set<string>();
    for (const sf of files('src/components/**/*.styles.ts')) {
      // 폴백이 있으면(`var(--x, …)`) 미정의가 의도된 훅이다 — 유령이 아니다.
      for (const m of read(sf).matchAll(/var\(\s*(--[\w-]+)\s*([,)])/g)) {
        const [, prop, next] = m;
        if (next === ',') continue;
        if (defined.has(prop) || globalTokens.has(prop) || prop in INTERNAL) continue;
        ghosts.add(prop);
      }
    }
    expect([...ghosts].sort()).toEqual([]);
  });
});
