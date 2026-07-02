import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;

    font-size: 14px;
    font-weight: 500;
    line-height: 1.5;
    padding: 0.5em;
    border: 1px solid transparent;
    border-radius: 6px;
    background-color: transparent;

    transition: all 0.2s ease;
    overflow: hidden;
    user-select: none;
    cursor: pointer;

    /* Semantic color tokens consumed by variant rules below. Default (color="neutral")
       maps 1:1 onto the neutral scale — zero visual change for existing consumers. */
    --btn-c-50: var(--u-neutral-50);
    --btn-c-100: var(--u-neutral-100);
    --btn-c-200: var(--u-neutral-200);
    --btn-c-300: var(--u-neutral-300);
    --btn-c-400: var(--u-neutral-400);
    --btn-c-500: var(--u-neutral-500);
    --btn-c-600: var(--u-neutral-600);
    --btn-c-700: var(--u-neutral-700);
    --btn-c-800: var(--u-neutral-800);
  }

  /* === Color tokens ===
     Non-neutral colors have no "50" tier in the design system (see assets/styles/light.css) —
     tier "0" (the palest stop) is used in that slot instead of inventing a non-existent token. */
  :host([color="blue"])   { --btn-c-50: var(--u-blue-0);   --btn-c-100: var(--u-blue-100);   --btn-c-200: var(--u-blue-200);   --btn-c-300: var(--u-blue-300);   --btn-c-400: var(--u-blue-400);   --btn-c-500: var(--u-blue-500);   --btn-c-600: var(--u-blue-600);   --btn-c-700: var(--u-blue-700);   --btn-c-800: var(--u-blue-800); }
  :host([color="green"])  { --btn-c-50: var(--u-green-0);  --btn-c-100: var(--u-green-100);  --btn-c-200: var(--u-green-200);  --btn-c-300: var(--u-green-300);  --btn-c-400: var(--u-green-400);  --btn-c-500: var(--u-green-500);  --btn-c-600: var(--u-green-600);  --btn-c-700: var(--u-green-700);  --btn-c-800: var(--u-green-800); }
  :host([color="red"])    { --btn-c-50: var(--u-red-0);    --btn-c-100: var(--u-red-100);    --btn-c-200: var(--u-red-200);    --btn-c-300: var(--u-red-300);    --btn-c-400: var(--u-red-400);    --btn-c-500: var(--u-red-500);    --btn-c-600: var(--u-red-600);    --btn-c-700: var(--u-red-700);    --btn-c-800: var(--u-red-800); }
  :host([color="orange"]) { --btn-c-50: var(--u-orange-0); --btn-c-100: var(--u-orange-100); --btn-c-200: var(--u-orange-200); --btn-c-300: var(--u-orange-300); --btn-c-400: var(--u-orange-400); --btn-c-500: var(--u-orange-500); --btn-c-600: var(--u-orange-600); --btn-c-700: var(--u-orange-700); --btn-c-800: var(--u-orange-800); }
  :host([color="teal"])   { --btn-c-50: var(--u-teal-0);   --btn-c-100: var(--u-teal-100);   --btn-c-200: var(--u-teal-200);   --btn-c-300: var(--u-teal-300);   --btn-c-400: var(--u-teal-400);   --btn-c-500: var(--u-teal-500);   --btn-c-600: var(--u-teal-600);   --btn-c-700: var(--u-teal-700);   --btn-c-800: var(--u-teal-800); }
  :host([color="cyan"])   { --btn-c-50: var(--u-cyan-0);   --btn-c-100: var(--u-cyan-100);   --btn-c-200: var(--u-cyan-200);   --btn-c-300: var(--u-cyan-300);   --btn-c-400: var(--u-cyan-400);   --btn-c-500: var(--u-cyan-500);   --btn-c-600: var(--u-cyan-600);   --btn-c-700: var(--u-cyan-700);   --btn-c-800: var(--u-cyan-800); }
  :host([color="purple"]) { --btn-c-50: var(--u-purple-0); --btn-c-100: var(--u-purple-100); --btn-c-200: var(--u-purple-200); --btn-c-300: var(--u-purple-300); --btn-c-400: var(--u-purple-400); --btn-c-500: var(--u-purple-500); --btn-c-600: var(--u-purple-600); --btn-c-700: var(--u-purple-700); --btn-c-800: var(--u-purple-800); }
  :host([color="pink"])   { --btn-c-50: var(--u-pink-0);   --btn-c-100: var(--u-pink-100);   --btn-c-200: var(--u-pink-200);   --btn-c-300: var(--u-pink-300);   --btn-c-400: var(--u-pink-400);   --btn-c-500: var(--u-pink-500);   --btn-c-600: var(--u-pink-600);   --btn-c-700: var(--u-pink-700);   --btn-c-800: var(--u-pink-800); }

  /* === Size ===
     padding (0.5em), the spinner (1em/0.5em), and prefix/suffix margins (0.5em) are all
     em-relative already, so changing font-size alone scales the whole button proportionally. */
  :host([size="sm"]) {
    font-size: 12px;
  }
  :host([size="lg"]) {
    font-size: 16px;
  }

  /* === States === */
  :host(:active) {
    transform: translateY(1px);
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
  :host([loading]) {
    opacity: 0.8;
    pointer-events: none;
    cursor: wait;
  }
  :host([loading]) button,
  :host([loading]) a {
    visibility: hidden;
  }
  :host([rounded]) {
    border-radius: 9999px;
  }
  :host([has-spinner]) u-spinner {
    display: none;
  }

  /* === Variant styles === */

  /* solid: 강한 채움 (기본 color="neutral") */
  :host([variant="solid"]) {
    color: #fff;
    background-color: var(--btn-c-600);
    border-color: var(--btn-c-600);
  }
  :host([variant="solid"]:hover) {
    background-color: var(--btn-c-700);
    border-color: var(--btn-c-700);
  }
  :host([variant="solid"]:active) {
    background-color: var(--btn-c-800);
    border-color: var(--btn-c-800);
  }

  /* surface: 채우기 + 경계 */
  :host([variant="surface"]) {
    color: var(--u-txt-color);
    background-color: var(--btn-c-100);
    border-color: var(--btn-c-300);
  }
  :host([variant="surface"]:hover) {
    background-color: var(--btn-c-200);
    border-color: var(--btn-c-400);
  }
  :host([variant="surface"]:active) {
    background-color: var(--btn-c-300);
    border-color: var(--btn-c-500);
  }

  /* filled: 채우기만 */
  :host([variant="filled"]) {
    color: var(--u-txt-color);
    background-color: var(--btn-c-100);
    border-color: transparent;
  }
  :host([variant="filled"]:hover) {
    background-color: var(--btn-c-200);
  }
  :host([variant="filled"]:active) {
    background-color: var(--btn-c-300);
  }

  /* outlined: 경계만 */
  :host([variant="outlined"]) {
    color: var(--u-txt-color);
    border-color: var(--btn-c-300);
    background-color: transparent;
  }
  :host([variant="outlined"]:hover) {
    border-color: var(--btn-c-400);
    background-color: var(--btn-c-50);
  }
  :host([variant="outlined"]:active) {
    border-color: var(--btn-c-500);
    background-color: var(--btn-c-100);
  }

  /* ghost: transparent */
  :host([variant="ghost"]) {
    color: var(--u-txt-color);
    border-color: transparent;
    background-color: transparent;
  }
  :host([variant="ghost"]:hover) {
    background-color: var(--u-bg-color-hover);
  }
  :host([variant="ghost"]:active) {
    background-color: var(--u-bg-color-active);
  }

  /* link: blue 링크 스타일 (기본값, color="neutral"일 때도 유지 — 기존 동작 보존) */
  :host([variant="link"]) {
    color: var(--u-blue-500, #3b82f6);
    border-color: transparent;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
  }
  :host([variant="link"]:hover) {
    color: var(--u-blue-600, #2563eb);
    text-decoration: underline;
  }
  :host([variant="link"]:active) {
    color: var(--u-blue-700, #1d4ed8);
  }
  /* link + 명시적 non-neutral color: 링크 자체 색상을 재정의 (예: 파괴적 액션 링크) */
  :host([variant="link"][color]:not([color="neutral"])) {
    color: var(--btn-c-500);
  }
  :host([variant="link"][color]:not([color="neutral"]):hover) {
    color: var(--btn-c-600);
  }
  :host([variant="link"][color]:not([color="neutral"]):active) {
    color: var(--btn-c-700);
  }

  /* === Inner === */
  button, a {
    all: unset;
    width: 100%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
  a {
    text-decoration: none;
    color: inherit;
  }
  a[disabled] {
    pointer-events: none;
  }

  /* === Slots === */
  ::slotted(*) {
    color: inherit;
    font-size: inherit;
  }
  ::slotted([slot="prefix"]) {
    margin-right: 0.5em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.5em;
  }

  .content {
    flex: 1 0 auto;
    min-width: 0;
    line-height: 1.5;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* === Mask (로딩 오버레이) === */
  .mask {
    position: absolute;
    z-index: 100;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: inherit;
    font-size: inherit;
    border-radius: inherit;
    background-color: inherit;
    pointer-events: none;
  }
`;
