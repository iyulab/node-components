import type { FocusTrap } from 'focus-trap';

/**
 * OverlayManager는 열린 오버레이의 스택을 관리합니다.
 *
 * - 오버레이 스택 순서 관리 (z-index 자동 증가)
 * - body scroll lock 참조 카운팅
 * - topmost 판별 (ESC 키 처리용)
 * - focus-trap trapStack 공유
 */
export class OverlayManager {
  /** 열린 오버레이 스택 */
  private static readonly stack: HTMLElement[] = [];
  /** z-index 카운터 */
  private static zCounter = 0;
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
    overlay.style.zIndex = String(9999 + (++this.zCounter));

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
