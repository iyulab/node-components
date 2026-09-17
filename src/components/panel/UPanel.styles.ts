import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    overflow: auto;
  }
  :host([disabled]) {
    pointer-events: none;
    opacity: 0.5;
  }

  /*
   * 인쇄 - 종이에는 스크롤이 없다. overflow auto 는 독립 서식 문맥이라 패널 안 마지막 블록의
   * 아래 여백을 패널 안에 가두고 그만큼 패널이 자란다. 내용 끝이 쪽 경계에서 그 여백 이내에
   * 있으면 여백만 담긴 빈 꼬리 쪽이 찍힌다. 인쇄에서는 넘침을 흐름에 돌려 여백이 접히게 한다.
   * 높이는 이 패널이 소유하지 않는다 - 소비자가 준 고정 높이는 소비자가 화면 매체로 한정한다.
   */
  @media print {
    :host {
      overflow: visible;
    }
  }
`;
