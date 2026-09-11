import { css } from "lit";

export const styles = css`
  :host {
    /* --anchor-width는 u-popover(자식) 자신에게 JS로 설정되므로 여기서는 참조할 수 없다
       (커스텀 프로퍼티는 조상→자손으로만 상속). 실제 폴백은 아래 u-popover 규칙에서 처리. */
    --select-popover-min-height: 0px;
    --select-popover-max-height: 50vh;
  }

  :host {
    position: relative;
    /* 폼/그리드 셀에서 컨테이너 폭을 채우려면 소비자가 --u-select-display: block 을 준다.
       flex 컨테이너처럼 block 만으로 늘어나지 않는 맥락을 위해 width 경로도 함께 연다. */
    display: var(--u-select-display, inline-block);
    width: var(--u-select-width, auto);
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color, #FFFFFF);
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    overflow: hidden;
    user-select: none;
    cursor: pointer;
  }
  :host([readonly]) .container,
  :host([disabled]) .container {
    border-color: var(--u-border-color-weak, #EEEEEE);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
  }
  :host([disabled]) .container {
    cursor: not-allowed;
  }
  :host([readonly]) .container {
    cursor: default;
  }
  :host(:not([readonly]):not([disabled])) .container:hover {
    box-shadow: 0 0 0 1px var(--u-input-border-color-hover, #BDBDBD);
  }
  :host(:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }
  :host([invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: 0 0 0 1px var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Variant: filled ===== */
  :host([variant="filled"]) .container {
    border: none;
    border-radius: 0.25em 0.25em 0 0;
    border-bottom: 2px solid var(--u-input-border-color, #E0E0E0);
    background-color: var(--u-neutral-200, #EEEEEE);
  }
  :host([variant="filled"][readonly]) .container,
  :host([variant="filled"][disabled]) .container {
    background-color: var(--u-bg-color-disabled, #FAFAFA);
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([variant="filled"]:not([readonly]):not([disabled])) .container:hover {
    box-shadow: none;
    background-color: var(--u-neutral-300, #E0E0E0);
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([variant="filled"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
  }
  :host([variant="filled"][invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Variant: underlined ===== */
  :host([variant="underlined"]) .container {
    border: none;
    border-radius: var(--u-radius-none, 0);
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid var(--u-input-border-color, #E0E0E0);
  }
  :host([variant="underlined"][readonly]) .container,
  :host([variant="underlined"][disabled]) .container {
    background-color: transparent;
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([variant="underlined"]:not([readonly]):not([disabled])) .container:hover {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([variant="underlined"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
    border-bottom-width: 2px;
  }
  :host([variant="underlined"][invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Variant: borderless ===== */
  :host([variant="borderless"]) .container {
    border: none;
    border-radius: var(--u-radius-none, 0);
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }
  :host([variant="borderless"]:not([readonly]):not([disabled])) .container:hover,
  :host([variant="borderless"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
  }

  .count {
    color: var(--u-txt-color-weak, #616161);
    line-height: 1.25;
    /* n / m 은 제자리에서 n 이 바뀐다 — 비례폭이면 선택할 때마다 라벨 줄이 흔들린다 */
    font-variant-numeric: tabular-nums;
  }

  .text-content {
    flex: 1;
    min-width: 0;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .text-content.placeholder {
    color: var(--u-txt-color-weak, #616161);
  }

  .chips-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.25em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.25em;
  }

  .suffix-item {
    margin-left: 0.25em;
    font-size: 1em;
    color: var(--u-icon-color, #616161);
    transition: color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    cursor: pointer;
  }
  .suffix-item:hover {
    color: var(--u-icon-color-hover, #1565C0);
  }
  .suffix-item:active {
    color: var(--u-icon-color-active, #1565C0);
  }

  /* 지우기 «x» — 글리프는 1em 그대로, 받는 영역만 24px(1.5em)로 넓힌다(WCAG 2.2 SC 2.5.8). 왼쪽은 자기 앞
     간격을 패딩으로, 오른쪽은 뒤따르는 펼침 화살표(트리거의 일부인 장식 — 별도 타깃이 아니다)의 간격으로,
     위아래는 컨테이너 여백(0.3em) 쪽으로 넓힌다. 음수 여백이라 배치·트리거 높이는 그대로다 — 트리거의 줄은
     1em 이라 세로 패딩만 주면 트리거가 8px 커진다. */
  .suffix-item[role="button"] {
    box-sizing: content-box;
    margin: -0.25em -0.25em -0.25em 0;
    padding: 0.25em;
  }

  /* 드롭다운 패널 — 옵션 텍스트가 길어도 팝오버가 앵커보다 넓어지지 않도록 고정 너비로
     맞춘다(긴 텍스트는 UOption 자체의 ellipsis로 처리). */
  u-popover {
    width: var(--select-popover-width, var(--anchor-width, 100%));
    min-height: var(--select-popover-min-height);
    max-height: var(--select-popover-max-height);
    padding: 4px;
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-lg, 6px);
    background-color: var(--u-panel-bg-color, #FFFFFF);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
    overflow-x: hidden;
    overflow-y: auto;
  }

  .search-input {
    display: flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.3em 0.6em;
    color: var(--u-txt-color-weak, #616161);
    border-bottom: 1px solid var(--u-border-color, #E0E0E0);
  }
  .search-input input {
    all: unset;
    flex: 1;
    min-width: 0;
    line-height: 1.5;
  }
  .search-input input::placeholder {
    color: var(--u-txt-color-weak, #616161);
  }
`;
