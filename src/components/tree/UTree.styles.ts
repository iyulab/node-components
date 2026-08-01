import { css } from "lit";

export const styles = css`
  :host {
    --tree-indent-size: 14px;
    --tree-indent-guide-offset: 8px;
    --tree-indent-guide-width: 1px;
    --tree-indent-guide-style: solid;
    --tree-indent-guide-color: var(--u-border-color-weak, #EEEEEE);
  }

  :host {
    display: block;
    /* rem 이 아니라 em 이다 — 루트 기준이면 소비자가 컨테이너 타이포를 키워도
       트리만 따라오지 않는다. 기본 상황(루트 16px)에서는 두 단위가 같은 14px 이므로
       시각은 바뀌지 않고, 상속 컨텍스트에서만 동작이 달라진다. */
    font-size: 0.875em;
    color: var(--u-txt-color, #212121);
  }
`;
