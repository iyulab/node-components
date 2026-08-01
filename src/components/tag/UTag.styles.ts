import { css } from "lit";

export const styles = css`
  :host {
    --tag-fill-color: var(--u-primary-color);
    --tag-color: var(--u-neutral-800);
    --tag-bg-color: var(--u-neutral-100);
    --tag-border-color: transparent;
  }

  /* ==========================================================================
     장식 축 — 색 슬롯 매핑
     color="purple" 에는 역할 의미가 없다(장식이다). 그래서 역할 토큰이 아니라
     팔레트를 직접 읽으며, 브랜드 오버라이드에 의도적으로 면역이다.
     아래 9개 규칙이 hue 슬롯을 채우고, variant 규칙이 그것을 소비한다.
     슬롯이 비면(color="neutral") variant 규칙의 폴백 = 브랜드 경로를 탄다.
     ========================================================================== */
  :host([color="blue"]) {
    --tag-hue-solid: var(--u-blue-500);
    --tag-hue-line: var(--u-blue-300);
    --tag-hue-surface: var(--u-blue-100);
    --tag-hue-text: var(--u-blue-800);
    --tag-hue-text-outlined: var(--u-blue-600);
  }
  :host([color="green"]) {
    --tag-hue-solid: var(--u-green-500);
    --tag-hue-line: var(--u-green-300);
    --tag-hue-surface: var(--u-green-100);
    --tag-hue-text: var(--u-green-800);
    --tag-hue-text-outlined: var(--u-green-600);
  }
   /* yellow 는 명도가 높아 solid·outlined 텍스트를 한 단 진하게 쓴다 */
  :host([color="yellow"]) {
    --tag-hue-solid: var(--u-yellow-600);
    --tag-hue-line: var(--u-yellow-300);
    --tag-hue-surface: var(--u-yellow-100);
    --tag-hue-text: var(--u-yellow-800);
    --tag-hue-text-outlined: var(--u-yellow-700);
  }
  :host([color="red"]) {
    --tag-hue-solid: var(--u-red-500);
    --tag-hue-line: var(--u-red-300);
    --tag-hue-surface: var(--u-red-100);
    --tag-hue-text: var(--u-red-800);
    --tag-hue-text-outlined: var(--u-red-600);
  }
  :host([color="orange"]) {
    --tag-hue-solid: var(--u-orange-500);
    --tag-hue-line: var(--u-orange-300);
    --tag-hue-surface: var(--u-orange-100);
    --tag-hue-text: var(--u-orange-800);
    --tag-hue-text-outlined: var(--u-orange-600);
  }
  :host([color="teal"]) {
    --tag-hue-solid: var(--u-teal-500);
    --tag-hue-line: var(--u-teal-300);
    --tag-hue-surface: var(--u-teal-100);
    --tag-hue-text: var(--u-teal-800);
    --tag-hue-text-outlined: var(--u-teal-600);
  }
  :host([color="cyan"]) {
    --tag-hue-solid: var(--u-cyan-500);
    --tag-hue-line: var(--u-cyan-300);
    --tag-hue-surface: var(--u-cyan-100);
    --tag-hue-text: var(--u-cyan-800);
    --tag-hue-text-outlined: var(--u-cyan-600);
  }
  :host([color="purple"]) {
    --tag-hue-solid: var(--u-purple-500);
    --tag-hue-line: var(--u-purple-300);
    --tag-hue-surface: var(--u-purple-100);
    --tag-hue-text: var(--u-purple-800);
    --tag-hue-text-outlined: var(--u-purple-600);
  }
  :host([color="pink"]) {
    --tag-hue-solid: var(--u-pink-500);
    --tag-hue-line: var(--u-pink-300);
    --tag-hue-surface: var(--u-pink-100);
    --tag-hue-text: var(--u-pink-800);
    --tag-hue-text-outlined: var(--u-pink-600);
  }

  /* Variant: solid (강한 채움, 색 미지정 시 --tag-fill-color = 브랜드) */
  :host([variant="solid"]) {
    --tag-color: var(--u-neutral-0);
    --tag-bg-color: var(--tag-hue-solid, var(--tag-fill-color));
    --tag-border-color: var(--tag-hue-solid, var(--tag-fill-color));
  }

  /* Variant: surface (채우기 + 테두리, 기본 색상은 --u-primary-color) */
  :host([variant="surface"]) {
    --tag-color: var(--tag-hue-text, color-mix(in srgb, var(--tag-fill-color) 70%, black));
    --tag-bg-color: var(--tag-hue-surface, color-mix(in srgb, var(--tag-fill-color) 15%, var(--u-bg-color)));
    --tag-border-color: var(--tag-hue-line, color-mix(in srgb, var(--tag-fill-color) 40%, var(--u-bg-color)));
  }

  /* Variant: filled (채우기만, 테두리 없음, 기본 색상은 --u-primary-color) */
  :host([variant="filled"]) {
    --tag-color: var(--tag-hue-text, color-mix(in srgb, var(--tag-fill-color) 70%, black));
    --tag-bg-color: var(--tag-hue-surface, color-mix(in srgb, var(--tag-fill-color) 15%, var(--u-bg-color)));
    --tag-border-color: transparent;
  }

  /* Variant: outlined (테두리만, 기본 색상은 --u-primary-color) */
  :host([variant="outlined"]) {
    --tag-color: var(--tag-hue-text-outlined, color-mix(in srgb, var(--tag-fill-color) 85%, black));
    --tag-bg-color: transparent;
    --tag-border-color: var(--tag-hue-line, color-mix(in srgb, var(--tag-fill-color) 40%, var(--u-bg-color)));
  }

  :host {
    display: inline-flex;
    font-size: 12px;
    font-weight: 500;
    border-radius: 4px;

    --tag-padding-block: 0.25em;
    --tag-padding-inline: 0.5em;
    --tag-gap: 4px;
    color: var(--tag-color);
    background-color: var(--tag-bg-color);
    line-height: 1.5em;
    white-space: nowrap;
    user-select: none;
    box-sizing: border-box;
  }

  /* 여백/테두리는 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .base {
    box-sizing: border-box;
    width: 100%;
    display: inline-flex;
    align-items: center;
    gap: var(--tag-gap);
    padding: var(--tag-padding-block) var(--tag-padding-inline);
    border: 1px solid var(--tag-border-color);
    border-radius: inherit;
  }
  :host([rounded]) {
    border-radius: 999px;
  }

  /* === Slots === */
  ::slotted([slot="prefix"]) {
    margin-right: 0.15em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.15em;
  }

  /* === Content === */
  .content {
    display: inline-block;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
