import { LitElement, CSSResultGroup, render, RenderOptions } from 'lit';
import { styles } from './UElement.styles.js';
import { Locale } from '../utilities/Locale.js';

/**
 * 모든 UI 컴포넌트의 기반 클래스.
 * LitElement를 확장하여 이벤트 발행 및 렌더 교체 헬퍼를 제공합니다.
 */
/**
 * 디자인 토큰 시트 부재를 개발 빌드에서 1회 경고한다.
 *
 * 토큰이 없으면 컴포넌트 시트의 `var(--u-…)` 가 전부 무효가 되어 테두리·배경이 **에러 없이**
 * 사라진다. CSS 는 이때 아무 신호도 내지 않으므로, 소비자는 자기 CSS 를 의심하며 며칠을 쓴다.
 * 실제로 운영 화면이 무스타일로 렌더된 사례가 있었다 — 토큰 주입이 `Theme.init()` 호출
 * (셸이 대신 부른다)에만 딸려 있어서, 셸 밖에서 렌더되는 로그인 화면만 조용히 깨졌다.
 *
 * ★리터럴 폴백(1.14.0)이 그 **소멸**은 막는다. 그래도 경고는 유지한다 — 폴백은 라이트
 * 시트 값을 구워 넣은 것이라 **다크 테마가 라이트 색으로 렌더되고**, 테마 변수 오버라이드도
 * 먹지 않는다. 폴백은 *"조용히 사라지지 않게"* 하는 안전망이지 *"시트 없이 써도 된다"* 가
 * 아니다. 둘을 섞으면 이 경고가 고발하는 무증상 열화가 형태만 바꿔 돌아온다.
 */
let tokenCheckDone = false;
function warnIfTokensMissing(): void {
  if (tokenCheckDone || typeof document === 'undefined') return;
  tokenCheckDone = true;
  const probe = getComputedStyle(document.documentElement)
    .getPropertyValue('--u-blue-600').trim();
  if (probe) return;
  console.warn(
    '[@iyulab/components] No design-token sheet found in the document — components render ' +
    'with their built-in fallbacks (baked from the light theme). Dark theme and theme ' +
    'variable overrides will not apply.\n' +
    "  Static CSS:  import '@iyulab/components/styles/tokens.css'\n" +
    '  At runtime:  Theme.init()\n' +
    '  (The @iyulab/modern-app shell calls Theme.init() for you. Screens rendered outside ' +
    'the shell — login, onboarding, embeds — need one of the two.)',
  );
}

export class UElement extends LitElement {
  static styles: CSSResultGroup = styles;

  /** 연결된 동안의 로케일 구독 해제 함수 · 떨어질 때 본 로케일 판(다시 붙을 때 그 사이 바뀌었는가를 묻는다). */
  private unsubscribeLocale?: () => void;
  private detachedLocaleRevision?: number;

  connectedCallback(): void {
    super.connectedCallback();
    if (process.env.NODE_ENV !== 'production') warnIfTokensMissing();
    this.unsubscribeLocale = Locale.subscribe(() => this.localeChanged());
    // 떨어져 있는 동안 바뀌었으면 지금 따라간다 — Lit 은 다시 붙을 때 다시 그리지 않는다.
    if (this.detachedLocaleRevision !== undefined && this.detachedLocaleRevision !== Locale.revision) this.localeChanged();
    this.detachedLocaleRevision = undefined;
  }

  disconnectedCallback(): void {
    this.unsubscribeLocale?.();
    this.unsubscribeLocale = undefined;
    this.detachedLocaleRevision = Locale.revision;
    super.disconnectedCallback();
  }

  /** `performUpdate()` 안인가 — 렌더 도중에 같은 요소의 렌더를 다시 당기지 않으려고. */
  private updating = false;

  protected override performUpdate(): void {
    this.updating = true;
    try {
      super.performUpdate();
    } finally {
      this.updating = false;
    }
  }

  /**
   * 대기 중인 렌더를 지금 끝낸다 — **렌더된 상태를 읽는 동기 판정**(검증이 안쪽 네이티브 요소의 `validity` 를
   * 읽는 것 등)이 바로 앞의 속성 변경을 보게 한다. `el.value = x; el.validate()` 가 같은 틱에 바꾸기 전 값으로
   * 판정하던 것을 막는다. 첫 렌더 전이거나 렌더 도중이면 아무것도 하지 않는다.
   */
  protected flushUpdate(): void {
    if (this.hasUpdated && this.isUpdatePending && !this.updating) this.performUpdate();
  }

  /**
   * 로케일이 바뀌었다(`Locale.set` · `Locale.register`) — 기본은 다시 그린다. 렌더 밖에서 로케일 문장을 담아 둔
   * 컴포넌트(속성·`ElementInternals`·필드에 적어 둔 이름)는 이것을 재정의해 그 값을 다시 적고 `super` 를 부른다.
   * 종전에는 런타임에 언어를 바꿔도 이미 그려진 문장이 다음 재렌더까지 옛 언어로 남았다.
   */
  protected localeChanged(): void {
    this.requestUpdate();
  }

  /**
   * 커스텀 이벤트를 생성하여 발행합니다.
   * 기본적으로 bubbles, composed, cancelable이 활성화됩니다.
   *
   * @typeParam T - 이벤트 detail의 타입
   * @param name - 이벤트 이름 (예: 'show')
   * @param options - CustomEventInit 오버라이드
   * @returns preventDefault가 호출되지 않았으면 true
   */
  protected fire<T>(name: string, options?: CustomEventInit): boolean {
    return this.dispatchEvent(new CustomEvent<T>(name, {
        bubbles: true,
        composed: true,
        cancelable: true,
        ...options,
      }),
    );
  }

  /**
   * 네이티브 이벤트를 호스트 엘리먼트에서 (재)발행합니다.
   * 기존 이벤트를 전달하면 원본을 중단하고 동일 타입으로 재발행하며,
   * 새 이벤트를 직접 전달할 수도 있습니다.
   *
   * @param event - 재발행할 이벤트 또는 새로 생성한 네이티브 이벤트
   * @param options - EventInit 오버라이드
   * @returns preventDefault가 호출되지 않았으면 true
   */
  protected relay(event: Event, options?: EventInit): boolean {
    event.stopImmediatePropagation();

    const ctor = event.constructor as typeof Event;
    return this.dispatchEvent(new ctor(event.type, {
        ...event,
        ...options,
      }),
    );
  }

  /**
   * 현재 shadow DOM의 렌더 결과를 지정한 템플릿으로 완전히 교체합니다.
   *
   * @param value - Lit 템플릿 결과 또는 기타 렌더링 가능한 값
   * @param options - Lit의 RenderOptions (예: renderBefore 등)
   * 
   * @remarks
   * Lit은 브라우저 환경에 따라 스타일을 두 가지 방식으로 주입합니다.
   *
   * - **모던 브라우저**: `shadowRoot.adoptedStyleSheets`에 `CSSStyleSheet` 객체로 주입.
   *   이 경우 `<style>` 태그 노드는 존재하지 않으므로 전체 `shadowRoot`를 교체해도 스타일이 유지됩니다.
   *
   * - **구형 브라우저 (폴리필 환경)**: `<style>` 태그를 shadow DOM 안에 직접 주입.
   *  이 경우 `<style>` 태그 노드를 제거하면 스타일이 사라지므로, 에러 UI로 교체할 때는 `<style>` 태그 노드를 보존해야 합니다.
   *
   * 따라서 `<style>` 태그 노드는 보존하고 나머지 노드를 제거한 뒤
   * 에러 div를 append하는 방식으로 양쪽 환경 모두에서 안전하게 동작합니다.
   *
   * @example
   * ```ts
   * this.replace(html`
   *   <span class="error">Something went wrong</span>
   * `);
   * ```
   */
  protected replace(value: unknown, options?: RenderOptions): void {
    if (!this.renderRoot) return;

    // STYLE 노드만 보존하고 나머지 노드 제, Lit 스타일 유지 목적
    Array.from(this.renderRoot.childNodes).forEach(node => {
      if (!(node instanceof HTMLStyleElement)) {
        node.parentNode?.removeChild(node);
      }
    });

    // Lit이 관리할 렌더 컨테이너 생성
    const container = document.createElement('div');
    container.style.display = 'contents';
    this.renderRoot.appendChild(container);

    // Lit 템플릿 렌더
    render(value, container, options);
  }
}