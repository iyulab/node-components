import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Theme } from '../../src/utilities/Theme.js';

/**
 * 규약: **내장 토큰 시트는 «기본값» 층이므로, 문서에 이미 올라와 있는 스타일에 진다.**
 *
 * ★**왜 이 파일이 생겼는가 — 소비자가 잰 뒤에야 알았다**(cycle-688~690, docket `#399`).
 * `Theme.init()` 이 내장 시트를 `document.head` **끝**에 붙이고 있었다. 소비자(또는 하우스
 * 프리셋)가 같은 `--u-*` 토큰을 `:root` 로 덮으면 **특이도가 대등**하므로 승부는 문서 순서가
 * 가르는데, 소비자 시트는 번들러가 **파싱 시점에** 올리고 이 시트는 **런타임에** 붙는다
 * ⇒ ***언제나 기본값이 이겼다.***
 *
 * 🔴**그 실패는 조용하다.** 오류도 경고도 없고, 두 시트의 값이 일부만 다르면(실측: 상위 세 단과
 * 반경만 다르고 하위 네 단은 동일) **한 군데도 적용되지 않았는데 적용된 것처럼 보인다.**
 *
 * ⚠**이 계약은 «계산값» 으로만 잴 수 있다.** 어떤 노드가 어디 붙었는지를 단언하면 배치를 재는
 * 것이지 캐스케이드를 재는 것이 아니다 — 이 리포가 `flex-table` 에서 배운 것과 같은 형태다
 * (*emit 되는 문자열은 배치가 아니다*). 그래서 `getComputedStyle` 로 읽는다.
 */
describe('Theme.init() — 내장 시트는 바닥 층이다', () => {
  const CONSUMER_SHEET_ID = 'probe-consumer-sheet';
  const TOKEN = '--u-text-title-size';
  const CONSUMER_VALUE = '99px';

  function readToken(): string {
    return getComputedStyle(document.documentElement).getPropertyValue(TOKEN).trim();
  }

  function removeBuiltIn(): void {
    for (const el of document.head.querySelectorAll('style[data-name]')) el.remove();
  }

  beforeEach(() => {
    removeBuiltIn();
    document.getElementById(CONSUMER_SHEET_ID)?.remove();
  });

  afterEach(() => {
    document.getElementById(CONSUMER_SHEET_ID)?.remove();
  });

  it('🔴소비자 시트가 «먼저» 올라와 있어도 내장 시트가 그것을 덮지 않는다', async () => {
    // 소비자 시트를 정적 import 처럼 «먼저» 올린다.
    const consumer = document.createElement('style');
    consumer.id = CONSUMER_SHEET_ID;
    consumer.textContent = `:root { ${TOKEN}: ${CONSUMER_VALUE}; }`;
    document.head.appendChild(consumer);
    expect(readToken()).toBe(CONSUMER_VALUE);

    await Theme.init({ default: 'light' });

    // ★네거티브 컨트롤의 자리: 삽입 지점을 `appendChild` 로 되돌리면 여기가 중립 값이 된다.
    expect(readToken()).toBe(CONSUMER_VALUE);
  });

  it('내장 시트는 실제로 값을 «제공» 한다 — 덮이지 않는 것이 아니라 바닥에 있는 것이다', async () => {
    await Theme.init({ default: 'light' });
    const base = readToken();
    expect(base).not.toBe('');
    expect(base).not.toBe(CONSUMER_VALUE);
  });

  it('내장 시트가 문서의 다른 스타일보다 앞에 선다', async () => {
    const consumer = document.createElement('style');
    consumer.id = CONSUMER_SHEET_ID;
    consumer.textContent = ':root { --probe: 1; }';
    document.head.appendChild(consumer);

    await Theme.init({ default: 'light' });

    const nodes = [...document.head.children];
    const ours = nodes.filter(n => n.hasAttribute?.('data-name'));
    expect(ours.length).toBeGreaterThan(0);
    const lastOurs = nodes.indexOf(ours[ours.length - 1]);
    expect(lastOurs).toBeLessThan(nodes.indexOf(consumer));
  });

  it('우리 시트끼리의 번들 순서는 뒤집히지 않는다', async () => {
    await Theme.init({ default: 'light' });
    const names = [...document.head.querySelectorAll('style[data-name]')]
      .map(el => el.getAttribute('data-name'));
    // 매번 firstChild 앞에 넣으면 역순이 된다. 결과를 바꾸지는 않지만(dark 는 특이도로
    // 이긴다) 순서가 뒤집히는 자료구조를 남기지 않는다.
    expect(names).toEqual([...names].sort((a, b) => (a! < b! ? -1 : 1)));
  });

  it('두 번 불러도 시트가 중복되지 않는다', async () => {
    await Theme.init({ default: 'light' });
    const first = document.head.querySelectorAll('style[data-name]').length;
    await Theme.init({ default: 'light' });
    expect(document.head.querySelectorAll('style[data-name]').length).toBe(first);
  });
});
