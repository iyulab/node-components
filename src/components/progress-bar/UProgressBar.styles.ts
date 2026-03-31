import { css } from 'lit';

export const styles = css`
  :host {
    --progress-bar-height: 0.5em;
    --progress-bar-color: var(--u-blue-600);
    --progress-bar-buffer-color: var(--u-blue-200);
    --progress-bar-track-color: var(--u-neutral-200);
  }

  /* === Status Colors === */
  :host([status="success"]) { 
    --progress-bar-color: var(--u-green-600); 
    --progress-bar-buffer-color: var(--u-green-200); 
  }
  :host([status="warning"]) { 
    --progress-bar-color: var(--u-yellow-500); 
    --progress-bar-buffer-color: var(--u-yellow-200); 
  }
  :host([status="error"]) { 
    --progress-bar-color: var(--u-red-600); 
    --progress-bar-buffer-color: var(--u-red-200); 
  }
  :host([status="info"]) { 
    --progress-bar-color: var(--u-blue-500); 
    --progress-bar-buffer-color: var(--u-blue-200); 
  }

  :host {
    position: relative;
    display: block;
    width: 100%;
    height: var(--progress-bar-height);
    background-color: var(--progress-bar-track-color);
    overflow: hidden;
  }

  /* === Rounded === */
  :host([rounded]) {
    border-radius: 9999px;
  }

  /* === Indeterminate === */
  :host([indeterminate]) .indicator {
    animation: indeterminate-move 2s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
    transform: none !important;
    inset: 0;
  }

  /* === Striped Effect === */
  :host([striped]) .indicator {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 1em 1em;
    animation: striped-move 1s linear infinite;
  }

  :host([striped][indeterminate]) .indicator {
    animation:
      indeterminate-move 2s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite,
      striped-move 1s linear infinite;
  }

  /* === Indicator Bar === */
  .indicator {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--progress-bar-color);
    transform-origin: left center;
    transform: scaleX(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  /* === Buffer Bar === */
  .buffer {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: var(--progress-bar-buffer-color);
    transform-origin: left center;
    transform: scaleX(0);
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  /* === Segments === */
  .segments {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }
  .segment-gap {
    position: absolute;
    top: 0;
    bottom: 0;
    background-color: var(--progress-bar-track-color);
    transform: translateX(-50%);
  }

  /* === Content (슬롯) === */
  .content {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.65em;
    line-height: 1;
    white-space: nowrap;
    user-select: none;
    pointer-events: none;
  }

  @keyframes indeterminate-move {
    0% {
      left: -35%;
      right: 100%;
    }
    60% {
      left: 100%;
      right: -90%;
    }
    100% {
      left: 100%;
      right: -90%;
    }
  }

  @keyframes striped-move {
    from { background-position: 1em 0; }
    to { background-position: 0 0; }
  }
`;
