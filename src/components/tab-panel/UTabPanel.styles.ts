import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
  }
  :host([disabled]) {
    pointer-events: none;
    opacity: 0.6;
  }
  :host([placement="top"]) { flex-direction: column; }
  :host([placement="bottom"]) { flex-direction: column-reverse; }
  :host([placement="left"]) { flex-direction: row; }
  :host([placement="right"]) { flex-direction: row-reverse; }

  .header {
    min-height: 0;
    display: flex;
    align-items: stretch;
  }
  :host([placement="top"]) .header,
  :host([placement="bottom"]) .header {
    flex-direction: row;
  }
  :host([placement="left"]) .header,
  :host([placement="right"]) .header {
    flex-direction: column;
  }

  .nav {
    position: relative;
    background-color: transparent;
    display: flex;
    align-items: stretch;
    flex: 0 1 auto;
    min-width: 0;
    min-height: 0;
    scrollbar-width: none;
    scrollbar-color: transparent transparent;
  }
  :host([placement="top"]) .nav,
  :host([placement="bottom"]) .nav {
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
  }
  :host([placement="left"]) .nav,
  :host([placement="right"]) .nav {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .toolbar {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1 0 auto;
  }
  :host([placement="top"]) .toolbar,
  :host([placement="bottom"]) .toolbar {
    flex-direction: row;
  }
  :host([placement="left"]) .toolbar,
  :host([placement="right"]) .toolbar {
    flex-direction: column;
  }

  .content {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  /* Variant: line */

  :host([variant="line"]) ::slotted(u-tab[active]) {
    position: relative;
    color: var(--u-blue-600);
  }
  :host([variant="line"]) ::slotted(u-tab[active])::after {
    content: '';
    position: absolute;
    background-color: var(--u-blue-600);
  }

  :host([variant="line"][placement="top"]) .header {
    border-bottom: 1px solid var(--u-border-color);
  }
  :host([variant="line"][placement="top"]) ::slotted(u-tab[active])::after {
    height: 2px;
    bottom: 0;
    left: 0;
    right: 0;
  }

  :host([variant="line"][placement="bottom"]) .header {
    border-top: 1px solid var(--u-border-color);
  }
  :host([variant="line"][placement="bottom"]) ::slotted(u-tab[active])::after {
    height: 2px;
    top: 0;
    left: 0;
    right: 0;
  }

  :host([variant="line"][placement="left"]) .header {
    border-right: 1px solid var(--u-border-color);
  }
  :host([variant="line"][placement="left"]) ::slotted(u-tab[active])::after {
    width: 2px;
    right: 0;
    top: 0;
    bottom: 0;
  }

  :host([variant="line"][placement="right"]) .header {
    border-left: 1px solid var(--u-border-color);
  }
  :host([variant="line"][placement="right"]) ::slotted(u-tab[active])::after {
    width: 2px;
    left: 0;
    top: 0;
    bottom: 0;
  }

  /* Variant: card */

  :host([variant="card"]) ::slotted(u-tab) {
    background-color: var(--u-neutral-100);
  }
  :host([variant="card"]) ::slotted(u-tab[active]) {
    color: var(--u-txt-color);
    background-color: var(--u-neutral-0);
  }

  :host([variant="card"][placement="top"]) ::slotted(u-tab) {
    border-bottom: 1px solid var(--u-border-color);
    border-right: 1px solid var(--u-border-color);
  }
  :host([variant="card"][placement="top"]) ::slotted(u-tab[active]) {
    border-bottom: none;
  }

  :host([variant="card"][placement="bottom"]) ::slotted(u-tab) {
    border-top: 1px solid var(--u-border-color);
    border-right: 1px solid var(--u-border-color);
  }
  :host([variant="card"][placement="bottom"]) ::slotted(u-tab[active]) {
    border-top: none;
  }

  :host([variant="card"][placement="left"]) ::slotted(u-tab) {
    border-right: 1px solid var(--u-border-color);
    border-bottom: 1px solid var(--u-border-color);
  }
  :host([variant="card"][placement="left"]) ::slotted(u-tab[active]) {
    border-right: none;
  }

  :host([variant="card"][placement="right"]) ::slotted(u-tab) {
    border-left: 1px solid var(--u-border-color);
    border-bottom: 1px solid var(--u-border-color);
  }
  :host([variant="card"][placement="right"]) ::slotted(u-tab[active]) {
    border-left: none;
  }

  /* Variant: pill */

  :host([variant="pill"]) .nav {
    gap: 0.25em;
    padding: 0.25em;
    background-color: var(--u-neutral-100);
    border-radius: 8px;
  }
  :host([variant="pill"]) ::slotted(u-tab) {
    border: 1px solid transparent;
    border-radius: 6px;
  }
  :host([variant="pill"]) ::slotted(u-tab[active]) {
    border-color: var(--u-border-color);
    background-color: var(--u-neutral-0);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  /* Variant: plain */

  :host([variant="plain"]) .nav {
    gap: 0.25em;
  }
  :host([variant="plain"]) ::slotted(u-tab[active]) {
    color: var(--u-blue-600);
    font-weight: 600;
  }
`;
