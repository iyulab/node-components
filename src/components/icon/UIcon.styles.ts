import { css } from "lit";

export const styles = css`
  /*
   * 상자는 SVG 가 도착하기 «전» 부터 1em × 1em 이다 — 아이콘은 비동기로 해석되고 그 전에는
   * 아무것도 그리지 않으므로, 고유 크기가 없으면 로드 순간 주변이 밀린다(레이아웃 이동).
   * 크기는 여전히 font-size 로 정한다.
   */
  :host {
    display: inline-flex;
    width: 1em;
    height: 1em;
    color: inherit;
    font-size: inherit;
  }

  svg {
    width: 1em;
    height: 1em;
  }
`;