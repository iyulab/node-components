import { css } from "lit";

export const styles = css`
  :host {
    --tab-nav-color: var(--u-primary-color, #1976D2);

    display: block;
    min-width: 0;
    color: var(--u-txt-color, #212121);
  }

  /* 띠 — 넘치면 가로로 스크롤한다. 바닥선은 테두리가 아니라 안쪽 그림자다: 탭의 2px 밑줄이 상자 밖으로 나가지 않고
     그 위에 칠해진다(테두리 + 음수 여백이면 스크롤 상자가 1px 넘쳐 세로 스크롤바가 생긴다). */
  .base {
    display: flex;
    align-items: stretch;
    gap: var(--u-space-2xs, 4px);
    box-shadow: inset 0 -1px 0 var(--u-border-color, #E0E0E0);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
  }

  ::slotted(u-tab[active]) {
    color: var(--tab-nav-color);
  }
  /* ── 칸(appearance="tiles") — 같은 폭의 칸, 현재 칸은 채운 면 ── */
  :host([appearance="tiles"]) .base {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--tab-nav-tile-min, 7rem), 1fr));
    gap: var(--u-space-sm, 8px);
    box-shadow: none;
    overflow: visible;
  }
  :host([appearance="tiles"]) ::slotted(u-tab) {
    --_tab-border-width: 0.125rem;
    --_tab-border-color: var(--u-border-color, #E0E0E0);
    --_tab-bg: var(--u-bg-color, #FFFFFF);
    --tab-padding-block: var(--u-space-sm, 8px);
    --tab-padding-inline: var(--u-space-md, 12px);
    border-radius: var(--u-radius-lg, 6px);
    color: var(--u-txt-color, #212121);
  }
  :host([appearance="tiles"]) ::slotted(u-tab[active]) {
    --_tab-border-color: var(--tab-nav-color);
    --_tab-bg: var(--tab-nav-color);
    color: var(--tab-nav-contrast, var(--u-primary-txt-color, #FFFFFF));
  }

  :host(:not([appearance="tiles"])) ::slotted(u-tab[active])::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2px;
    background-color: var(--tab-nav-color);
  }
`;
