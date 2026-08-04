import { customElement, property } from "lit/decorators.js";
import { html as staticHtml, literal, StaticValue } from "lit/static-html.js";

import { UElement } from "../UElement.js";
import { styles } from "./UText.styles.js";

export type TextVariant =
  | "display" | "title" | "subtitle" | "body" | "label" | "caption" | "overline";

/** 중립 강조 축. **역할색이 아니다** — 역할색이 필요하면 그것은 별도 축이다. */
export type TextTone = "default" | "weak" | "strong" | "inverse";

/** 제목 단계. 값이 있으면 heading 으로 읽힌다. */
export type TextLevel = 1 | 2 | 3 | 4 | 5 | 6;

const PARAGRAPH = literal`p`;
const HEADINGS: Record<TextLevel, StaticValue> = {
  1: literal`h1`,
  2: literal`h2`,
  3: literal`h3`,
  4: literal`h4`,
  5: literal`h5`,
  6: literal`h6`,
};

/**
 * 의미 타이포그래피 스케일(7단)을 마크업에서 쓰는 자리입니다.
 *
 * 시트는 단마다 **크기·굵기·행간·자간** 네 값을 갖고 있으나, 그 단을 *적용하는* 것이
 * 없어 소비자는 자기 CSS 에서 타이포 토큰을 직접 참조해야 했습니다.
 * 이 컴포넌트는 그 자리를 대신하며, **값을 새로 정의하지 않고 토큰만 읽습니다.**
 *
 * `level` 을 주면 섀도 루트에 실제 `<h1>`~`<h6>` 을 렌더하므로 heading 으로 읽힙니다
 * (슬롯 텍스트가 접근가능 이름이 됩니다). 주지 않으면 `<p>` 입니다.
 *
 * ⚠ 시각 축(`variant`)과 의미 축(`level`)은 **독립**입니다 — 페이지의 두 번째 제목이
 * 시각적으로 가장 클 수 있습니다(`level="2" variant="display"`).
 *
 * @slot - 텍스트 내용
 *
 * @csspart base - 렌더된 `<p>` 또는 `<h1>`~`<h6>` 요소
 */
@customElement('u-text')
export class UText extends UElement {
  static styles = [ super.styles, styles ];

  /** 의미 타이포그래피 단계 */
  @property({ type: String, reflect: true }) variant: TextVariant = 'body';
  /** 중립 강조 축 (역할색이 아니다) */
  @property({ type: String, reflect: true }) tone: TextTone = 'default';
  /** 제목 단계. 지정하면 heading 요소로 렌더된다 */
  @property({ type: Number, reflect: true }) level?: TextLevel;

  protected render() {
    const tag = this.level && HEADINGS[this.level] ? HEADINGS[this.level] : PARAGRAPH;
    return staticHtml`<${tag} class="text" part="base"><slot></slot></${tag}>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-text': UText;
  }
}
