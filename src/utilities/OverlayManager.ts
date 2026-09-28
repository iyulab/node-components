import type { FocusTrap } from 'focus-trap';

/**
 * OverlayManager는 **겹치는 표면 전체의 층(layer)을 소유**합니다.
 *
 * - 오버레이 스택 순서 관리 (z-index 자동 할당)
 * - **알림 층 z-index 제공** — 알림은 오버레이의 형제가 아니라 그 «위» 채널이다
 * - body scroll lock 참조 카운팅
 * - topmost 판별 (ESC 키 처리용)
 * - focus-trap trapStack 공유
 *
 * ## 층 스케일 — 왜 두 개의 «띠»인가
 *
 * 겹침을 컴포넌트마다 따로 정하면 어긋난다. 실측(2026-09-08)으로 `Toast` 가 자기 컨테이너에
 * `z-index: 9999` 를 박고 있었고 이 매니저가 오버레이에 **9999 «초과»** 를 주고 있어,
 * ***모달 안에서 띄운 오류 토스트가 구조적으로 항상 가려졌다.*** 알림이 도달하지 않는 것은
 * 조용한 실패라 아무도 보지 못했다.
 *
 * ⇒ 층을 **이름 있는 띠**로 고정한다(디자인 시스템의 표준 관용구다 — 겹침은 협상이 아니라
 * 계약이다):
 *
 * | 띠 | 범위 | 소유 |
 * |---|---|---|
 * | 오버레이 | `9999` ~ `9999 + OVERLAY_BAND` | `u-dialog`·`u-drawer` 등 `UOverlayElement` 계열 |
 * | **알림** | `notificationZIndex` | `Toast` — **오버레이 띠보다 항상 위** |
 *
 * ⚠**띠에 상한이 있는 것이 이 계약의 핵심이다.** 종전 `zCounter` 는 «지금까지 열린 총합»이라
 * 단조 증가해 **상한이 없었고**, 상한이 없으면 «알림이 항상 위»를 어떤 상수로도 보장할 수
 * 없다. 이제 **동시에 열린 깊이**(`stack.length`)로 할당하므로 띠 안에 갇힌다.
 * 동시 오버레이가 `OVERLAY_BAND` 를 넘으면 그 이상은 같은 값을 공유한다(서로 간 겹침 순서만
 * 포기하고, **알림이 위**라는 불변식은 유지된다) — 실제 앱이 도달하는 상태가 아니지만,
 * 도달하더라도 무엇이 깨지는지 정해져 있는 편이 낫다.
 */
export class OverlayManager {
  /** 열린 오버레이 스택 */
  private static readonly stack: HTMLElement[] = [];

  /** 오버레이 띠의 시작 값 */
  private static readonly OVERLAY_BASE = 9999;
  /** 오버레이 띠의 폭 — 이 수를 넘는 «동시» 오버레이는 최상단 값을 공유한다 */
  private static readonly OVERLAY_BAND = 1000;

  /**
   * 알림 층의 z-index. **오버레이 띠 전체보다 항상 위**임이 보장된다.
   *
   * 토스트·스낵바처럼 «오버레이 위에서도 반드시 보여야 하는» 표면이 쓴다. 직접 상수를
   * 박지 말고 이 값을 읽을 것 — 그래야 띠가 조정돼도 따라온다.
   */
  public static get notificationZIndex(): number {
    return this.OVERLAY_BASE + this.OVERLAY_BAND + 1;
  }
  /** body scroll lock 참조 카운트 */
  private static lockCount = 0;
  /** scroll lock 이전 body overflow 값 */
  private static savedOverflow = '';

  /** focus-trap 공유 trapStack */
  public static readonly trapStack: FocusTrap[] = [];

  /**
   * 닫을 수 있는 층 — **여는 순서대로** 쌓인다. 대화상자·서랍(`UOverlayElement`)만이 아니라
   * 팝오버·앱 셸의 패널처럼 z-index 띠를 쓰지 않는 층도 여기 선다.
   *
   * ## 왜 한 곳인가 — «한 번의 Escape 는 가장 위 층 하나만 닫는다»
   *
   * 층마다 제 리스너로 Escape 를 받으면 순서가 «리스너를 등록한 순서» 가 된다. 그것은 층이 쌓인
   * 순서와 다르다 — 앱 셸은 패널을 열 때 등록하므로 패널 «안» 에서 나중에 연 서랍보다 먼저 돌아
   * 바깥을 닫았고, 닫힌 팝오버가 document 에서 Escape 를 먹어 셸의 닫기를 막았고, 팝오버 안에서 연
   * 하위 팝오버는 Escape 한 번에 둘 다 닫혔다. 순서를 «여는 순서» 로 한 곳에 두면 셋이 같은 규칙이
   * 된다.
   *
   * 리스너는 **document 버블 하나이고, 모듈을 읽을 때 한 번 붙는다** — 안쪽 컨트롤(목록·입력)이
   * 요소 수준에서 먹은 Escape(`defaultPrevented`)는 층을 닫지 않고, 앱이 window 에 건 리스너보다는
   * 항상 먼저 돈다(층이 열린 «뒤» 에 붙이면 먼저 등록된 앱 리스너가 소비 전의 키를 본다 — 팝오버가
   * 층이 되기 전 document 에서 먹던 순서를 지킨다). 층이 없으면 곧바로 돌아간다. 층을 닫은 Escape 는 `preventDefault` 로 소비됐음을
   * 알린다(뒤에 듣는 앱 리스너가 «누가 먹었나» 를 가릴 수 있게). IME 조합 중인 Escape 는 조합을
   * 끝내는 키라 받지 않는다.
   */
  private static readonly layers: { el: HTMLElement; onEscape: (e: KeyboardEvent) => boolean | void }[] = [];

  /**
   * 층을 연다 — 이미 열려 있으면 맨 위로 옮긴다. `onEscape` 는 이 층이 가장 위일 때 Escape 가 부른다.
   *
   * `onEscape` 가 `false` 를 돌려주면 **거절**이다 — 키를 소비하지 않고 어떤 층도 닫지 않는다.
   * 비모달 패널이 «포커스가 자기 안에 있을 때만» Escape 로 닫히는 경우에 쓴다(WAI-ARIA 비모달 대화상자).
   */
  public static openLayer(el: HTMLElement, onEscape: (e: KeyboardEvent) => boolean | void): void {
    this.closeLayer(el);
    this.layers.push({ el, onEscape });
  }

  /** 층을 닫는다(스택에서 뺀다). 열려 있지 않으면 아무것도 하지 않는다. */
  public static closeLayer(el: HTMLElement): void {
    const idx = this.layers.findIndex(l => l.el === el);
    if (idx === -1) return;
    this.layers.splice(idx, 1);
  }

  /** 가장 위의 층(없으면 `undefined`). */
  public static get topLayer(): HTMLElement | undefined {
    return this.layers[this.layers.length - 1]?.el;
  }

  private static handleLayerKeydown = (e: KeyboardEvent): void => {
    if (e.key !== 'Escape' || e.isComposing || e.defaultPrevented) return;
    const top = OverlayManager.layers[OverlayManager.layers.length - 1];
    if (!top) return;
    if (top.onEscape(e) === false) return;
    e.preventDefault();
  };

  static {
    if (typeof document !== 'undefined') document.addEventListener('keydown', OverlayManager.handleLayerKeydown);
  }

  /** 현재 열린 오버레이 수 */
  public static get size(): number {
    return this.stack.length;
  }

  /** 가장 위에 있는 오버레이인지 확인 */
  public static isTopmost(overlay: HTMLElement): boolean {
    return this.stack.length > 0 && this.stack[this.stack.length - 1] === overlay;
  }

  /**
   * 오버레이를 스택에 등록합니다.
   * @param overlay 오버레이 엘리먼트
   * @param lockBody true이면 body scroll lock
   */
  public static add(overlay: HTMLElement, lockBody = true): void {
    this.stack.push(overlay);
    // «동시에 열린 깊이»로 할당한다 — 종전의 «지금까지 열린 총합»은 단조 증가라 띠에 상한이
    // 없었고, 그래서 «알림이 항상 위»를 어떤 상수로도 보장할 수 없었다(위 클래스 주석).
    overlay.style.zIndex = String(
      this.OVERLAY_BASE + Math.min(this.stack.length, this.OVERLAY_BAND)
    );

    if (lockBody) {
      if (this.lockCount === 0) {
        this.savedOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
      }
      this.lockCount++;
    }
  }

  /**
   * 오버레이를 스택에서 제거합니다.
   * @param overlay 오버레이 엘리먼트
   * @param lockBody add 시 lockBody와 동일한 값
   */
  public static remove(overlay: HTMLElement, lockBody = true): void {
    const idx = this.stack.indexOf(overlay);
    if (idx !== -1) this.stack.splice(idx, 1);

    if (lockBody && this.lockCount > 0) {
      this.lockCount--;
      if (this.lockCount === 0) {
        document.body.style.overflow = this.savedOverflow;
        this.savedOverflow = '';
      }
    }
  }
}
