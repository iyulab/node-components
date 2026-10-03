import { css } from "lit";

/**
 * 날짜 피커들(`u-date-picker` · `u-date-range-picker`)이 함께 쓰는 트리거·팝오버·하단 줄 규칙.
 * 호스트의 `display`/`width` 와 팝오버 폭은 피커마다 다르므로 각 피커의 시트가 갖는다.
 */
export const styles = css`
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.4em;
    padding: var(--u-field-padding-block, 0.3em) var(--u-field-padding-inline, 0.6em);
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: var(--u-field-radius, 0.25em);
    background-color: var(--u-input-bg-color, #FFFFFF);
    cursor: pointer;
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  :host([readonly]) .container,
  :host(:disabled) .container {
    cursor: not-allowed;
    border-color: var(--u-border-color-weak, #EEEEEE);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
  }
  :host(:not([readonly]):not(:disabled)) .container:hover {
    box-shadow: 0 0 0 1px var(--u-input-border-color-hover, #BDBDBD);
  }
  :host(:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }
  :host([invalid]:not([readonly]):not(:disabled)) .container {
    box-shadow: 0 0 0 1px var(--u-input-border-color-invalid, #C62828);
  }

  .text-content {
    flex: 1 0 auto;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .text-content.placeholder {
    color: var(--u-txt-color-weak, #616161);
  }

  .suffix-item {
    color: var(--u-icon-color, #616161);
    font-size: 1em;
    transition: color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .suffix-item:hover {
    color: var(--u-icon-color-hover, #1565C0);
  }

  u-popover {
    padding: 8px;
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-lg, 6px);
    background-color: var(--u-panel-bg-color, #FFFFFF);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
  }

  .calendar-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    margin-top: 4px;
    border-top: 1px solid var(--u-border-color-weak, #EEEEEE);
  }
`;
