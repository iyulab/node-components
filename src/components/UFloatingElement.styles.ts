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
    z-index: var(--u-layer-floating, 1000);
    top: 0;
    left: 0;
    width: max-content;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), visibility 0s var(--u-duration-normal, 220ms);
  }
  /* 닫힘 전환이 끝난 닫힌 요소는 레이아웃에서 뺀다 — 숨긴 절대 위치 상자도 스크롤 넘침에 든다(UFloatingElement.park).
     !important: 소비자가 호스트에 준 display 가 이 상태를 되살리지 못하게 한다. */
  :host(:state(parked)) {
    display: none !important;
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

  /* 앵커가 클리핑 영역(스크롤 컨테이너·뷰포트) 밖으로 나가 참조를 잃은 동안은 숨긴다.
     닫지는 않는다 — 앵커가 다시 보이면 열린 상태 그대로 복귀한다.
     특히 strategy="fixed" 는 overflow 조상에 클립되지 않으므로(그것이 fixed 를 쓰는 이유),
     이 규칙이 없으면 앵커가 스크롤 패널 밖으로 나간 뒤에도 팝오버만 화면에 남는다.
     :host([open]) 과 명시도가 같으므로 반드시 그 뒤에 와야 이긴다. */
  :host([anchor-hidden]) {
    visibility: hidden;
    pointer-events: none;
  }

  /* 화살표: clip-path로 삼각형 */
  #arrow {
    position: absolute;
    width: 0.5em;
    height: 0.5em;
    background-color: inherit;
  }
`;