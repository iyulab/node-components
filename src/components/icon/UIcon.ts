import { nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";

import { UElement } from "../UElement.js";
import { getDefaultBaseUrl, IconRegistry } from "../../utilities/icons.js";
import { styles } from "./UIcon.styles.js";

export type IconLibrary = (string & {})
  | "internal" | "tabler" | "heroicons" | "lucide" | "bootstrap";

/**
 * SVG 아이콘을 이름으로 불러와 표시하는 아이콘 컴포넌트입니다.
 * 
 * @csspart svg - 아이콘의 SVG 요소에 적용됩니다.
 */
@customElement('u-icon')
export class UIcon extends UElement {
  static styles = [ super.styles, styles ];

  /** SVG 콘텐츠를 직접 지정합니다. `name` 속성보다 우선 사용됩니다. */
  @property({ type: String }) src?: string;
  /** 사용할 아이콘 라이브러리 이름을 지정합니다. */
  @property({ type: String }) lib?: IconLibrary;
  /** 사용할 아이콘 이름을 지정합니다. */
  @property({ type: String }) name?: string;

  render() {
    if (this.src) {
      return until(fetch(this.src).then(r => r.text()).then(html => {
        return html ? unsafeHTML(this.sanitize(html)) : nothing;
      }), nothing);
    }
    if (this.name) {
      return until(this.resolve(this.name).then(html => {
        return html ? unsafeHTML(html) : nothing;
      }), nothing);
    }
    return nothing;
  }

  private async resolve(name: string): Promise<string | undefined> {
    let html: string | undefined = undefined;
    if (this.lib) {
      html = await IconRegistry.resolve(this.lib, name);
    } else {
      try {
        const baseUrl = getDefaultBaseUrl();
        const url = `${baseUrl.replace(/\/$/, '')}/${name}.svg`;
        const response = await fetch(url);
        if (response.ok) {
          html = await response.text();
        }
      } catch (error) {
        console.error(error); // eslint-disable-line no-console
      }
    }

    return this.sanitize(html);
  }

  private sanitize(html?: string): string | undefined {
    if (!html) return undefined;
    const trimmed = html.trim();

    try {
      const doc = new DOMParser().parseFromString(trimmed, "image/svg+xml");
      if (doc.querySelector("parsererror")) return undefined;

      const svg = doc.documentElement;
      if (svg?.tagName.toLowerCase() !== "svg") return undefined;

      svg.setAttribute("part", "svg");

      // stroke 기반 아이콘이 아니면 fill 적용
      if (svg.getAttribute("stroke") !== "currentColor") {
        svg.setAttribute("fill", "currentColor");
      }

      return svg.outerHTML;
    } catch {
      return undefined;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-icon': UIcon;
  }
}