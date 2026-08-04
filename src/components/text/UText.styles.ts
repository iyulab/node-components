import { css } from "lit";

/*
 * 이 컴포넌트의 존재 이유는 **시트의 7단 스케일을 마크업에서 쓸 자리**를 주는 것이다.
 * 그러므로 여기서 하는 일은 «토큰을 읽어 4속성에 배선하는 것» 하나뿐이고,
 * 자기 값을 발명하지 않는다 — 발명하는 순간 이 컴포넌트는 스케일의 소비자가 아니라
 * 두 번째 정의처가 된다.
 *
 * ⚠ 이 주석에 백틱을 쓰지 말 것 — css 태그드 템플릿을 그 자리에서 끝낸다.
 */
export const styles = css`
  :host {
    display: block;
    color: var(--u-txt-color, #212121);
  }

  /*
   * 기본은 body 다. :host([variant="body"]) 규칙을 따로 두지 않는 이유는
   * 값이 같기 때문이며, 부수 효과로 **알 수 없는 variant 가 body 로 흐른다**
   * (조용히 폰트가 사라지는 것보다 낫다).
   */
  .text {
    margin: 0;
    font-family: inherit;
    font-size: var(--u-text-body-size, 14px);
    font-weight: var(--u-text-body-weight, 400);
    line-height: var(--u-text-body-leading, 1.6);
    letter-spacing: var(--u-text-body-tracking, 0);
  }

  :host([variant="display"]) .text {
    font-size: var(--u-text-display-size, 26px);
    font-weight: var(--u-text-display-weight, 700);
    line-height: var(--u-text-display-leading, 1.4);
    letter-spacing: var(--u-text-display-tracking, -0.02em);
  }

  :host([variant="title"]) .text {
    font-size: var(--u-text-title-size, 20px);
    font-weight: var(--u-text-title-weight, 700);
    line-height: var(--u-text-title-leading, 1.45);
    letter-spacing: var(--u-text-title-tracking, -0.01em);
  }

  :host([variant="subtitle"]) .text {
    font-size: var(--u-text-subtitle-size, 16px);
    font-weight: var(--u-text-subtitle-weight, 600);
    line-height: var(--u-text-subtitle-leading, 1.5);
    letter-spacing: var(--u-text-subtitle-tracking, 0);
  }

  :host([variant="label"]) .text {
    font-size: var(--u-text-label-size, 13px);
    font-weight: var(--u-text-label-weight, 600);
    line-height: var(--u-text-label-leading, 1.5);
    letter-spacing: var(--u-text-label-tracking, 0);
  }

  :host([variant="caption"]) .text {
    font-size: var(--u-text-caption-size, 12px);
    font-weight: var(--u-text-caption-weight, 400);
    line-height: var(--u-text-caption-leading, 1.5);
    letter-spacing: var(--u-text-caption-tracking, 0);
  }

  /*
   * ⚠ overline 에 text-transform: uppercase 를 붙이지 않는다.
   *
   * 눈썹 텍스트의 관습이긴 하나 ⑴시트가 정의하는 것은 네 속성뿐이라 다섯 번째를 여기서
   * 정하면 이 컴포넌트가 «두 번째 정의처»가 되고 ⑵소비자가 쓴 글자를 조용히 바꾸며
   * ⑶CJK 에는 아무 효과가 없어 **같은 단이 언어에 따라 다르게 보인다.**
   * 대문자가 필요한 자리는 그 자리가 정한다.
   */
  :host([variant="overline"]) .text {
    font-size: var(--u-text-overline-size, 11px);
    font-weight: var(--u-text-overline-weight, 700);
    line-height: var(--u-text-overline-leading, 1.45);
    letter-spacing: var(--u-text-overline-tracking, 0.06em);
  }

  /*
   * tone 은 **중립 강조 축**이다 — 역할색(info/success/danger…)이 아니다.
   * 소비앱 실측에서 나온 색 다섯 중 셋이 이 축이었고, 나머지 둘은 링크와
   * 콜아웃 박스라 u-text 의 문제가 아니었다.
   */
  :host([tone="weak"]) {
    color: var(--u-txt-color-weak, #757575);
  }

  :host([tone="strong"]) {
    color: var(--u-txt-color-strong, #000000);
  }

  :host([tone="inverse"]) {
    color: var(--u-txt-color-inverse, #FFFFFF);
  }
`;
