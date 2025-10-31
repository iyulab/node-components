import { html } from "lit";
import { property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { UElement } from "../../internals/UElement.js";
import { Spinner } from "../spinner/Spinner.js";
import { Icon } from "../icon/Icon.js";
import { styles } from "./IconButton.styles.js";

/**
 * IconButton 컴포넌트는 아이콘만 표시하는 버튼입니다.
 */
export class IconButton extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-spinner': Spinner,
    'u-icon': Icon
  };

  /** 경계선이 없는 버튼 스타일을 적용합니다. */
  @property({ type: Boolean, reflect: true }) borderless = false;
  /** 버튼이 비활성화 상태인지 여부를 설정합니다. 비활성화된 버튼은 클릭할 수 없습니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 버튼이 로딩 상태인지 여부를 설정합니다. 로딩 중에는 버튼이 비활성화되고 스피너가 표시됩니다. */
  @property({ type: Boolean, reflect: true }) loading = false;
  /** 아이콘을 외부에서 불러와야 하는지 여부를 설정합니다. */
  @property({ type: Boolean }) remote: boolean = false;
  /** 아이콘의 이름을 지정합니다. */
  @property({ type: String }) name?: string;

  render() {
    return html`
      <button part="base" ?disabled=${this.disabled || this.loading}>
        ${this.loading 
          ? html`<u-spinner></u-spinner>` 
          : html`<u-icon ?remote=${this.remote} name=${ifDefined(this.name)}></u-icon>`}
      </button>
    `;
  }
}