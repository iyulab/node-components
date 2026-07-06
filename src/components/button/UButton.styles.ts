import { css } from "lit";

export const styles = css`
  :host {
    /* --btn-color 하나만 정해지면 hover/active/surface/outline 톤이 전부 자동 파생 */
    --btn-color: var(--u-primary-color, var(--u-blue-600));
    --btn-color-hover: color-mix(in srgb, var(--btn-color) 85%, black);
    --btn-color-active: color-mix(in srgb, var(--btn-color) 70%, black);
    --btn-color-surface: color-mix(in srgb, var(--btn-color) 12%, var(--u-bg-color));
    --btn-color-surface-hover: color-mix(in srgb, var(--btn-color) 22%, var(--u-bg-color));
    --btn-color-surface-active: color-mix(in srgb, var(--btn-color) 32%, var(--u-bg-color));
    --btn-color-border: color-mix(in srgb, var(--btn-color) 45%, var(--u-bg-color));
    --btn-color-border-hover: color-mix(in srgb, var(--btn-color) 60%, var(--u-bg-color));
    --btn-color-border-active: color-mix(in srgb, var(--btn-color) 75%, var(--u-bg-color));
    --btn-color-outline-hover: color-mix(in srgb, var(--btn-color) 6%, var(--u-bg-color));
    --btn-color-outline-active: color-mix(in srgb, var(--btn-color) 12%, var(--u-bg-color));
  }

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
  }

  /* === Color tokens === */
  :host([color="blue"])   { --btn-color: var(--u-blue-600); }
  :host([color="green"])  { --btn-color: var(--u-green-600); }
  :host([color="red"])    { --btn-color: var(--u-red-600); }
  :host([color="orange"]) { --btn-color: var(--u-orange-600); }
  :host([color="teal"])   { --btn-color: var(--u-teal-600); }
  :host([color="cyan"])   { --btn-color: var(--u-cyan-600); }
  :host([color="purple"]) { --btn-color: var(--u-purple-600); }
  :host([color="pink"])   { --btn-color: var(--u-pink-600); }

  /* === Size === */
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
    background-color: var(--btn-color);
    border-color: var(--btn-color);
  }
  :host([variant="solid"]:hover) {
    background-color: var(--btn-color-hover);
    border-color: var(--btn-color-hover);
  }
  :host([variant="solid"]:active) {
    background-color: var(--btn-color-active);
    border-color: var(--btn-color-active);
  }

  /* surface: 채우기 + 경계 */
  :host([variant="surface"]) {
    color: var(--u-txt-color);
    background-color: var(--btn-color-surface);
    border-color: var(--btn-color-border);
  }
  :host([variant="surface"]:hover) {
    background-color: var(--btn-color-surface-hover);
    border-color: var(--btn-color-border-hover);
  }
  :host([variant="surface"]:active) {
    background-color: var(--btn-color-surface-active);
    border-color: var(--btn-color-border-active);
  }

  /* filled: 채우기만 */
  :host([variant="filled"]) {
    color: var(--u-txt-color);
    background-color: var(--btn-color-surface);
    border-color: transparent;
  }
  :host([variant="filled"]:hover) {
    background-color: var(--btn-color-surface-hover);
  }
  :host([variant="filled"]:active) {
    background-color: var(--btn-color-surface-active);
  }

  /* outlined: 경계만 */
  :host([variant="outlined"]) {
    color: var(--u-txt-color);
    border-color: var(--btn-color-border);
    background-color: transparent;
  }
  :host([variant="outlined"]:hover) {
    border-color: var(--btn-color-border-hover);
    background-color: var(--btn-color-outline-hover);
  }
  :host([variant="outlined"]:active) {
    border-color: var(--btn-color-border-active);
    background-color: var(--btn-color-outline-active);
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
    color: var(--btn-color);
  }
  :host([variant="link"][color]:not([color="neutral"]):hover) {
    color: var(--btn-color-hover);
  }
  :host([variant="link"][color]:not([color="neutral"]):active) {
    color: var(--btn-color-active);
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
