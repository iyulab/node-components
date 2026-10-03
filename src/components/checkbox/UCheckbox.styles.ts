import { css } from "lit";

export const styles = css`
  :host {
    --checkbox-color: inherit;
    --checkbox-border-color: var(--u-input-border-color, #E0E0E0);
    --checkbox-background-color: var(--u-input-bg-color, #FFFFFF);
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    /* WCAG 2.2 SC 2.5.8 Target Size (Minimum) — 포인터 타깃은 24×24 CSS px 이상.
       ⚠재는 것은 **포인터 타깃**이지 시각 크기가 아니다 — 체크 박스(.checkbox)의
       치수는 그대로 두고 «클릭을 받는 영역»만 최소 높이를 갖는다. 라벨이 있으면
       내용이 이미 이보다 크므로 아무 일도 일어나지 않는다. */
    min-block-size: 24px;
    justify-content: center;
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
    user-select: none;
    cursor: pointer;
  }

  /* === 상태 스타일 === */
  :host(:disabled) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  :host([readonly]) {
    cursor: default;
  }
  :host([invalid]) {
    --checkbox-border-color: var(--u-danger-color, #D32F2F);
  }
  :host([invalid]) .footer {
    color: var(--u-danger-color-strong, #C62828);
  }
  :host([checked]) .checkbox u-icon,
  :host([indeterminate]) .checkbox u-icon {
    transform: scale(1);
  }
  :host(:not(:disabled):not([readonly]):hover) {
    --checkbox-border-color: var(--u-input-border-color-hover, #BDBDBD);
  }

  /* === solid — 배경 채움 === */
  :host([appearance="solid"][checked]),
  :host([appearance="solid"][indeterminate]) {
    /* 체크 표시가 **채운 면 위**에 선다 — 역할 축에서만 on-color 로 갈린다(장식 축은 폴백). */
    --checkbox-color: var(--checkbox-hue-on-fill, var(--u-neutral-100, #F5F5F5));
    --checkbox-border-color: var(--checkbox-hue);
    --checkbox-background-color: var(--checkbox-hue);
  }

  /* === outlined — 테두리만 === */
  :host([appearance="outlined"][checked]),
  :host([appearance="outlined"][indeterminate]) {
    /* 여기서는 같은 표시가 **바탕 위**에 선다 — 면 단이 아니라 -strong 이 맡는다. */
    --checkbox-color: var(--checkbox-hue-strong, var(--checkbox-hue));
    --checkbox-border-color: var(--checkbox-hue);
    --checkbox-background-color: transparent;
  }

  /* ==========================================================================
     역할 축 — 의미 슬롯. 장식 축(아래)과 달리 팔레트가 아니라 역할 토큰을 읽는다.
     슬롯이 셋인 이유는 체크 표시가 두 자리에 서기 때문이다 —
     filled 는 **채운 면 위**(그래서 on-color), outline 은 **바탕 위**(그래서 -strong).
     ========================================================================== */
  :host([color="primary"]) {
    --checkbox-hue: var(--u-primary-color, #1976D2);
    --checkbox-hue-on-fill: var(--u-primary-txt-color, #FFFFFF);
    --checkbox-hue-strong: var(--u-primary-color-strong, #1565C0);
  }
  :host([color="info"]) {
    --checkbox-hue: var(--u-info-color, #1976D2);
    --checkbox-hue-on-fill: var(--u-info-txt-color, #FFFFFF);
    --checkbox-hue-strong: var(--u-info-color-strong, #1565C0);
  }
  :host([color="success"]) {
    --checkbox-hue: var(--u-success-color, #2E7D32);
    --checkbox-hue-on-fill: var(--u-success-txt-color, #FFFFFF);
    --checkbox-hue-strong: var(--u-success-color-strong, #1B5E20);
  }
  :host([color="warning"]) {
    --checkbox-hue: var(--u-warning-color, #FDD835);
    --checkbox-hue-on-fill: var(--u-warning-txt-color, #000000);
    --checkbox-hue-strong: var(--u-warning-color-strong, #8A4A00);
  }
  :host([color="danger"]) {
    --checkbox-hue: var(--u-danger-color, #D32F2F);
    --checkbox-hue-on-fill: var(--u-danger-txt-color, #FFFFFF);
    --checkbox-hue-strong: var(--u-danger-color-strong, #C62828);
  }

  /* ==========================================================================
     장식 축 — color= 는 hue 슬롯만 채운다. appearance 규칙이 그것을 읽는다.
     2.0 전에는 기본값 blue 에 규칙이 없어 «브랜드 경로»를 탔다(blue 가 파랑이 아니라 «색 미지정»의
     표기였다). 이제 기본값은 primary(역할 축)이고 blue 는 다른 장식 색처럼 파랑이다 — 모든 색이 슬롯을
     채우므로 «빈 슬롯»용 채움 훅(--checkbox-fill-color)은 폐지했다.
     ========================================================================== */
  :host([color="blue"]) {
    --checkbox-hue: var(--u-blue-600, #1E88E5);
  }
  :host([color="green"]) {
    --checkbox-hue: var(--u-green-600, #43A047);
  }
  :host([color="red"]) {
    --checkbox-hue: var(--u-red-600, #E53935);
  }
  :host([color="orange"]) {
    --checkbox-hue: var(--u-orange-600, #FB8C00);
  }
  :host([color="teal"]) {
    --checkbox-hue: var(--u-teal-600, #00897B);
  }
  :host([color="cyan"]) {
    --checkbox-hue: var(--u-cyan-600, #00ACC1);
  }
  :host([color="purple"]) {
    --checkbox-hue: var(--u-purple-600, #8E24AA);
  }
  :host([color="pink"]) {
    --checkbox-hue: var(--u-pink-600, #D81B60);
  }
  :host([color="neutral"]) {
    --checkbox-hue: var(--u-neutral-600, #757575);
  }



  .wrapper {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.5em;
    cursor: inherit;
  }

  /* 네이티브 체크박스 */
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  input:focus-visible ~ .checkbox {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus, #1565C0),
      0 0 0 3px color-mix(in srgb, var(--u-primary-color-strong, #1565C0) 22%, transparent);
  }

  /* 체크박스 외형 — 클릭은 항상 .wrapper(<label>)가 받아야 한다(위임으로 이미
     충분하다 — 실측) — 자신도 pointer-events:none이라야 좌표 기반
     히트테스트(예: Playwright actionability check)가 이 박스를 투과해 label까지
     도달한다. */
  .checkbox {
    flex-shrink: 0;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.2em;
    height: 1.2em;
    color: var(--checkbox-color);
    border: 2px solid var(--checkbox-border-color);
    border-radius: 0.2em;
    background-color: var(--checkbox-background-color);
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), background-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    pointer-events: none;
  }

  .checkbox u-icon {
    font-size: 0.85em;
    transform: scale(0);
    transition: transform var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    pointer-events: none;
  }

  .label {
    font-size: 1em;
    line-height: 1.2;
  }

  .required {
    color: var(--u-danger-color-strong, #C62828);
    font-weight: 500;
  }

  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak, #616161);
    font-size: 0.75em;
    line-height: 1.2;
  }

  :host([invalid]) .description {
    color: var(--u-danger-color-strong, #C62828);
  }
`;
