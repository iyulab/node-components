import { css } from "lit";

export const styles = css`
  :host {
    --radio-color: var(--u-selection-color, #1976D2);
    --radio-color-active: color-mix(in srgb, var(--radio-color) 85%, black);
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    gap: 0.5em;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color, #212121);
  }
  :host(:disabled) {
    opacity: 0.6;
    pointer-events: none;
  }
  :host([readonly]) {
    pointer-events: none;
  }

  .container {
    display: flex;
    gap: 0.5em;
  }
  :host([orientation="horizontal"]) .container {
    flex-direction: row;
  }
  :host([orientation="vertical"]) .container {
    flex-direction: column;
  }
  :host([type="button"]) .container {
    gap: 0;
    border: 1px solid var(--u-neutral-300, #E0E0E0);
    border-radius: 0.35em;
  }
  :host([invalid]) .container {
    border-color: var(--u-danger-color, #D32F2F);
  }

  /* Type: default */
  :host([type="default"]) ::slotted(u-option) {
    padding: 0;
  }

  /* Type: card — 틀은 옵션의 섀도 안 상자가 그린다(::slotted 로 준 테두리는 문서의 전역 리셋에 진다). */
  :host([type="card"]) {
    display: flex;
  }
  /* 가로 카드는 폭이 같고, 한 줄에 12em 씩 설 자리가 없으면 다음 줄로 넘어간다(글이 낱말 중간에서 쪼개지지 않게). */
  :host([type="card"][orientation="horizontal"]) .container {
    flex-wrap: wrap;
  }
  :host([type="card"][orientation="horizontal"]) ::slotted(u-option) {
    flex: 1 1 12em;
    min-width: 0;
  }
  :host([type="card"]) ::slotted(u-option) {
    border-radius: var(--u-radius-lg, 6px);
    --option-padding-block: 0.75em;
    --option-padding-inline: 0.875em;
    --option-color-active: #fff;
    --option-border-color-active: var(--radio-color);
    --option-background-color-active: var(--radio-color);
    --option-color-active-interactive: #fff;
    --option-border-color-active-interactive: var(--radio-color-active);
    --option-background-color-active-interactive: var(--radio-color-active);
    --_option-frame-width: 1px;
    --_option-frame-color: var(--u-border-color, #E0E0E0);
    --_option-frame-background: var(--u-bg-color, #FFFFFF);
    --_option-content-grow: 1;
    --_option-title-weight: 600;
    --_option-suffix-gap: 0.75em;
    --_option-suffix-numeric: tabular-nums;
  }
  :host([type="card"]) ::slotted(u-option:not([disabled]):hover) {
    --_option-frame-color: var(--u-border-color-hover, #BDBDBD);
    --_option-frame-background: var(--u-bg-color-hover, #F5F5F5);
  }
  :host([type="card"][invalid]) ::slotted(u-option) {
    --_option-frame-color: var(--u-danger-color, #D32F2F);
  }
  :host([type="card"]) ::slotted(u-option[selected]) {
    --_option-frame-color: var(--radio-color);
    --_option-frame-background: color-mix(in srgb, var(--radio-color) 8%, var(--u-bg-color, #FFFFFF));
    --_option-frame-ring: 1px;
  }
  :host([type="card"]) ::slotted(u-option:focus-visible) {
    --_option-frame-outline: 2px solid var(--u-focus-ring-color, #1565C0);
  }
  @media (forced-colors: active) {
    :host([type="card"]) ::slotted(u-option[selected]) {
      --_option-frame-color: Highlight;
    }
  }

  /* Default + Solid */
  :host([type="default"][appearance="solid"]) ::slotted(u-option) {
    --option-color-active: #fff;
    --option-border-color-active: var(--radio-color);
    --option-background-color-active: var(--radio-color);
    --option-color-active-interactive: #fff;
    --option-border-color-active-interactive: var(--radio-color-active);
    --option-background-color-active-interactive: var(--radio-color-active);
  }

  /* Default + Outlined */
  :host([type="default"][appearance="outlined"]) ::slotted(u-option) {
    --option-color-active: var(--radio-color-active);
    --option-border-color-active: var(--radio-color);
    --option-background-color-active: transparent;
    --option-color-active-interactive: var(--radio-color-active);
    --option-border-color-active-interactive: var(--radio-color-active);
    --option-background-color-active-interactive: transparent;
  }

  /* Button + Solid */
  :host([type="button"][appearance="solid"]) ::slotted(u-option) {
    --option-color-active: #fff;
    --option-border-color-active: var(--radio-color);
    --option-background-color-active: var(--radio-color);
    --option-color-active-interactive: #fff;
    --option-border-color-active-interactive: var(--radio-color-active);
    --option-background-color-active-interactive: var(--radio-color-active);
  }

  /* Button + Outlined */
  :host([type="button"][appearance="outlined"]) ::slotted(u-option) {
    --option-color-active: var(--radio-color-active);
    --option-border-color-active: var(--radio-color);
    --option-background-color-active: transparent;
    --option-color-active-interactive: var(--radio-color-active);
    --option-border-color-active-interactive: var(--radio-color-active);
    --option-background-color-active-interactive: transparent;
  }

  /* === Button - Horizontal 배치 === */
  /* 묶음의 바깥 모서리는 «시작/끝» 에 선다 — 첫 칸은 시작 쪽, 마지막 칸은 끝 쪽이 둥글다(RTL 에서 거울). */
  :host([type="button"]:not([appearance="soft"])[orientation="horizontal"]) ::slotted(u-option:first-child) {
    border-start-start-radius: 0.35em;
    border-end-start-radius: 0.35em;
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  :host([type="button"]:not([appearance="soft"])[orientation="horizontal"]) ::slotted(u-option:last-child) {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
    border-start-end-radius: 0.35em;
    border-end-end-radius: 0.35em;
  }
  /* 칸 구분선은 옵션이 자기 섀도 안(.base)에서 그린다 — 폭 · 색만 넘긴다(::slotted 에 둔 테두리는 문서의 전역 리셋에 진다). */
  :host([type="button"]:not([appearance="soft"])[orientation="horizontal"]) ::slotted(u-option:not(:last-child)) {
    --_option-divider-inline-end: 1px;
    --_option-divider-color: var(--u-neutral-300, #E0E0E0);
  }

  /* === Button - Vertical 배치 === */
  :host([type="button"]:not([appearance="soft"])[orientation="vertical"]) ::slotted(u-option) {
    width: 100%;
    justify-content: center;
  }
  :host([type="button"]:not([appearance="soft"])[orientation="vertical"]) ::slotted(u-option:first-child) {
    border-radius: 0.35em 0.35em 0 0;
  }
  :host([type="button"]:not([appearance="soft"])[orientation="vertical"]) ::slotted(u-option:last-child) {
    border-radius: 0 0 0.35em 0.35em;
  }
  :host([type="button"]:not([appearance="soft"])[orientation="vertical"]) ::slotted(u-option:not(:last-child)) {
    --_option-divider-block-end: 1px;
    --_option-divider-color: var(--u-neutral-300, #E0E0E0);
  }

  /* === Button + Soft — a segmented control ===
     A quiet track; the picked segment rises onto the surface. No joined borders. */
  :host([type="button"][appearance="soft"]) .container {
    gap: 2px;
    padding: 2px;
    border-color: transparent;
    border-radius: var(--u-radius-lg, 6px);
    background-color: var(--u-bg-color-raised, #FAFAFA);
  }
  :host([type="button"][appearance="soft"]) ::slotted(u-option) {
    justify-content: center;
    border-color: transparent;
    border-radius: var(--u-radius-md, 4px);
    color: var(--u-txt-color-weak, #616161);
    --option-border-color-interactive: transparent;
    --option-color-active: var(--u-txt-color, #212121);
    --option-border-color-active: transparent;
    --option-background-color-active: var(--u-bg-color, #FFFFFF);
    --option-color-active-interactive: var(--u-txt-color, #212121);
    --option-border-color-active-interactive: transparent;
    --option-background-color-active-interactive: var(--u-bg-color, #FFFFFF);
  }
  /* The segments' borders are transparent and u-option drops its own outline, so focus needs a
     ring of its own — in a radiogroup focus moves with the selection, and without this the focused
     segment shows no change at all (WCAG 2.4.7). */
  :host([type="button"][appearance="soft"]) ::slotted(u-option:focus-visible) {
    outline: 2px solid var(--u-focus-ring-color, #1565C0);
    outline-offset: 1px;
  }
  :host([type="button"][appearance="soft"]) ::slotted(u-option[selected]) {
    box-shadow: var(--u-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.04));
    font-weight: 600;
  }
`;
