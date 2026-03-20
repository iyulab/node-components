import { css } from "lit";

/**
 * **주의**: 
 * 조상 요소에 transform + overflow의 조합일 경우, 
 * floating element가 뷰포트가 아닌 부모 요소를 기준으로 위치하게 됩니다.
 * 이 경우, floating element가 부모 요소의 경계를 벗어나지 못하게 됩니다.
 * 
 * **해결 방안**: 상위 레이어로 위치 변경
 */ 
export const styles = css`
  :host {
    position: absolute;
    z-index: 1000;
    top: 0;
    left: 0;
    width: max-content;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.2s ease, visibility 0s 0.2s;
  }
  :host([open]) {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition-delay: 0s;
  }
  :host([strategy="absolute"]) {
    position: absolute;
  }
  :host([strategy="fixed"]) {
    position: fixed;
  }

  /* 화살표: clip-path로 삼각형 */
  #arrow {
    position: absolute;
    width: 0.5em;
    height: 0.5em;
    background-color: inherit;
  }
`;