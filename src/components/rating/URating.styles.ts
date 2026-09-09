import { css } from "lit";

export const styles = css`
  :host {
    --rating-symbol-color: var(--u-warning-color-strong, #8A4A00);
    --rating-symbol-off-color: var(--u-neutral-300, #E0E0E0);
  }

  :host {
    display: block;
    font-size: inherit;
    font-family: var(--u-font-base);
    user-select: none;
  }

  .symbols {
    display: flex;
    align-items: center;
    gap: 0.2em;
    cursor: pointer;
  }

  .symbol {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    /* WCAG 2.2 SC 2.5.8 — 심볼은 «각각이» 포인터 타깃이고 서로 인접해 있어
       간격 예외를 받지 못한다(중심 간 24px 미만). ⚠글리프 크기(font-size)는
       그대로 두고 **패딩으로 타깃만** 24×24 이상으로 만든다 — 별이 커지면
       평점 위젯의 시각적 무게가 달라지고, 그것은 이 처방이 피하려는 것이다.
       패딩이 늘면 중심 간 거리도 함께 벌어져 겹침도 생기지 않는다. */
    padding: 0.16em;
    outline: none;
    border-radius: 0.15em;
    color: var(--rating-symbol-off-color);
    transition: color var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), transform var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .symbol:focus-visible {
    outline: 2px solid var(--u-primary-color-strong, #1565C0);
    outline-offset: 2px;
  }
  :host(:not([disabled]):not([readonly])) .symbol:hover {
    transform: scale(1.2);
  }

  .symbol-fg {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    display: flex;
    align-items: center;
    color: var(--rating-symbol-color);
    pointer-events: none;
    overflow: hidden;
  }
`;
