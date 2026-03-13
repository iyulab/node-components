import { css } from 'lit';

export const styles = css`
  /* ── Placement에 따른 정렬 ──────────────── */
  :host([placement="left"])   { justify-content: flex-start; }
  :host([placement="right"])  { justify-content: flex-end; }
  :host([placement="top"])    { flex-direction: column; justify-content: flex-start; }
  :host([placement="bottom"]) { flex-direction: column; justify-content: flex-end; }

  /* 좌우: 높이 100% */
  :host([placement="left"]) .panel,
  :host([placement="right"]) .panel {
    height: 100%;
    max-width: 100%;
  }
  /* 상하: 너비 100% */
  :host([placement="top"]) .panel,
  :host([placement="bottom"]) .panel {
    width: 100%;
    max-height: 100%;
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
    transition: transform 0.3s ease;
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
