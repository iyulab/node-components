import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
    user-select: none;
  }

  u-icon {
    color: var(--u-icon-color);
  }

  nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.15em;
    overflow: hidden;
  }
  nav > :last-child {
    color: var(--u-txt-color);
    font-weight: 500;
    pointer-events: none;
    cursor: default;
  }

  .separator {
    display: inline-flex;
    align-items: center;
    flex-shrink: 0;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    margin: 0 0.1em;
    user-select: none;
  }

  /* Ellipsis Button */
  .ellipsis-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0.15em 0.35em;
    line-height: 1;
    font-size: 0.85em;
    color: var(--u-txt-color-weak);
    border: none;
    border-radius: 0.25em;
    background: var(--u-bg-color-hover);
    transition: background 0.15s ease, color 0.15s ease;
    cursor: pointer;
  }
  .ellipsis-btn:hover {
    background: var(--u-bg-color-active);
    color: var(--u-txt-color);
  }

  /* Dropdown Menu (position: fixed, nav 밖으로 렌더링) */
  .dropdown-menu {
    position: fixed;
    z-index: 1000;
    min-width: 8em;
    display: flex;
    flex-direction: column;
    padding: 0.25em 0;
    border: 1px solid var(--u-border-color,);
    border-radius: 0.4em;
    background: var(--u-bg-color);
    box-shadow: 0 0.25em 0.75em rgba(0,0,0,0.12);
  }

  .dropdown-menu > * {
    display: block;
    padding: 0.35em 0.75em;
    font-size: 0.9em;
    white-space: nowrap;
    transition: background 0.15s ease;
    cursor: pointer;
  }
  .dropdown-menu > *:hover {
    background: var(--u-bg-color-hover);
  }
`;
