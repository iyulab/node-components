import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join, basename } from 'path';

const root = resolve(__dirname, '../..');

/**
 * `:host` 에 둔 여백·테두리는 소비 앱의 CSS 리셋(`* { padding:0; border:0; margin:0 }`)에
 * **지워진다** — 호스트 요소에 대해서는 문서 작성자 스타일이 섀도의 `:host` 규칙을 이기기
 * 때문이다. 에러는 없고 컴포넌트는 동작한다. 작아질 뿐이라 소비자는 이것을
 * *"업스트림이 못생겼다"* 로 읽고 각자 다시 칠한다(실제로 두 소비앱이 서로 다르게 칠했고,
 * 한쪽은 칠하지 못해 운영 화면이 깨진 채로 돌았다).
 *
 * Tailwind preflight 는 특수 케이스가 아니라 가장 흔한 소비 환경이다.
 *
 * 이 검사는 **목록이 늘어나는 것을 막는다.** 아래 기준선은 "아직 안 고친 것"이며,
 * 고칠 때마다 줄여 나간다. 새 컴포넌트가 같은 실수를 하면 즉시 실패한다.
 */

/** 문서 리셋이 실제로 지우는 속성 (width/height 는 preflight 대상이 아니다) */
const RESET_VULNERABLE = /^\s*(padding|margin|border)(-(top|right|bottom|left|inline|block|width|style))?\s*:/;

/**
 * 아직 `:host` 에 여백/테두리를 둔 컴포넌트.
 *
 * 고치려면 섀도 DOM 에 래퍼 엘리먼트가 필요하다 — prefix/suffix 가 호스트 flex 에 직접
 * 슬롯되므로 기존 내부 요소만으로는 전체를 감쌀 수 없다. 래퍼 도입은 `::part` 소비자에게
 * 영향을 주는 구조 변경이라 사람 판단 대상이며, Pending Human Decisions 에 있다.
 */
const KNOWN_GAPS = new Set([
  'UAlert', 'UBadge', 'UCard', 'UDivider', 'UMenu', 'UOption', 'UTab', 'UTag', 'UTooltip',
]);

function hostLayoutDeclarations(css: string): string[] {
  const found: string[] = [];
  for (const block of css.matchAll(/:host(\([^)]*\))?\s*\{([^}]*)\}/g)) {
    for (const line of block[2].split(';')) {
      if (RESET_VULNERABLE.test(line)) found.push(line.trim().split(':')[0].trim());
    }
  }
  return found;
}

describe(':host 레이아웃의 CSS 리셋 내성', () => {
  const offenders = new Map<string, string[]>();
  for (const rel of globSync('src/components/**/*.styles.ts', { cwd: root })) {
    const comp = basename(rel).replace('.styles.ts', '');
    const decls = hostLayoutDeclarations(readFileSync(join(root, rel), 'utf-8'));
    if (decls.length) offenders.set(comp, decls);
  }

  it('알려진 목록 밖의 컴포넌트가 :host 에 여백/테두리를 두지 않는다', () => {
    const unexpected = [...offenders.keys()].filter(c => !KNOWN_GAPS.has(c)).sort();
    expect(unexpected).toEqual([]);
  });

  it('고쳐진 컴포넌트가 알려진 목록에 남아 있지 않다', () => {
    // 목록이 실제보다 넓으면 회귀를 놓친다 — 고친 즉시 지워야 한다.
    const stale = [...KNOWN_GAPS].filter(c => !offenders.has(c)).sort();
    expect(stale).toEqual([]);
  });

  it('u-button 은 여백·테두리를 내부 요소가 그린다', () => {
    const css = readFileSync(join(root, 'src/components/button/UButton.styles.ts'), 'utf-8');
    expect(hostLayoutDeclarations(css), ':host 에 남은 레이아웃 선언').toEqual([]);
    // 내부 요소 규칙에 실제로 옮겨졌는지 확인 (선언만 지우면 버튼이 사라진다)
    expect(css).toMatch(/button,\s*a\s*\{[\s\S]*?padding:\s*var\(--btn-padding-block/);
    expect(css).toMatch(/button,\s*a\s*\{[\s\S]*?border:\s*1px solid var\(--btn-border-color/);
  });
});
