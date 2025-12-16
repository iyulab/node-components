import { css } from "lit";

export const styles = css`
  :host {
    --skeleton-width: 100%;
    --skeleton-height: 1em;
    --skeleton-color: var(--u-neutral-200, #e5e5e5);
    --skeleton-shimmer-color: var(--u-neutral-100, #f5f5f5);
  }

  :host {
    display: inline-block;
    width: var(--skeleton-width);
    height: var(--skeleton-height);
  }

  .skeleton {
    width: 100%;
    height: 100%;
    background-color: var(--skeleton-color);
    border-radius: 4px;
    animation: none;
  }
  
  /* 모양 설정 */
  .skeleton[shape="circle"] {
    border-radius: 50%;
  }
  .skeleton[shape="rounded"] {
    border-radius: 9999px;
  }

  /* 애니메이션 효과 설정 */
  .skeleton[effect="pulse"] {
    animation: pulse 1.5s ease-in-out infinite;
  }
  .skeleton[effect="shimmer"] {
    position: relative;
    overflow: hidden;
  }
  .skeleton[effect="shimmer"]::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      var(--skeleton-shimmer-color),
      transparent
    );
    animation: shimmer 1.5s infinite;
    transform: translateX(-100%);
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
  }

  @keyframes shimmer {
    100% {
      transform: translateX(100%);
    }
  }
`;
