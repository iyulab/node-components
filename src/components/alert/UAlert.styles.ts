import { css } from "lit";

export const styles = css`
  /* === Status Colors === */
  :host {
    --alert-icon-color: var(--u-neutral-700, #616161);
    --alert-border-color: var(--u-neutral-300, #E0E0E0);
    --alert-background-color: var(--u-neutral-200, #EEEEEE);
  }
  /* ★배경은 -weakest 가 아니라 면 토큰(--u-*-bg-color)이다.
     -weakest 는 라이트에서 shade-200 이라 **면으로 쓰기에 너무 진했다** — 그 위의
     아이콘(-strong)이 라이트 4/4 미달이었다(1.48~2.63, 기준 3.0). 다크는 통과했으므로
     라이트 한쪽만의 결함이었고, 원인은 전경이 아니라 배경이다.
     면 토큰으로 옮기면 두 테마 4/4 통과한다(4.58~7.00).
     -weakest 는 진행바 버퍼 같은 **그래픽** 단으로 남는다 — 같은 단에 면과 그래픽을
     겹쳐 두었던 것이 애초의 문제다. */
  :host([status="error"]) {
    --alert-icon-color: var(--u-danger-color-strong, #C62828);
    --alert-border-color: var(--u-danger-color-weaker, #E57373);
    --alert-background-color: var(--u-danger-bg-color, #FFEBEE);
  }
  :host([status="warning"]) {
    --alert-icon-color: var(--u-warning-color-strong, #8A4A00);
    --alert-border-color: var(--u-warning-color-weaker, #FFF176);
    --alert-background-color: var(--u-warning-bg-color, #FFF59D);
  }
  :host([status="info"]) {
    --alert-icon-color: var(--u-info-color-strong, #1565C0);
    --alert-border-color: var(--u-info-color-weaker, #64B5F6);
    --alert-background-color: var(--u-info-bg-color, #E3F2FD);
  }
  :host([status="success"]) {
    --alert-icon-color: var(--u-success-color-strong, #1B5E20);
    --alert-border-color: var(--u-success-color-weaker, #81C784);
    --alert-background-color: var(--u-success-bg-color, #E8F5E9);
  }
  :host([status="notice"]) {
    --alert-icon-color: var(--u-neutral-700, #616161);
    --alert-border-color: var(--u-neutral-300, #E0E0E0);
    --alert-background-color: var(--u-neutral-200, #EEEEEE);
  }

  :host {
    display: block;
    width: fit-content;
    min-width: 200px;
    max-width: 100%;
    max-height: 50vh;
    border-radius: var(--u-radius-xl, 8px);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
    
    opacity: 0;
    transform: scale(0.8);
    visibility: hidden;
    pointer-events: none;
    transition: 
      visibility 0s var(--u-duration-normal, 220ms),
      opacity var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform var(--u-duration-normal, 220ms) ease-out;
  }
  :host([open]) {
    opacity: 1;
    transform: scale(1);
    visibility: visible;
    pointer-events: auto;
    transition-delay: 0s;
  }

  /* === Variant Styles === */
  :host([variant="solid"]) {
    --alert-border-width: 1px;
    background-color: var(--alert-background-color);
  }
  :host([variant="filled"]) {
    --alert-border-width: 1px;
    background-color: var(--alert-background-color);
  }
  /* filled 의 테두리는 레이아웃 정합용이라 항상 투명하다 — 색 훅이 도달하면 안 된다. */
  :host([variant="filled"]) .container {
    border-color: transparent;
  }
  :host([variant="outlined"]) {
    --alert-border-width: 1px;
    background-color: transparent;
  }
  /* From https://css.glass */
  :host([variant="glass"]) {
    --alert-border-width: 1px;
    --alert-border-color: rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.2);
    /* 유리 질감의 넉넉한 반경 — 반경 스케일에 면(surface)용 상단 단이 생기면서
       리터럴 16px 이 스케일 안으로 들어왔다. 값은 그대로이고 출처만 축으로 옮긴다. */
    border-radius: var(--u-radius-3xl, 16px);
    /* ⚠**높이 축(--u-shadow-*)을 쓰지 않는다** — 이 값은 유리 질감 레시피의 일부이고
       (30px 번짐 + backdrop-filter), 높이를 뜻하지 않는다. 축으로 접으면 질감이 사라진다. */
    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
  }

  /* 여백/테두리는 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .container {
    box-sizing: border-box;
    width: 100%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: var(--alert-padding-block, var(--u-space-md, 12px)) var(--alert-padding-inline, var(--u-space-lg, 16px));
    border: var(--alert-border-width, 0) solid var(--alert-border-color);
    border-radius: inherit;
  }

  .header {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: var(--u-space-md, 12px);
    margin-bottom: var(--u-space-2xs, 4px);
    font-size: var(--u-text-subtitle-size, 16px);
    user-select: none;
  }
  .header .icon {
    flex-shrink: 0;
    color: var(--alert-icon-color);
  }
  .header .title {
    flex-grow: 1;
    font-weight: 600;
    line-height: 2;
  }
  .header .close-btn {
    flex-shrink: 0;
    padding: var(--u-space-2xs, 4px);
    font-size: inherit;
    border-radius: var(--u-radius-md, 4px);
  }

  .content {
    font-size: 14px;
    font-weight: 300;
    line-height: 1.5;
    overflow-y: auto;
  }

  .footer {
    display: inline-block;
  }
`;