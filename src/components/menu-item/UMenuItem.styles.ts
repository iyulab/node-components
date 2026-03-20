import { css } from "lit";

export const styles = css`
  :host {
    --menu-item-height: 32px;
    --menu-item-padding: 6px 8px;
    --menu-item-gap: 6px;
    --menu-item-radius: 4px;
    --menu-indent-size: 20px;
  }

  :host {
    position: relative;
    display: block;
  }
  :host(:focus-visible) {
    outline: none;
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--menu-item-gap);
    min-height: var(--menu-item-height);
    padding: var(--menu-item-padding);
    border-radius: var(--menu-item-radius);
    background-color: transparent;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    transition: background-color 0.15s ease, color 0.15s ease;
    user-select: none;
    cursor: pointer;
  }

  /* align */
  :host([align="left"]) .header { 
    justify-content: flex-start; 
  }
  :host([align="center"]) .header { 
    justify-content: center; 
  }
  :host([align="right"]) .header { 
    justify-content: flex-end; 
  }

  /* hover & focus */
  :host(:not([disabled])) .header:hover,
  :host(:not([disabled]):focus-visible) .header {
    background-color: var(--u-bg-color-hover);
  }

  /* indicator: highlight */
  :host([selected][indicator="highlight"]) .header {
    font-weight: 600;
    color: var(--u-blue-700);
    background-color: var(--u-blue-100);
  }
  :host([selected][indicator="highlight"]) .header:hover,
  :host([selected][indicator="highlight"]:focus-visible) .header {
    background-color: var(--u-blue-200);
  }

  .toggle-icon {
    display: inline-block;
    margin-left: auto;
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    position: relative;
  }
  .toggle-icon::before,
  .toggle-icon::after {
    content: '';
    position: absolute;
    background-color: currentColor;
    border-radius: 1px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  /* 기본: 오른쪽 방향 chevron (›) */
  .toggle-icon::before {
    width: 8px;
    height: 1.5px;
    top: 50%;
    left: 50%;
    transform: translate(-75%, -25%) rotate(45deg);
  }
  .toggle-icon::after {
    width: 8px;
    height: 1.5px;
    top: 50%;
    left: 50%;
    transform: translate(-25%, -25%) rotate(-45deg);
  }
  /* expanded 상태: 아래 방향 chevron (∨) */
  .toggle-icon[expanded]::before {
    transform: translate(-75%, 25%) rotate(-45deg);
  }
  .toggle-icon[expanded]::after {
    transform: translate(-25%, 25%) rotate(45deg);
  }

  .expand-icon {
    margin-left: auto;
    flex-shrink: 0;
  }

  /* inline submenu */
  .submenu {
    display: none;
    padding-left: var(--menu-indent-size);
  }
  .submenu[open] {
    display: block;
  }

  /* floating submenu (popover) */
  .popover {
    position: fixed;
    z-index: 1000;
    top: 0;
    left: 0;
    width: max-content;
    min-width: 160px;
    padding: 4px;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-panel-bg-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);

    opacity: 0;
    transform: scale(0.8);
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.2s ease, transform 0.2s ease, visibility 0s 0.2s;
  }
  .popover[open] {
    opacity: 1;
    transform: scale(1);
    visibility: visible;
    pointer-events: auto;
    transition-delay: 0s;
  }
`;
