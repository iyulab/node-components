import { css } from 'lit';

export const styles = css`
  /* 위쪽 가운데에 선다 — 결과가 늘고 줄어도 칸이 제자리에 있다(가운데 정렬이면 칸이 위아래로 움직인다). */
  .container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    width: 100%;
    height: 100%;
    padding: min(12vh, 96px) var(--u-space-lg, 16px) var(--u-space-lg, 16px);
    box-sizing: border-box;
    pointer-events: none;
  }

  .panel {
    display: flex;
    flex-direction: column;
    width: min(var(--command-palette-width, 40rem), 100%);
    max-height: min(70vh, 36rem);
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-lg, 6px);
    background: var(--u-panel-bg-color, #FFFFFF);
    color: var(--u-txt-color, #212121);
    box-shadow: var(--u-shadow-xl, 0 6px 18px rgba(0, 0, 0, 0.24), 0 2px 6px rgba(0, 0, 0, 0.08));
    pointer-events: auto;
    overflow: hidden;
    opacity: 0;
    transform: translateY(-8px);
    transition:
      opacity var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  :host([open]) .panel {
    opacity: 1;
    transform: none;
  }
  @media (prefers-reduced-motion: reduce) {
    .panel { transition: none; }
  }

  .field {
    display: flex;
    align-items: center;
    gap: var(--u-space-sm, 8px);
    padding: 0 var(--u-space-md, 12px);
    border-bottom: 1px solid var(--u-border-color, #E0E0E0);
  }
  .field-icon {
    flex: none;
    font-size: 1.125em;
    color: var(--u-txt-color-weak, #616161);
  }
  .field-spinner {
    flex: none;
    font-size: 1em;
  }
  .input {
    all: unset;
    flex: 1;
    min-width: 0;
    min-block-size: 3rem;
    font: inherit;
    font-size: var(--u-text-body-size, 14px);
    color: inherit;
  }
  .input::placeholder {
    color: var(--u-txt-color-weak, #616161);
  }

  .listbox {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: var(--u-space-xs, 6px);
  }
  .listbox[hidden] {
    display: none;
  }

  .group + .group {
    margin-top: var(--u-space-xs, 6px);
  }
  .group-label {
    padding: var(--u-space-sm, 8px) var(--u-space-sm, 8px) var(--u-space-xs, 6px);
    font-size: var(--u-text-label-size, 13px);
    font-weight: 600;
    color: var(--u-txt-color-weak, #616161);
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--u-space-sm, 8px);
    /* 호스트 하한(--u-target-size, 미설정 = 0) — 터치 화면 설정에서 항목이 그만큼 커진다. */
    min-height: max(2.5rem, var(--u-target-size, 0px));
    padding: 0 var(--u-space-sm, 8px);
    border-radius: var(--u-radius-md, 4px);
    cursor: pointer;
  }
  .option[data-active] {
    background: var(--u-primary-bg-color, #E3F2FD);
  }
  .option-icon {
    flex: none;
    color: var(--u-txt-color-weak, #616161);
  }
  .option-label {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .option-description {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--u-text-label-size, 13px);
    color: var(--u-txt-color-weak, #616161);
  }

  .status:empty {
    display: none;
  }
  .status,
  .error {
    padding: var(--u-space-md, 12px);
    font-size: var(--u-text-label-size, 13px);
    color: var(--u-txt-color-weak, #616161);
  }

  @media (forced-colors: active) {
    .option[data-active] {
      outline: 2px solid Highlight;
      outline-offset: -2px;
    }
  }
`;
