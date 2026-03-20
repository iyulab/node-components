import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    flex-direction: column;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
  }
  :host([disabled]) {
    pointer-events: none;
    opacity: 0.6;
  }

  .header {
    display: flex;
    align-items: stretch;
    min-height: 0;
  }

  .nav {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    flex: 0 1 auto;
    min-width: 0;
    min-height: 0;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
    scrollbar-color: transparent transparent;
    scrollbar-gutter: stable;
    transition: scrollbar-color 0.3s ease;
  }
  .nav:hover {
    scrollbar-color: rgba(0, 0, 0, 0.25) transparent;
  }
  .nav::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .nav::-webkit-scrollbar-track {
    background: transparent;
  }
  .nav::-webkit-scrollbar-thumb {
    background: transparent;
    border-radius: 4px;
    transition: background 0.3s ease;
  }
  .nav:hover::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.25);
  }

  ::slotted(u-tab) {
    flex-shrink: 0;
  }

  /* === Justify === */
  :host([justify="center"]) .nav { 
    justify-content: center; 
  }
  :host([justify="flex-end"]) .nav { 
    justify-content: flex-end; 
  }
  :host([justify="space-between"]) .nav { 
    justify-content: space-between; 
  }

  .toolbar {
    display: flex;
    align-items: center;
    flex: 1 0 auto;
    padding: 0 0.5em;
  }

  .content {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }

  /* Variant: line */
  :host([variant="line"]) .header,
  :host(:not([variant])) .header {
    border-bottom: 1px solid var(--u-border-color);
  }
  :host([variant="line"]) ::slotted(u-tab[active])::after,
  :host(:not([variant])) ::slotted(u-tab[active])::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--u-blue-600);
  }

  /* Variant: card */
  :host([variant="card"]) .content {
    border-top: 1px solid var(--u-border-color);
  }
  :host([variant="card"]) .nav {
    position: relative;
    z-index: 1;
    margin-bottom: -1px;
  }
  :host([variant="card"]) ::slotted(u-tab) {
    border: none;
    border-right: 1px solid var(--u-border-color);
    margin-right: -1px;
    border-radius: 6px 6px 0 0;
    background-color: var(--u-bg-color-muted, rgba(0, 0, 0, 0.03));
  }
  :host([variant="card"]) ::slotted(u-tab:hover:not([disabled]):not([active])) {
    background-color: var(--u-bg-color-hover);
  }
  :host([variant="card"]) ::slotted(u-tab[active]) {
    color: var(--u-txt-color);
    background-color: var(--u-bg-color);
    border: 1px solid var(--u-border-color);
    border-bottom: 1px solid var(--u-bg-color);
    margin-right: 0;
    z-index: 1;
  }

  /* Variant: pill */
  :host([variant="pill"]) .nav {
    gap: 0.25em;
    padding: 0.25em;
    background-color: var(--u-bg-color-muted, rgba(0, 0, 0, 0.05));
    border-radius: 8px;
  }
  :host([variant="pill"]) ::slotted(u-tab) {
    border-radius: 6px;
    border: 1px solid transparent;
  }
  :host([variant="pill"]) ::slotted(u-tab:hover:not([disabled]):not([active])) {
    background-color: var(--u-bg-color-hover);
  }
  :host([variant="pill"]) ::slotted(u-tab[active]) {
    color: var(--u-txt-color);
    background-color: var(--u-bg-color);
    border-color: var(--u-border-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  /* Variant: plain */
  :host([variant="plain"]) .nav {
    gap: 0.2em;
  }
  :host([variant="plain"]) ::slotted(u-tab) {
    color: var(--u-txt-color-weak);
  }
  :host([variant="plain"]) ::slotted(u-tab[active]) {
    color: var(--u-blue-600);
    font-weight: 600;
  }

  /* Placement: bottom */
  :host([placement="bottom"]) {
    flex-direction: column-reverse;
  }
  :host([placement="bottom"][variant="line"]) .header,
  :host([placement="bottom"]:not([variant])) .header {
    border-bottom: none;
    border-top: 1px solid var(--u-border-color);
  }
  :host([placement="bottom"][variant="line"]) ::slotted(u-tab[active])::after,
  :host([placement="bottom"]:not([variant])) ::slotted(u-tab[active])::after {
    bottom: auto;
    top: -1px;
  }
  :host([placement="bottom"][variant="card"]) .content {
    border-top: none;
    border-bottom: 1px solid var(--u-border-color);
  }
  :host([placement="bottom"][variant="card"]) .nav {
    margin-bottom: 0;
    margin-top: -1px;
  }
  :host([placement="bottom"][variant="card"]) ::slotted(u-tab) {
    border-radius: 0 0 6px 6px;
  }
  :host([placement="bottom"][variant="card"]) ::slotted(u-tab[active]) {
    border-top: 1px solid var(--u-bg-color);
    border-bottom: 1px solid var(--u-border-color);
  }

  /* Placement: left */
  :host([placement="left"]) {
    flex-direction: row;
  }
  :host([placement="left"]) .header {
    flex-direction: column;
    border-bottom: none;
    border-right: 1px solid var(--u-border-color);
    flex-shrink: 0;
  }
  :host([placement="left"]) .nav {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
  }
  :host([placement="left"]) .toolbar {
    margin-top: auto;
    padding: 0.5em 0;
  }
  :host([placement="left"][variant="line"]) ::slotted(u-tab[active])::after {
    bottom: 0;
    left: auto;
    right: -1px;
    top: 0;
    width: 2px;
    height: auto;
  }
  :host([placement="left"][variant="card"]) .header {
    border-right: none;
  }
  :host([placement="left"][variant="card"]) .content {
    border-top: none;
    border-left: 1px solid var(--u-border-color);
  }
  :host([placement="left"][variant="card"]) .nav {
    margin-bottom: 0;
    margin-right: -1px;
  }
  :host([placement="left"][variant="card"]) ::slotted(u-tab) {
    border-right: none;
    border-bottom: 1px solid var(--u-border-color);
    margin-right: 0;
    margin-bottom: -1px;
    border-radius: 6px 0 0 6px;
  }
  :host([placement="left"][variant="card"]) ::slotted(u-tab[active]) {
    border: 1px solid var(--u-border-color);
    border-right: 1px solid var(--u-bg-color);
    margin-bottom: 0;
  }

  /* Placement: right */
  :host([placement="right"]) {
    flex-direction: row-reverse;
  }
  :host([placement="right"]) .header {
    flex-direction: column;
    border-bottom: none;
    border-left: 1px solid var(--u-border-color);
    flex-shrink: 0;
  }
  :host([placement="right"]) .nav {
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
  }
  :host([placement="right"]) .toolbar {
    margin-top: auto;
    padding: 0.5em 0;
  }
  :host([placement="right"][variant="line"]) ::slotted(u-tab[active])::after {
    bottom: 0;
    right: auto;
    left: -1px;
    top: 0;
    width: 2px;
    height: auto;
  }
  :host([placement="right"][variant="card"]) .header {
    border-left: none;
  }
  :host([placement="right"][variant="card"]) .content {
    border-top: none;
    border-right: 1px solid var(--u-border-color);
  }
  :host([placement="right"][variant="card"]) .nav {
    margin-bottom: 0;
    margin-left: -1px;
  }
  :host([placement="right"][variant="card"]) ::slotted(u-tab) {
    border-left: none;
    border-bottom: 1px solid var(--u-border-color);
    margin-left: 0;
    margin-bottom: -1px;
    border-radius: 0 6px 6px 0;
  }
  :host([placement="right"][variant="card"]) ::slotted(u-tab[active]) {
    border: 1px solid var(--u-border-color);
    border-left: 1px solid var(--u-bg-color);
    margin-bottom: 0;
  }
`;
