import { css } from "lit";

export const styles = css`
  :host {
    --tag-color: var(--u-neutral-800, #424242);
    --tag-bg-color: var(--u-neutral-100, #F5F5F5);
    --tag-border-color: transparent;
  }

  /* ==========================================================================
     역할 축 — 의미 슬롯 매핑
     color="danger" 는 색이 아니라 *"위험"* 을 뜻한다. 장식 축(아래)과 달리 팔레트가 아니라
     **역할 토큰**을 읽으므로 리브랜딩을 따라오고, 대비 계약이 지키는 짝을 물려받는다.

     슬롯이 여섯인 이유는 자리마다 대비 요구가 다르기 때문이다(실측, 두 테마 전건 AA):
       solid    면 --u-{role}-color        + 그 위 글자 --u-{role}-txt-color   (4.60~15.05)
       soft     연한 면 --u-{role}-bg-color + 그 위 글자 --u-{role}-color-strong (4.58~7.00)
       outlined 바탕 위 글자 --u-{role}-color-strong                            (계약 검사 대상)
     ========================================================================== */
  :host([color="primary"]) {
    --tag-hue-solid: var(--u-primary-color, #1976D2);
    --tag-hue-on-solid: var(--u-primary-txt-color, #FFFFFF);
    --tag-hue-line: var(--u-primary-color-weak, #2196F3);
    --tag-hue-surface: var(--u-primary-bg-color, #E3F2FD);
    --tag-hue-text: var(--u-primary-color-strong, #1565C0);
    --tag-hue-text-outlined: var(--u-primary-color-strong, #1565C0);
  }
  :host([color="info"]) {
    --tag-hue-solid: var(--u-info-color, #1976D2);
    --tag-hue-on-solid: var(--u-info-txt-color, #FFFFFF);
    --tag-hue-line: var(--u-info-color-weak, #2196F3);
    --tag-hue-surface: var(--u-info-bg-color, #E3F2FD);
    --tag-hue-text: var(--u-info-color-strong, #1565C0);
    --tag-hue-text-outlined: var(--u-info-color-strong, #1565C0);
  }
  :host([color="success"]) {
    --tag-hue-solid: var(--u-success-color, #2E7D32);
    --tag-hue-on-solid: var(--u-success-txt-color, #FFFFFF);
    --tag-hue-line: var(--u-success-color-weak, #4CAF50);
    --tag-hue-surface: var(--u-success-bg-color, #E8F5E9);
    --tag-hue-text: var(--u-success-color-strong, #1B5E20);
    --tag-hue-text-outlined: var(--u-success-color-strong, #1B5E20);
  }
  :host([color="warning"]) {
    --tag-hue-solid: var(--u-warning-color, #FDD835);
    --tag-hue-on-solid: var(--u-warning-txt-color, #000000);
    --tag-hue-line: var(--u-warning-color-weak, #FFEB3B);
    --tag-hue-surface: var(--u-warning-bg-color, #FFF59D);
    --tag-hue-text: var(--u-warning-color-strong, #8A4A00);
    --tag-hue-text-outlined: var(--u-warning-color-strong, #8A4A00);
  }
  :host([color="danger"]) {
    --tag-hue-solid: var(--u-danger-color, #D32F2F);
    --tag-hue-on-solid: var(--u-danger-txt-color, #FFFFFF);
    --tag-hue-line: var(--u-danger-color-weak, #F44336);
    --tag-hue-surface: var(--u-danger-bg-color, #FFEBEE);
    --tag-hue-text: var(--u-danger-color-strong, #C62828);
    --tag-hue-text-outlined: var(--u-danger-color-strong, #C62828);
  }

  /* ==========================================================================
     장식 축 — 색 슬롯 매핑
     color="purple" 에는 역할 의미가 없다(장식이다). 그래서 역할 토큰이 아니라
     팔레트를 직접 읽으며, 브랜드 오버라이드에 의도적으로 면역이다.
     아래 규칙이 hue 슬롯을 채우고, appearance 규칙이 그것을 소비한다.
     ========================================================================== */
  /* neutral — 무채색(기본). 2.0 전에는 neutral 이 «브랜드 경로»였고 회색 레이블은 장식 축 gray 로만
     낼 수 있었다 — 같은 낱말이 배지·체크박스에서는 회색이라 뜻이 정반대였다. 중립 램프를 읽되 명도 때문에
     두 자리를 한 단 진하게 쓴다: solid 면은 흰 글자 대비로 700, 연한 면은 흰 바탕·올림면과 구별되게 200. */
  :host([color="neutral"]) {
    --tag-hue-solid: var(--u-neutral-700, #616161);
    --tag-hue-line: var(--u-neutral-300, #E0E0E0);
    --tag-hue-surface: var(--u-neutral-200, #EEEEEE);
    --tag-hue-text: var(--u-neutral-800, #424242);
    --tag-hue-text-outlined: var(--u-neutral-700, #616161);
  }
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

  /* solid — 강한 채움 */
  :host([appearance="solid"]) {
    /* 면 위의 글자. 장식 축은 슬롯이 비어 흰색으로 떨어진다(현행 보존) — 역할 축에서만
       갈린다. warning 이 그 이유다: 노란 면 위의 흰 글자는 읽히지 않는다. */
    --tag-color: var(--tag-hue-on-solid, var(--u-neutral-0, #FFFFFF));
    --tag-bg-color: var(--tag-hue-solid);
    --tag-border-color: var(--tag-hue-solid);
  }

  /* soft — 옅은 틴트, 테두리 없음 (기본) */
  :host([appearance="soft"]) {
    --tag-color: var(--tag-hue-text);
    --tag-bg-color: var(--tag-hue-surface);
    --tag-border-color: transparent;
  }

  /* outlined — 테두리만 */
  :host([appearance="outlined"]) {
    --tag-color: var(--tag-hue-text-outlined);
    --tag-bg-color: transparent;
    --tag-border-color: var(--tag-hue-line);
  }

  /* plain — 외형 없음: 색 글자만 */
  :host([appearance="plain"]) {
    --tag-color: var(--tag-hue-text-outlined);
    --tag-bg-color: transparent;
    --tag-border-color: transparent;
  }

  :host {
    display: inline-flex;
    font-size: var(--u-text-caption-size, 12px);
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
  /* 상태 아이콘 — .base 의 gap 이 간격을 정한다. */
  .icon {
    flex-shrink: 0;
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

  /* 앞머리 점 — 글자색을 따른다(역할·장식 축 어느 쪽이든 글자와 같은 색). */
  .dot {
    flex: none;
    width: var(--tag-dot-size, 6px);
    height: var(--tag-dot-size, 6px);
    border-radius: var(--u-radius-circle, 50%);
    background: currentColor;
  }
`;
