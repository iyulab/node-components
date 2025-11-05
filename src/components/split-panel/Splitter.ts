import { html } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import type { PanelOrientation } from "./SplitPanel.types.js";
import { styles } from "./Splitter.styles.js";

/**
 * Splitter 컴포넌트는 SplitPanel의 패널들 사이에 배치되는 디바이더입니다.
 * 사용자가 드래그하여 패널의 크기를 조절할 수 있습니다.
 */
export class Splitter extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 드래그 중인지 여부를 나타냅니다. */
  @state() dragging = false;
  
  /** 분할 방향을 설정합니다. */
  @property({ type: String, reflect: true }) orientation: PanelOrientation = 'horizontal';

  render() {
    return html`
      <div class="handler" ?dragging=${this.dragging}></div>
    `;
  }

  /** 스플리터의 크기를 반환합니다. */
  public get size(): number {
    const sizeStr = getComputedStyle(this).getPropertyValue('--splitter-size').trim();
    return parseFloat(sizeStr) || 2;
  }
}