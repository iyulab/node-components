// `Toast` 컨테이너 캐시의 생명주기. **브라우저에서만 증명된다** — 이 결함의 증상은
// 「연결되지 않은 엘리먼트의 `updateComplete` 가 해소되지 않는다」인데, 그것은 Lit 이 첫
// 업데이트를 `connectedCallback` 에서 돌리는 실제 커스텀 엘리먼트 생명주기의 성질이다.
//
// ★네거티브 컨트롤: 수정을 되돌리면(문자열 키 + `isConnected` 미검사) 아래 세 케이스가
//   각각 «타임아웃» · «0건» · «컨테이너 2개» 로 실패한다.
import { describe, it, expect, beforeEach } from 'vitest';
import { Toast } from '../../src/utilities/Toast.js';

/** 해소되지 않는 Promise 를 «영원한 대기» 대신 판정 가능한 값으로 바꾼다. */
function settledWithin<T>(p: Promise<T>, ms = 2500): Promise<'settled' | 'hung'> {
  return Promise.race([
    p.then(() => 'settled' as const),
    new Promise<'hung'>((r) => setTimeout(() => r('hung'), ms)),
  ]);
}

const alertsIn = (root: ParentNode) => root.querySelectorAll('u-alert').length;
const containersIn = (el: Element) => el.querySelectorAll(':scope > div').length;

describe('Toast container lifecycle', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    window.scrollTo(0, 0);
  });

  it('같은 id 의 타깃이 다시 만들어져도 토스트가 뜨고 Promise 가 해소된다', async () => {
    // 화면 1 — 소비앱이 페이지 엘리먼트에 앵커한 토스트를 띄운다
    let screen = document.createElement('div');
    screen.id = 'page-orders';
    document.body.appendChild(screen);

    expect(await settledWithin(Toast.success('on screen 1', { target: screen, duration: 60000 })))
      .toBe('settled');
    await new Promise((r) => setTimeout(r, 150));
    expect(alertsIn(screen)).toBe(1);

    // 라우트 이동 — 같은 id 의 «다른» 엘리먼트로 교체된다
    screen.remove();
    screen = document.createElement('div');
    screen.id = 'page-orders';
    document.body.appendChild(screen);

    // 종전 구현은 여기서 낡은(분리된) 컨테이너를 돌려주어 Promise 가 해소되지 않았다
    expect(await settledWithin(Toast.error('on screen 2', { target: screen, duration: 60000 })))
      .toBe('settled');
    await new Promise((r) => setTimeout(r, 200));
    expect(alertsIn(screen)).toBe(1);
    expect(alertsIn(document)).toBe(1);
  });

  it('호스트 body 가 교체돼도 다음 토스트가 문서에 실제로 들어간다', async () => {
    expect(await settledWithin(Toast.success('first', { duration: 60000 }))).toBe('settled');
    await new Promise((r) => setTimeout(r, 150));
    expect(alertsIn(document)).toBe(1);

    // 셸 재구축 — 캐시된 컨테이너가 문서에서 떨어진다
    document.body.innerHTML = '';
    expect(alertsIn(document)).toBe(0);

    expect(await settledWithin(Toast.error('second', { duration: 60000 }))).toBe('settled');
    await new Promise((r) => setTimeout(r, 200));
    expect(alertsIn(document)).toBe(1);
  });

  it('id 없는 타깃에 두 번 띄워도 컨테이너는 하나만 생긴다', async () => {
    const anon = document.createElement('div');
    document.body.appendChild(anon);

    await Toast.info('a', { target: anon, duration: 60000 });
    await Toast.info('b', { target: anon, duration: 60000 });
    await new Promise((r) => setTimeout(r, 200));

    // 종전 구현은 키 폴백이 `el-${Date.now()}` 라 호출마다 컨테이너를 새로 만들었다
    expect(containersIn(anon)).toBe(1);
    expect(alertsIn(anon)).toBe(2);
  });

  it('위치가 다르면 같은 타깃 안에서도 컨테이너가 나뉜다', async () => {
    const host = document.createElement('div');
    host.id = 'multi-position';
    document.body.appendChild(host);

    await Toast.info('tr', { target: host, position: 'top-right', duration: 60000 });
    await Toast.info('bl', { target: host, position: 'bottom-left', duration: 60000 });
    await new Promise((r) => setTimeout(r, 200));

    expect(containersIn(host)).toBe(2);
    expect(alertsIn(host)).toBe(2);
  });

  it('분리된 타깃을 넘기면 «멈추지 않고» 경고와 함께 즉시 끝난다', async () => {
    const detached = document.createElement('div');   // 문서에 붙이지 않는다
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (...args: unknown[]) => { warnings.push(String(args[0])); };
    try {
      expect(await settledWithin(Toast.error('nowhere', { target: detached, duration: 60000 })))
        .toBe('settled');
    } finally {
      console.warn = original;
    }
    expect(warnings.some((w) => w.includes('Toast was not shown'))).toBe(true);
    expect(alertsIn(detached)).toBe(0);
  });
});
