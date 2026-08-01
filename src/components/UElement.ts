import { LitElement, CSSResultGroup, render, RenderOptions } from 'lit';
import { styles } from './UElement.styles.js';

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
 */
let tokenCheckDone = false;
function warnIfTokensMissing(): void {
  if (tokenCheckDone || typeof document === 'undefined') return;
  tokenCheckDone = true;
  const probe = getComputedStyle(document.documentElement)
    .getPropertyValue('--u-blue-600').trim();
  if (probe) return;
  console.warn(
    '[@iyulab/components] 디자인 토큰 시트가 문서에 없습니다 — 컴포넌트의 테두리·배경·색이 ' +
    '무효가 됩니다.\n' +
    "  정적 CSS:  import '@iyulab/components/styles/tokens.css'\n" +
    '  또는 런타임: Theme.init()\n' +
    '  (@iyulab/modern-app 셸은 Theme.init() 을 대신 호출합니다. 셸 밖에서 렌더되는 화면' +
    '(로그인·온보딩·임베드)에서는 위 둘 중 하나가 필요합니다.)',
  );
}

export class UElement extends LitElement {
  static styles: CSSResultGroup = styles;

  connectedCallback(): void {
    super.connectedCallback();
    if (import.meta.env?.DEV) warnIfTokensMissing();
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