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
