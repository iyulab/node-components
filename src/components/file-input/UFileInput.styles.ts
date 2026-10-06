import { css } from "lit";

export const styles = css`
  :host {
    display: var(--u-file-input-display, inline-block);
    width: var(--u-file-input-width, auto);
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.6em;
  }

  .trigger {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    padding: 0.4em 0.9em;
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    /* 호스트 하한(--u-target-size, 미설정 = 0). */
    box-sizing: border-box;
    min-height: var(--u-target-size, 0px);
    border-radius: 0.25em;
    background-color: var(--u-panel-bg-color, #FFFFFF);
    color: var(--u-primary-color, #1976D2);
    font: inherit;
    font-weight: 500;
    cursor: pointer;
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), background-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .trigger:hover:not(:disabled) {
    background-color: var(--u-neutral-100, #F5F5F5);
    border-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  .trigger:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--u-focus-ring-color, #1565C0),
      0 0 0 3px color-mix(in srgb, var(--u-focus-ring-color, #1565C0) 22%, transparent);
  }
  .trigger:disabled {
    color: var(--u-txt-color-weak, #616161);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
    border-color: var(--u-border-color-weak, #EEEEEE);
    cursor: not-allowed;
  }

  .status {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.9em;
  }
  .status[data-empty] {
    color: var(--u-txt-color-weak, #616161);
  }

  .clear-btn {
    flex-shrink: 0;
    color: var(--u-icon-color, #616161);
    font-size: 1em;
    cursor: pointer;
    /* 받는 영역 — 글리프는 1em 그대로, 상자만 ≥ 24px(WCAG 2.2 SC 2.5.8) · 호스트 하한(--u-target-size)이면 그 값.
       u-input·u-select 와 같은 식이다. 위·아래·왼쪽(파일 이름 쪽, 타깃 아님)은 음수 여백으로 넓혀 줄 높이와 배치를 지키고,
       오른쪽은 필드 끝이라 넓히지 않는다(호스트 밖으로 나가 이웃을 덮지 않게) — 글리프가 그만큼 안쪽으로 온다. */
    --_target-pad: max(0.25em, calc(12px - 0.5em), calc(var(--u-target-size, 0px) / 2 - 0.5em));
    box-sizing: content-box;
    padding: var(--_target-pad);
    margin: calc(-1 * var(--_target-pad)) 0 calc(-1 * var(--_target-pad)) calc(-1 * var(--_target-pad));
    transition: color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .clear-btn:hover {
    color: var(--u-icon-color-hover, #1565C0);
  }
  .clear-btn:active {
    color: var(--u-icon-color-active, #1565C0);
  }

  :host([invalid]) .trigger {
    border-color: var(--u-input-border-color-invalid, #C62828);
  }
`;
