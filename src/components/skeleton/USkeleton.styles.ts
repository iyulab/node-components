import { css } from "lit";

export const styles = css`
  :host {
    --skeleton-width: 100%;
    --skeleton-height: 1em;
    --skeleton-color: var(--u-neutral-200, #EEEEEE);
    --skeleton-shimmer-color: var(--u-neutral-100, #F5F5F5);
  }

  :host {
    display: inline-block;
    width: var(--skeleton-width);
    height: var(--skeleton-height);
    background-color: var(--skeleton-color);
    animation: none;
  }

  /* 모양 설정 */
  :host([shape="rectangle"]) {
    border-radius: var(--u-radius-md, 4px);
  }
  :host([shape="circle"]) {
    border-radius: var(--u-radius-circle, 50%);
  }
  :host([shape="rounded"]) {
    border-radius: var(--u-radius-pill, 9999px);
  }

  /* 애니메이션 효과 설정 */
  :host([effect="pulse"]) {
    animation: pulse 1.5s ease-in-out infinite;
  }
  :host([effect="shimmer"]) {
    position: relative;
    overflow: hidden;
  }
  :host([effect="shimmer"])::after {
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

  /* ★**장식만 멈춘다.**
     시트의 reduce 규칙은 지속시간 축(--u-duration-*)을 0 으로 누르는 방식이라 animation
     속성을 직접 쓰는 이 자리에는 닿지 않는다 — 그 규칙이 animation: none 으로 강제하지
     않는 것은 의도다(로딩 스피너처럼 «회전 자체가 신호»인 움직임까지 죽이면 진행 여부를
     알 수 없다).

     스켈레톤은 다르다: **기본값이 이미 animation: none** 이고, 정지한 회색 블록이
     «로딩 중»을 그대로 나른다. 즉 pulse/shimmer 는 **opt-in 장식**이고, WCAG 2.2.2 의
     «움직임이 본질인 것» 예외에 해당하지 않는다.
     ⇒ 여기서만 멈춘다. u-spinner 는 건드리지 않는다. */
  @media (prefers-reduced-motion: reduce) {
    :host([effect="pulse"]),
    :host([effect="shimmer"])::after {
      animation: none;
    }
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
