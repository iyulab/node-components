import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    z-index: 9999;
    inset: 0;
    display: flex;
    background: var(--u-overlay-bg-color, rgba(0, 0, 0, 0.4));

    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    /* 패널 슬라이드와 동일 duration + easing으로 맞춰 '띠요옹' 느낌 제거 (타이밍 미스매치 방지) */
    transition: opacity 0.35s cubic-bezier(0.22, 1, 0.36, 1), visibility 0s 0.35s;
    overflow: hidden;
  }
  :host([open]) {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition-delay: 0s;
  }
  :host([contained]) {
    position: absolute;
  }
  :host([mode="non-modal"]) {
    background: transparent;
    pointer-events: none;
  }
  :host([mode="non-modal"][open]) {
    pointer-events: none;
  }
`;
