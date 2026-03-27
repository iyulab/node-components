import { css } from "lit";

export const styles = css`
  :host {
    --menu-item-depth: 0;
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
    padding: 0.25em 0.5em;
    padding-left: calc(var(--menu-indent-size) * var(--menu-item-depth) + 0.5em);
    background-color: transparent;
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

  .prefix-checker {
    margin-right: 0.25em;
    font-size: 1em;
  }

  .suffix-toggler {
    flex-shrink: 0;
    position: relative;
    display: inline-block;
    margin-left: 0.25em;
    width: 1em;
    height: 1em;
  }
  .suffix-toggler::before,
  .suffix-toggler::after {
    content: '';
    position: absolute;
    border-radius: 1px;
    background-color: currentColor;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }
  /* 기본: 위 방향 chevron (∧) */
  .suffix-toggler::before {
    width: 0.5em;
    height: 0.1em;
    top: 50%;
    left: 50%;
    transform: translate(-75%, -25%) rotate(45deg);
  }
  .suffix-toggler::after {
    width: 0.5em;
    height: 0.1em;
    top: 50%;
    left: 50%;
    transform: translate(-25%, -25%) rotate(-45deg);
  }
  /* expanded 상태: 아래 방향 chevron (∨) */
  .suffix-toggler[expanded]::before {
    transform: translate(-75%, 25%) rotate(-45deg);
  }
  .suffix-toggler[expanded]::after {
    transform: translate(-25%, 25%) rotate(45deg);
  }

  .suffix-chevron {
    font-size: 1em;
    margin-left: 0.25em;
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.25em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.25em;
  }

  .content {
    flex: 1 1 auto;
    line-height: 1.5;
    display: inline-block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* inline submenu */
  .submenu {
    display: none;
  }
  .submenu[open] {
    display: block;
  }

  /* floating submenu (popover) */
  .popover {
    display: flex;
    flex-direction: column;
    padding: 4px;
    border: 1px solid var(--u-border-color);
    border-radius: 4px;
    background-color: var(--u-panel-bg-color);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    transform: scale(0.8);
    transition: opacity 0.2s ease, visibility 0s 0.2s, transform 0.2s ease;
  }
  .popover[open] {
    transform: scale(1);
    transition-delay: 0s;
  }
`;
