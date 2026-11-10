import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-family: var(--u-font-base);
    color: var(--u-txt-color, #212121);
  }
  :host([hidden]) {
    display: none;
  }

  nav {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--pagination-gap, var(--u-space-sm, 8px)) var(--u-space-md, 12px);
  }

  /* 범위 글자 — 쪽 번호와 같은 줄의 보조 정보. 숫자가 바뀌어도 폭이 흔들리지 않게 고정폭 숫자. */
  .range {
    font-size: calc(var(--u-density, 14px) * 6 / 7);
    color: var(--u-txt-color-weak, #616161);
    font-variant-numeric: tabular-nums;
    margin-inline-end: auto;
  }

  .pages {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .page {
    font-variant-numeric: tabular-nums;
    min-width: 2.25em;
  }

  /* 이전/다음 셰브론은 LTR 모양(왼쪽 · 오른쪽)이다 — RTL 에서는 «이전» 이 오른쪽에 놓이므로 글리프도 뒤집어
     이전이 시작 쪽을, 다음이 끝 쪽을 가리키게 한다. */
  :host(:dir(rtl)) .step u-icon {
    transform: scaleX(-1);
  }

  .gap {
    min-width: 1.5em;
    text-align: center;
    color: var(--u-txt-color-weak, #616161);
    user-select: none;
  }
`;
