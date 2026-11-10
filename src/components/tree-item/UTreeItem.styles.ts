import { css } from "lit";

export const styles = css`
  :host {
    --tree-item-depth: 0;
    --tree-item-color: var(--u-primary-color, #1976D2);
  }

  :host {
    display: block;
  }
  :host(:focus-visible) {
    outline: none;
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  /* ── header ── */
  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 4px 8px;
    padding-inline-start: calc(
      var(--tree-indent-size) * var(--tree-item-depth)
      + var(--tree-indent-guide-offset)
    );
    /* 호스트 하한(--u-target-size, 미설정 = 0). */
    box-sizing: border-box;
    min-height: var(--u-target-size, 0px);
    transition: background-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    user-select: none;
    cursor: pointer;
  }
  :host(:not([disabled])[trigger="item"]) .header:hover,
  :host(:not([disabled])[trigger="item"]:focus-visible) .header {
    background-color: var(--u-bg-color-hover, #F5F5F5);
  }
  .header[selected] {
    color: color-mix(in srgb, var(--tree-item-color) 85%, black);
    font-weight: 600;
    background-color: color-mix(in srgb, var(--tree-item-color) 15%, var(--u-bg-color, #FFFFFF));
  }

  /* 접두 · 접미 옆 간격은 섀도 안 상자가 갖는다 — ::slotted 의 여백은 문서의 전역 리셋(Tailwind preflight 류)에 진다. */
  .affix {
    display: inline-flex;
    align-items: center;
    flex: none;
  }
  .affix[hidden] {
    display: none;
  }
  .affix-prefix {
    margin-inline-end: 0.2em;
  }
  .affix-suffix {
    margin-inline-start: 0.2em;
  }

  /* ── content ── */
  .content {
    flex: 1;
    min-width: 0;
    line-height: 1.5;
    overflow-wrap: anywhere;
  }

  /* ── toggler ──
     The box that takes the pointer is 24x24 (WCAG 2.2 SC 2.5.8); the square you see is still
     18x18, drawn by the pseudo-element. The negative margins give the extra 3px on each side
     back, so the glyph, the label and the row height sit exactly where they did — the extra
     area lands on the header's own padding and the gap before the label, never on another
     target. */
  .prefix-toggler {
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    margin-block: -3px;
    margin-inline: -3px 1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* 호스트 하한(--u-target-size)이 있으면 그 값 — 미설정이면 24px 그대로. */
    width: max(24px, var(--u-target-size, 0px));
    height: max(24px, var(--u-target-size, 0px));
  }
  .prefix-toggler::before {
    content: "";
    position: absolute;
    inset: 3px;
    border-radius: var(--u-radius-sm, 3px);
    transition: background-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .prefix-toggler > * {
    position: relative;
  }
  .prefix-toggler u-icon {
    font-size: 12px;
    pointer-events: none;
  }
  /* 닫힘 표시(기본 chevron-right)는 LTR 모양이다 — RTL 에서는 끝 쪽(왼쪽)을 가리켜야 한다. 컴포넌트가 스스로 넣는
     기본 글리프만 뒤집는다 — 소비자가 준 expandIcon 은 의미를 소비자가 정한다(toggle-glyph 클래스가 없다). */
  :host(:dir(rtl)) .toggle-glyph {
    transform: scaleX(-1);
  }
  :host(:not([disabled])[trigger="icon"]) .prefix-toggler:hover::before,
  :host(:not([disabled])[trigger="icon"]:focus-visible) .prefix-toggler::before {
    background-color: var(--u-bg-color-hover, #F5F5F5);
  }
  /* A checkable row puts the checkbox 4px after the toggle. Centred 24px areas for both would
     overlap by 3px, so here the toggle takes its extra width entirely on the left (header
     padding), and the padding keeps the glyph centred on its visible square. */
  :host([checkable]) .prefix-toggler {
    margin-block: -3px;
    margin-inline: -6px 4px;
    padding-inline-start: 6px;
  }
  :host([checkable]) .prefix-toggler::before {
    inset-block: 3px;
    inset-inline: 6px 0;
  }

  /* ── checkbox ──
     Same split as the toggle: a 24x24 box takes the pointer, the 16x16 box you see is the
     pseudo-element, and the negative margins keep every visible edge where it was. */
  .prefix-checkbox {
    position: relative;
    box-sizing: border-box;
    flex-shrink: 0;
    margin-block: -4px;
    margin-inline: -4px 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /* 호스트 하한(--u-target-size)이 있으면 그 값 — 미설정이면 24px 그대로. */
    width: max(24px, var(--u-target-size, 0px));
    height: max(24px, var(--u-target-size, 0px));
    cursor: pointer;
  }
  .prefix-checkbox::before {
    content: "";
    position: absolute;
    inset: 4px;
    box-sizing: border-box;
    border-radius: var(--u-radius-sm, 3px);
    border: 1.5px solid var(--u-input-border-color, #E0E0E0);
    background-color: transparent;
    transition: background-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), border-color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .prefix-checkbox u-icon {
    position: relative;
    visibility: hidden;
    font-size: 12px;
    color: #fff;
    pointer-events: none;
  }
  .prefix-checkbox[checked]::before,
  .prefix-checkbox[indeterminate]::before {
    border-color: var(--tree-item-color);
    background-color: var(--tree-item-color);
  }
  .prefix-checkbox[checked] u-icon,
  .prefix-checkbox[indeterminate] u-icon {
    visibility: visible;
  }

  /* ── children ── */
  .subtree {
    display: block;
    position: relative;
  }

  .subtree::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    inset-inline-start: calc(
      var(--tree-indent-size) * (var(--tree-item-depth) + 1)
    );
    border-inline-start: var(--tree-indent-guide-width)
                 var(--tree-indent-guide-style)
                 var(--tree-indent-guide-color);
    pointer-events: none;
  }
`;
