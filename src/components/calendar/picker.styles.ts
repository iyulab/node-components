import { css } from "lit";

/**
 * 날짜 피커들(`u-date-picker` · `u-date-range-picker`)이 함께 쓰는 트리거·팝오버·하단 줄 규칙.
 * 호스트의 `display`/`width` 와 팝오버 폭은 피커마다 다르므로 각 피커의 시트가 갖는다.
 */
export const styles = css`
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: var(--u-field-padding-block, 0.3em) var(--u-field-padding-inline, 0.6em);
    /* 호스트 하한(--u-target-size, 미설정 = 0) — 다른 필드와 같은 높이 하한. */
    box-sizing: border-box;
    min-height: var(--u-target-size, 0px);
    /* 접미 버튼(지우기 · 달력)의 받는 여백 — u-input·u-select 와 같은 식: 글자 크기와 무관하게 상자 ≥ 24px,
       호스트 하한(--u-target-size)이 있으면 그 값. 아래 접미 버튼 규칙과 하한 계산이 함께 읽는다. */
    --_target-pad: max(0.25em, calc(12px - 0.5em), calc(var(--u-target-size, 0px) / 2 - 0.5em));
    /* 맨 뒤 접미 버튼이 오른쪽으로 넓힐 자리 — 호스트 하한이 있을 때만 종전 여백보다 커진다. */
    padding-right: max(var(--u-field-padding-inline, 0.6em), var(--_target-pad));
    /* 글자 영역의 하한 — 접미 버튼이 한 줄을 나눌 때 주어진 폭이 좁으면 입력이 0 까지 접혀 값도 커서도 «보이지 않는» 채
       정상처럼 그려졌다. 하한 아래로는 칸이 호스트 밖으로 넘친다 — 보이는 실패다. 버튼 수(--_icons)는 렌더가 정한다.
       버튼 하나의 몫 = 글리프 1em + 받는 여백 + 앞 간격(0.4em 또는 받는 여백 중 큰 쪽). 글자 하한은 피커마다 바꾼다. */
    min-inline-size: calc(
      2px + var(--u-field-padding-inline, 0.6em) + var(--_min-text, 4ch)
      + var(--_icons, 0) * (1em + var(--_target-pad) + max(0.4em, var(--_target-pad)))
      + max(var(--u-field-padding-inline, 0.6em), var(--_target-pad))
    );
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: var(--u-field-radius, 0.25em);
    background-color: var(--u-input-bg-color, #FFFFFF);
    cursor: pointer;
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  :host([readonly]) .container,
  :host(:disabled) .container {
    cursor: not-allowed;
    border-color: var(--u-border-color-weak, #EEEEEE);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
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

  .text-content {
    flex: 1 0 auto;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .text-content.placeholder {
    color: var(--u-txt-color-weak, #616161);
  }

  .suffix-item {
    color: var(--u-icon-color, #616161);
    font-size: 1em;
    transition: color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .suffix-item:hover {
    color: var(--u-icon-color-hover, #1565C0);
  }
  /* 지우기 «x» · 달력 버튼 — 글리프는 1em 그대로, 받는 영역만 넓힌다(WCAG 2.2 SC 2.5.8 · 호스트 하한). 음수 여백이라
     배치·트리거 높이는 그대로다. 앞 간격은 컨테이너 gap 이 아니라 이 왼쪽 여백 하나다 — 앞 버튼 상자가 넘어오는 몫(받는 여백)
     이상이라 상자가 겹치지 않는다. gap 과 여백으로 나누면 둘이 따로 반올림돼(1/64px) 경계가 앞 버튼을 덮었다(실측). */
  .suffix-item[role="button"] {
    box-sizing: content-box;
    margin: calc(-1 * var(--_target-pad)) calc(-1 * var(--_target-pad)) calc(-1 * var(--_target-pad))
      max(0.4em, var(--_target-pad));
    padding: var(--_target-pad);
  }

  u-popover {
    padding: 8px;
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-lg, 6px);
    background-color: var(--u-panel-bg-color, #FFFFFF);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
  }

  .calendar-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    margin-top: 4px;
    border-top: 1px solid var(--u-border-color-weak, #EEEEEE);
  }

  /* mode="datetime" 의 시간 칸 줄 — 단일 피커는 칸 하나, 기간 피커는 이름 붙은 칸 둘. */
  .calendar-time {
    display: flex;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 4px 12px;
    padding: 4px 4px 0;
  }
  .time-field {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--u-txt-color-weak, #616161);
  }
  .time-input {
    font-family: inherit;
    font-size: 0.9em;
    padding: 2px 6px;
    box-sizing: border-box;
    min-height: var(--u-target-size, 0px);
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color, #FFFFFF);
    color: var(--u-txt-color, #212121);
  }
  .time-input:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }

  /* confirm 모드의 취소·적용 — 줄 끝에 붙는다(빠른 동작이 없으면 혼자서도 오른쪽). */
  .confirm-actions {
    display: flex;
    gap: 4px;
    margin-inline-start: auto;
  }
`;
