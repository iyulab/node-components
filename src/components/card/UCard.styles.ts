import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    border-radius: var(--u-radius-xl, 8px);
    background-color: var(--u-panel-bg-color, #FFFFFF);
    box-shadow: var(--u-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05));
    overflow: hidden;

    --card-border-width: 1px;
    --card-border-color: var(--u-border-color, #E0E0E0);
  }

  /* 테두리는 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다.
     그래서 면(호스트)과 테두리(.base)가 한 상자여야 한다: 카드가 늘어나면(같은 행 높이 맞춤 · 높이 지정 · grid 행)
     .base 도 호스트의 주축으로 늘어난다. 종전에는 세로 카드에서 내용 높이에 머물러 그 아래에 면만 한 번 더 그려졌다. */
  .base {
    box-sizing: border-box;
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    display: flex;
    flex-direction: inherit;
    border: var(--card-border-width) solid var(--card-border-color);
    border-radius: inherit;
    overflow: hidden;
  }

  :host([orientation="vertical"]) {
    flex-direction: column;
  }
  :host([orientation="horizontal"]) {
    flex-direction: row;
  }
  :host([appearance="plain"]) {
    --card-border-width: 0;
    box-shadow: none;
  }
  /* 톤 — 안쪽 상자(.base)에 칠한다: 호스트에 건 --card-border-color(바깥 시트)가 덮지 못하게. */
  :host([tone]) .base {
    border-width: max(var(--card-border-width), 1px);
  }
  :host([tone="primary"]) .base {
    border-color: var(--u-primary-color, #1976D2);
    box-shadow: inset 0 0 0 1px var(--u-primary-color, #1976D2);
  }
  :host([tone="info"]) .base {
    border-color: var(--u-info-color-weak, #2196F3);
    background-color: var(--u-info-bg-color, #E3F2FD);
  }
  :host([tone="success"]) .base {
    border-color: var(--u-success-color-weak, #4CAF50);
    background-color: var(--u-success-bg-color, #E8F5E9);
  }
  :host([tone="warning"]) .base {
    border-color: var(--u-warning-color-weak, #FFEB3B);
    background-color: var(--u-warning-bg-color, #FFF59D);
  }
  :host([tone="danger"]) .base {
    border-color: var(--u-danger-color-weak, #F44336);
    background-color: var(--u-danger-bg-color, #FFEBEE);
  }
  @media (forced-colors: active) {
    :host([tone]) .base {
      border-color: CanvasText;
    }
  }
  :host([shadowless]) {
    box-shadow: none;
  }
  :host([hoverable]) {
    cursor: pointer;
    transition: all var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  :host([hoverable]:hover) {
    transform: translateY(-2px);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
  }

  /* 카드 전체 링크 — 카드로 읽힌다: 글자는 잉크, 밑줄 없음. hover 는 테두리가 싣고 들어 올리지 않는다
     (카드 격자에서 하나만 떠오르면 줄이 흔들린다). 호스트가 overflow 를 자르므로 포커스 링은 안쪽에 그린다. */
  a.base {
    color: inherit;
    text-decoration: none;
    cursor: pointer;
    transition: border-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  a.base:hover {
    --card-border-color: var(--u-border-color-strong, #BDBDBD);
  }
  a.base:focus-visible {
    outline-offset: -2px;
  }
  @media (prefers-reduced-motion: reduce) {
    a.base { transition: none; }
  }

  .media {
    display: none;
    flex-shrink: 0;
    overflow: hidden;
  }
  .media.has-content {
    display: block;
  }

  .content {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .header {
    display: none;
    padding: var(--u-space-lg, 16px);
    border-bottom: 1px solid var(--u-border-color, #E0E0E0);
  }
  .header.has-content {
    display: block;
  }

  .body {
    display: none;
    flex: 1;
    padding: var(--u-space-lg, 16px);
  }
  .body.has-content {
    display: block;
  }

  .footer {
    display: none;
    padding: var(--u-space-lg, 16px);
    border-top: 1px solid var(--u-border-color, #E0E0E0);
  }
  .footer.has-content {
    display: block;
  }
`;
