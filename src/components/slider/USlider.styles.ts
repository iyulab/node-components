import { css } from "lit";

export const styles = css`
  :host {
    --slider-fill-color: var(--u-primary-color, #1976D2);
    --slider-track-color: var(--u-neutral-300, #E0E0E0);
    --slider-track-height: 6px;
    --slider-thumb-size: 18px;
    --slider-thumb-color: var(--slider-fill-color);
    --slider-thumb-border-color: var(--u-neutral-0, #FFFFFF);
    --slider-mark-size: 12px;
    --slider-mark-color: var(--u-neutral-0, #FFFFFF);
    --slider-mark-border-color: var(--u-neutral-400, #BDBDBD);
  }

  :host {
    display: block;
    width: 100%;
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  /* 라이브러리가 **스스로 그리는 숫자**는 고정폭 자릿수로 낸다.
     둘 다 제자리에서 값이 바뀌는 자리라 비례폭이면 드래그 중 글자가 흔들린다.
     ★툴팁은 슬롯을 건너 상속으로 닿는다 — font-variant-numeric 은 상속 프로퍼티다. */
  [slot="label-aside"],
  u-tooltip[part="thumb-tooltip"] {
    font-variant-numeric: tabular-nums;
  }

  .container {
    position: relative;
    /* ⚠실제 포인터 타깃은 thumb 이 아니라 이 컨테이너다 — pointerdown 이 여기 걸려 있고
       트랙 어디를 눌러도 값이 바뀐다. WCAG 2.2 SC 2.5.8 의 24px 하한은 그래서 여기에도 든다.
       보이는 트랙(6px)·thumb 치수는 그대로이고, 늘어나는 것은 «잡히는 높이»뿐이다.
       ⚠주석에 백틱을 쓰지 말 것 — 태그드 템플릿이 그 자리에서 끝난다. */
    height: max(var(--slider-thumb-size), 24px);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  .track {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: var(--slider-track-height);
    border-radius: calc(var(--slider-track-height) / 2);
    background: var(--slider-track-color);
    overflow: visible;
  }

  .fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: inherit;
    background: var(--slider-fill-color);
  }

  .thumb {
    position: absolute;
    z-index: 1;
    top: 50%;
    transform: translate(-50%, -50%);
    outline: none;
    /* 🔴히트·포커스 영역만 24px 하한으로 넓힌다 — 보이는 원은 .thumb-content 가 그대로 그린다
       (WCAG 2.2 SC 2.5.8). 박스가 커져도 중심은 그대로다: 콘텐츠를 가운데 놓으므로
       left:% + translate(-50%) 가 가리키는 점이 곧 보이는 원의 중심이다.
       ⚠**여백(padding)으로 넓히지 않는다** — 24px 은 여백 스케일의 2xl 과 같은 값이라
       「축 B 는 스케일 리터럴을 여백에 쓰지 않는다」 규칙(space-scale)에 걸리고, 그렇다고
       --u-space-2xl 로 배선하면 ***접근성 하한이 여백 스케일을 손볼 때 따라 움직인다.***
       하한은 여백이 아니므로 여백이 아닌 자리에 적는다.
       ⚠툴팁은 이 박스의 레이아웃에 참여하지 않는다(플로팅이라 흐름 밖) — 그래서 grid 로
       바꿔도 콘텐츠와 겹치지 않는다. */
    display: grid;
    place-items: center;
    min-width: 24px;
    min-height: 24px;
  }

  .thumb-content {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--slider-thumb-border-color);
    border-radius: var(--u-radius-circle, 50%);
    background: var(--slider-thumb-color);
    box-shadow: var(--u-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.04));
    transition: transform var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), box-shadow var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    cursor: pointer;
  }
  .thumb:hover .thumb-content,
  .thumb:active .thumb-content {
    transform: scale(1.15);
    box-shadow: var(--u-shadow-md, 0 2px 8px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.05));
  }
  .thumb:focus-visible .thumb-content {
    box-shadow: 0 0 0 1px var(--slider-fill-color);
  }

  /* 슬롯에 커스텀 엘리먼트가 들어오면 기본 스타일 제거 */
  .thumb-content:has(::slotted(*)) {
    width: auto;
    height: auto;
    border: none;
    border-radius: var(--u-radius-none, 0);
    background: transparent;
    box-shadow: none;
  }

  .marks {
    position: absolute;
    z-index: 0;
    inset: 0;
    pointer-events: none;
  }

  .mark {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: var(--slider-mark-size);
    height: var(--slider-mark-size);
    border: 2px solid var(--slider-mark-border-color);
    border-radius: var(--u-radius-circle, 50%);
    background: var(--slider-mark-color);
  }

  .mark-labels {
    position: relative;
    margin-top: var(--u-space-md, 12px);
  }

  .mark-label {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.75em;
    color: var(--u-txt-color-weak, #616161);
    white-space: nowrap;
  }
`;
