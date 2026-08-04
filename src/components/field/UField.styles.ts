import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  :host([invalid]) .footer {
    color: var(--u-danger-color-strong, #C62828);
  }

  /* 🔴**라벨을 단 컨트롤은 필드 폭을 채운다.**
     컨트롤 자신의 기본값은 inline-block(자기 내용만큼)이 옳다 — 문장 안에 놓이는 경우가
     있기 때문이다. 그러나 u-field 로 감싼 순간 그것은 **폼의 한 칸**이고, 칸마다 컨트롤이
     제각각의 폭을 가지면 격자가 너덜너덜해진다. 실측: 같은 231px 칸 안에서 input 202 ·
     select 71/92/108 · textarea 168 — **오른쪽 끝이 다섯 군데에서 다 달랐다.**
     ⇒ 라벨·설명·검증 문구의 배치를 책임지는 이 컴포넌트가 폭도 함께 정한다.

     ⚠소비자가 인라인 style 로 폭을 주면 그쪽이 이긴다(인라인 > ::slotted).
     ⚠이 주석에 백틱을 쓰지 말 것 — css 태그드 템플릿을 그 자리에서 끝낸다(이 파일이 실제로
     그렇게 깨졌고, cycle-217 이 만든 타입 게이트가 잡았다). */
  ::slotted(*) {
    width: 100%;
    box-sizing: border-box;
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8em;
    margin-bottom: 0.5em;
    user-select: none;
  }

  .label {
    font-weight: 500;
    line-height: 1.25;
    cursor: pointer;
  }

  .required {
    color: var(--u-danger-color-strong, #C62828);
    margin-right: 0.2em;
  }
  
  .footer {
    color: var(--u-txt-color-weak, #757575);
    font-size: 0.75em;
    line-height: 1.2;
    margin-top: 0.5em;
  }
`;
