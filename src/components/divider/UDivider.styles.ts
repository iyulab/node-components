import { css } from "lit";

export const styles = css`
  :host {
    --divider-size: 1px;
    --divider-color: var(--u-neutral-300);
    --divider-spacing: 8px;
  }

  :host {
    display: flex;
    align-items: center;
    margin: var(--divider-spacing) 0;
  }

  /* variant */
  :host([variant="dashed"]) .line {
    border-top-style: dashed;
  }
  :host([variant="dotted"]) .line {
    border-top-style: dotted;
  }

  /* align */
  :host([align="start"]) .line:first-child {
    flex: 0 0 24px;
  }
  :host([align="end"]) .line:last-child {
    flex: 0 0 24px;
  }

  :host([has-label]) .label {
    display: inline-flex;
    align-items: center;
  }

  /* 구분 선 */
  .line {
    flex: 1;
    border-top: var(--divider-size) solid var(--divider-color);
  }

  /* 슬롯 콘텐츠 */
  .label {
    display: none;
    padding: 0 12px;
    color: var(--u-txt-color-weak);
    font-size: 0.85em;
    white-space: nowrap;
    user-select: none;
  }

  /* vertical */
  :host([vertical]) {
    flex-direction: column;
    margin: 0 var(--divider-spacing);
    height: auto;
    min-height: 1em;
  }

  :host([vertical]) .line {
    flex: 1;
    min-height: 8px;
    border-top: none;
    border-left: var(--divider-size) solid var(--divider-color);
  }

  :host([vertical][variant="dashed"]) .line {
    border-left-style: dashed;
  }
  :host([vertical][variant="dotted"]) .line {
    border-left-style: dotted;
  }

  :host([vertical][align="start"]) .line:first-child {
    flex: 0 0 12px;
  }
  :host([vertical][align="start"]) .line:last-child {
    flex: 1;
  }
  :host([vertical][align="end"]) .line:first-child {
    flex: 1;
  }
  :host([vertical][align="end"]) .line:last-child {
    flex: 0 0 12px;
  }

  :host([vertical]) .label {
    padding: 12px 0;
  }
`;
