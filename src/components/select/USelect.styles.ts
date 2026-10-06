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
    font-family: var(--u-font-base);
  }

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: var(--u-field-padding-block, 0.3em) var(--u-field-padding-inline, 0.6em);
    /* 호스트 하한(--u-target-size, 미설정 = 0) — 글자와 독립된 터치 하한. */
    box-sizing: border-box;
    min-height: var(--u-target-size, 0px);
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: var(--u-field-radius, 0.25em);
    background-color: var(--u-input-bg-color, #FFFFFF);
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    /* 잘라 내는 경계를 테두리 바깥선까지 — 호스트 하한(--u-target-size)으로 커진 접미 아이콘은 필드 높이를 채우고
       테두리 1px 위까지 닿는다. 패딩 상자에서 자르면 그 1px 이 눌리지 않는다(hidden 은 여백을 받지 않는다). */
    overflow: clip;
    overflow-clip-margin: 1px;
    user-select: none;
    cursor: pointer;
    /* 지우기 «x» 의 받는 여백 — 아래 접미 버튼 규칙과 글자 하한이 함께 읽는다. */
    --_target-pad: max(0.25em, calc(12px - 0.5em), calc(var(--u-target-size, 0px) / 2 - 0.5em));
    /* 글자 영역의 하한 — 지우기(받는 상자) · 펼침 화살표가 한 줄을 나눌 때 주어진 폭이 좁으면 표시 글자가 0 까지 접혀
       «무엇이 골라졌는지 보이지 않는» 채 정상처럼 그려졌다. 하한 아래로는 칸이 호스트 밖으로 넘친다 — 보이는 실패다.
       지우기 몫 = 글리프 1em + 받는 여백(왼쪽은 표시 글자 쪽으로 넓히고 오른쪽은 화살표 간격과 맞댄다) · 화살표(또는 스피너) 몫 =
       1em + 앞 간격 0.25em. 지우기가 보이는지(--_clear)는 렌더가 정한다. */
    min-inline-size: calc(
      2px + 2 * var(--u-field-padding-inline, 0.6em) + var(--select-min-text, 4ch)
      + var(--_clear, 0) * (1em + var(--_target-pad)) + 1.25em
    );
  }
  :host([readonly]) .container,
  :host(:disabled) .container {
    border-color: var(--u-border-color-weak, #EEEEEE);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
  }
  :host(:disabled) .container {
    cursor: not-allowed;
  }
  :host([readonly]) .container {
    cursor: default;
  }
  :host(:not([readonly]):not(:disabled)) .container:hover {
    box-shadow: 0 0 0 1px var(--u-input-border-color-hover, #BDBDBD);
  }
  :host(:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }
  :host([invalid]:not([readonly]):not(:disabled)) .container {
    box-shadow: 0 0 0 1px var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Appearance: soft (중립 틴트 면) ===== */
  :host([appearance="soft"]) .container {
    border: none;
    border-radius: var(--u-field-radius, 0.25em) var(--u-field-radius, 0.25em) 0 0;
    border-bottom: 2px solid var(--u-input-border-color, #E0E0E0);
    background-color: var(--u-neutral-200, #EEEEEE);
  }
  :host([appearance="soft"][readonly]) .container,
  :host([appearance="soft"]:disabled) .container {
    background-color: var(--u-bg-color-disabled, #FAFAFA);
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([appearance="soft"]:not([readonly]):not(:disabled)) .container:hover {
    box-shadow: none;
    background-color: var(--u-neutral-300, #E0E0E0);
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([appearance="soft"]:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
  }
  :host([appearance="soft"][invalid]:not([readonly]):not(:disabled)) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Appearance: underlined ===== */
  :host([appearance="underlined"]) .container {
    border: none;
    border-radius: var(--u-radius-none, 0);
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid var(--u-input-border-color, #E0E0E0);
  }
  :host([appearance="underlined"][readonly]) .container,
  :host([appearance="underlined"]:disabled) .container {
    background-color: transparent;
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([appearance="underlined"]:not([readonly]):not(:disabled)) .container:hover {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([appearance="underlined"]:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
    border-bottom-width: 2px;
  }
  :host([appearance="underlined"][invalid]:not([readonly]):not(:disabled)) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Appearance: plain (외형 없음) ===== */
  :host([appearance="plain"]) .container {
    border: none;
    border-radius: var(--u-radius-none, 0);
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }
  :host([appearance="plain"]:not([readonly]):not(:disabled)) .container:hover,
  :host([appearance="plain"]:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: none;
  }
  /* 외형이 없어도 포커스는 보여야 한다(WCAG 2.4.7) — 쉬는 동안은 아무것도 그리지 않고, 포커스가
     들어오면 링을 그린다. 깜박이는 캐럿만으로는 «어디에 포커스가 있는가» 를 알리기 어렵다. */
  :host([appearance="plain"]:not(:disabled)) .container:focus-within {
    outline: 2px solid var(--u-focus-ring-color, #1565C0);
    outline-offset: 2px;
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
    /* 비어 있어도(값 없음 · 플레이스홀더 없음) 한 줄 높이 — 종전에는 줄 상자가 없어 빈 선택이
       값이 있는 선택보다, 그리고 같은 행의 u-input 보다 낮았고 라벨 기준선이 어긋났다. */
    min-block-size: 1.5em;
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
    /* 받는 여백(--_target-pad)은 컨테이너가 정한다 — u-input 과 같은 식: 글자 크기와 무관하게 ≥ 24px,
       호스트 하한(--u-target-size)이 있으면 상자가 그 값. */
    box-sizing: content-box;
    /* 오른쪽은 펼침 화살표와 종전처럼 0.25em 만 맞댄다 — 글자가 작아 늘어난 폭은 왼쪽(값 글자 쪽, 타깃 아님)으로 넓힌다.
       16px 에서는 P = 0.25em 이라 종전 배치와 같다. */
    margin: calc(-1 * var(--_target-pad)) -0.25em calc(-1 * var(--_target-pad)) calc(0.25em - var(--_target-pad));
    padding: var(--_target-pad);
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
    padding: var(--u-field-padding-block, 0.3em) var(--u-field-padding-inline, 0.6em);
    color: var(--u-txt-color-weak, #616161);
    border-bottom: 1px solid var(--u-border-color, #E0E0E0);
  }
  .search-input input {
    all: unset;
    /* 포인터를 받는 것은 이 입력이다 — 글자 크기와 무관하게 24px 이상(WCAG 2.5.8). */
    min-block-size: max(24px, var(--u-target-size, 0px));
    flex: 1;
    min-width: 0;
    line-height: 1.5;
  }
  .search-input input::placeholder {
    color: var(--u-txt-color-weak, #616161);
  }

  /* === Size — 버튼과 같은 세 단. md 는 주변 글자 크기를 상속하지 않는다(버튼과 높이가 갈렸다). === */
  :host {
    font-size: var(--u-density, 14px);
  }
  :host([size="sm"]) {
    font-size: 12px;
  }
  :host([size="lg"]) {
    font-size: 16px;
  }
`;
