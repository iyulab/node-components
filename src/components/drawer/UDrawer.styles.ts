import { css } from 'lit';

export const styles = css`
  /* ── Placement에 따른 정렬 ──────────────── */
  :host([placement="left"])   { justify-content: flex-start; }
  :host([placement="right"])  { justify-content: flex-end; }
  :host([placement="top"])    { flex-direction: column; justify-content: flex-start; }
  :host([placement="bottom"]) { flex-direction: column; justify-content: flex-end; }

  /* 좌우: 높이 100%, 너비 = --drawer-size */
  :host([placement="left"]) .panel,
  :host([placement="right"]) .panel {
    height: 100%;
    width: var(--drawer-size, 28rem);
    max-width: 100%;
  }
  /* 상하: 너비 100%, 높이 = --drawer-size */
  :host([placement="top"]) .panel,
  :host([placement="bottom"]) .panel {
    width: 100%;
    height: var(--drawer-size, 16rem);
    max-height: 100%;
  }

  /* 모바일: 좌우 드로어는 전체 너비로 펼쳐 입력 공간을 확보한다. */
  @media (max-width: 640px) {
    :host([placement="left"]) .panel,
    :host([placement="right"]) .panel {
      width: 100%;
    }
  }

  /* placement별 border */
  :host([placement="left"]) .panel   { border-right: 1px solid var(--u-border-color); }
  :host([placement="right"]) .panel  { border-left: 1px solid var(--u-border-color); }
  :host([placement="top"]) .panel    { border-bottom: 1px solid var(--u-border-color); }
  :host([placement="bottom"]) .panel { border-top: 1px solid var(--u-border-color); }

  /* 닫힌 상태 */
  :host([placement="left"]) .panel   { transform: translateX(-100%); }
  :host([placement="right"]) .panel  { transform: translateX(100%); }
  :host([placement="top"]) .panel    { transform: translateY(-100%); }
  :host([placement="bottom"]) .panel { transform: translateY(100%); }

  /* 열린 상태 */
  :host([open][placement="left"]) .panel,
  :host([open][placement="right"]) .panel  { transform: translateX(0); }
  :host([open][placement="top"]) .panel,
  :host([open][placement="bottom"]) .panel { transform: translateY(0); }

  .panel {
    display: flex;
    flex-direction: column;
    background: var(--u-panel-bg-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    /*
     * easeOutQuart (cubic-bezier(0.22, 1, 0.36, 1)) — 빠르게 시작해서 부드럽게 정착.
     * 운영자 선호: 거의 90% 빠르게 패널이 표시되고 점점 천천히 완성, 빠릿빠릿한 느낌.
     * 13차 run: 0.55s easeOutExpo는 "띠요옹" 떨림 느낌 → 0.35s easeOutQuart로 단축.
     * UOverlayElement의 backdrop opacity transition과 동일 duration/easing으로 맞춤.
     * 호스트 앱이 ::part(panel) { transition: ... }로 추가 override 가능.
     */
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1);
  }

  .header {
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 16px;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    border-bottom: 1px solid var(--u-border-color);
  }
  .header .close-btn {
    flex-shrink: 0;
    padding: 4px;
    font-size: inherit;
    border-radius: 4px;
  }

  .body {
    flex: 1 1 auto;
    min-height: 0;
    display: block;
    padding: 16px;
    overflow: auto;
  }

  ::slotted([slot="footer"]) {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--u-border-color);
  }
`;
