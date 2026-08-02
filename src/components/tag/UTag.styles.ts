import { css } from "lit";

export const styles = css`
  :host {
    --tag-fill-color: var(--u-primary-color, #1976D2);
    --tag-color: var(--u-neutral-800, #424242);
    --tag-bg-color: var(--u-neutral-100, #F5F5F5);
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
    --tag-hue-solid: var(--u-blue-500, #2196F3);
    --tag-hue-line: var(--u-blue-300, #64B5F6);
    --tag-hue-surface: var(--u-blue-100, #BBDEFB);
    --tag-hue-text: var(--u-blue-800, #1565C0);
    --tag-hue-text-outlined: var(--u-blue-600, #1E88E5);
  }
  :host([color="green"]) {
    --tag-hue-solid: var(--u-green-500, #4CAF50);
    --tag-hue-line: var(--u-green-300, #81C784);
    --tag-hue-surface: var(--u-green-100, #C8E6C9);
    --tag-hue-text: var(--u-green-800, #2E7D32);
    --tag-hue-text-outlined: var(--u-green-600, #43A047);
  }
   /* yellow 는 명도가 높아 solid·outlined 텍스트를 한 단 진하게 쓴다 */
  :host([color="yellow"]) {
    --tag-hue-solid: var(--u-yellow-600, #FDD835);
    --tag-hue-line: var(--u-yellow-300, #FFF176);
    --tag-hue-surface: var(--u-yellow-100, #FFF9C4);
    --tag-hue-text: var(--u-yellow-800, #F9A825);
    --tag-hue-text-outlined: var(--u-yellow-700, #FBC02D);
  }
  :host([color="red"]) {
    --tag-hue-solid: var(--u-red-500, #F44336);
    --tag-hue-line: var(--u-red-300, #E57373);
    --tag-hue-surface: var(--u-red-100, #FFCDD2);
    --tag-hue-text: var(--u-red-800, #C62828);
    --tag-hue-text-outlined: var(--u-red-600, #E53935);
  }
  :host([color="orange"]) {
    --tag-hue-solid: var(--u-orange-500, #FF9800);
    --tag-hue-line: var(--u-orange-300, #FFB74D);
    --tag-hue-surface: var(--u-orange-100, #FFE0B2);
    --tag-hue-text: var(--u-orange-800, #EF6C00);
    --tag-hue-text-outlined: var(--u-orange-600, #FB8C00);
  }
  :host([color="teal"]) {
    --tag-hue-solid: var(--u-teal-500, #009688);
    --tag-hue-line: var(--u-teal-300, #4DB6AC);
    --tag-hue-surface: var(--u-teal-100, #B2DFDB);
    --tag-hue-text: var(--u-teal-800, #00695C);
    --tag-hue-text-outlined: var(--u-teal-600, #00897B);
  }
  :host([color="cyan"]) {
    --tag-hue-solid: var(--u-cyan-500, #00BCD4);
    --tag-hue-line: var(--u-cyan-300, #4DD0E1);
    --tag-hue-surface: var(--u-cyan-100, #B2EBF2);
    --tag-hue-text: var(--u-cyan-800, #00838F);
    --tag-hue-text-outlined: var(--u-cyan-600, #00ACC1);
  }
  :host([color="purple"]) {
    --tag-hue-solid: var(--u-purple-500, #9C27B0);
    --tag-hue-line: var(--u-purple-300, #BA68C8);
    --tag-hue-surface: var(--u-purple-100, #E1BEE7);
    --tag-hue-text: var(--u-purple-800, #6A1B9A);
    --tag-hue-text-outlined: var(--u-purple-600, #8E24AA);
  }
  :host([color="pink"]) {
    --tag-hue-solid: var(--u-pink-500, #E91E63);
    --tag-hue-line: var(--u-pink-300, #F06292);
    --tag-hue-surface: var(--u-pink-100, #F8BBD0);
    --tag-hue-text: var(--u-pink-800, #AD1457);
    --tag-hue-text-outlined: var(--u-pink-600, #D81B60);
  }

  /* Variant: solid (강한 채움, 색 미지정 시 --tag-fill-color = 브랜드) */
  :host([variant="solid"]) {
    --tag-color: var(--u-neutral-0, #FFFFFF);
    --tag-bg-color: var(--tag-hue-solid, var(--tag-fill-color));
    --tag-border-color: var(--tag-hue-solid, var(--tag-fill-color));
  }

  /* Variant: surface (채우기 + 테두리, 기본 색상은 --u-primary-color) */
  :host([variant="surface"]) {
    --tag-color: var(--tag-hue-text, color-mix(in srgb, var(--tag-fill-color) 70%, black));
    --tag-bg-color: var(--tag-hue-surface, color-mix(in srgb, var(--tag-fill-color) 15%, var(--u-bg-color, #FFFFFF)));
    --tag-border-color: var(--tag-hue-line, color-mix(in srgb, var(--tag-fill-color) 40%, var(--u-bg-color, #FFFFFF)));
  }

  /* Variant: filled (채우기만, 테두리 없음, 기본 색상은 --u-primary-color) */
  :host([variant="filled"]) {
    --tag-color: var(--tag-hue-text, color-mix(in srgb, var(--tag-fill-color) 70%, black));
    --tag-bg-color: var(--tag-hue-surface, color-mix(in srgb, var(--tag-fill-color) 15%, var(--u-bg-color, #FFFFFF)));
    --tag-border-color: transparent;
  }

  /* Variant: outlined (테두리만, 기본 색상은 --u-primary-color) */
  :host([variant="outlined"]) {
    --tag-color: var(--tag-hue-text-outlined, color-mix(in srgb, var(--tag-fill-color) 85%, black));
    --tag-bg-color: transparent;
    --tag-border-color: var(--tag-hue-line, color-mix(in srgb, var(--tag-fill-color) 40%, var(--u-bg-color, #FFFFFF)));
  }

  :host {
    display: inline-flex;
    font-size: 12px;
    font-weight: 500;
    border-radius: var(--u-radius-md, 4px);

    --tag-padding-block: 0.25em;
    --tag-padding-inline: 0.5em;
    --tag-gap: var(--u-space-xs, 6px);
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
    border-radius: var(--u-radius-pill, 9999px);
  }

  /*
   * === Slots ===
   * 간격은 .base 의 gap 하나가 진다.
   * 종전에는 gap 과 슬롯 margin(0.15em, 약 1.8px)이 **같은 자리에 겹쳐** 있어,
   * 소비자가 --tag-gap 을 0 으로 줘도 1.8px 이 남았고 그 값에는 훅이 없었다.
   * --tag-gap 기본값을 합계(4 + 1.8 = 약 6px)로 올려 흡수했다 — 렌더 간격은 사실상 그대로다.
   */

  /* === Content === */
  .content {
    display: inline-block;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
