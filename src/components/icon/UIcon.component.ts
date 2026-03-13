import { nothing } from "lit";
import { property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";

import { UElement } from "../UElement.js";
import { getDefaultBaseUrl, IconRegistry } from "../../utilities/icons.js";
import { styles } from "./UIcon.styles.js";

export type IconLibrary = (string & {})
 | "internal" | "tabler" | "heroicons" | "lucide" | "bootstrap";

/**
 * 아이콘 컴포넌트입니다. SVG 아이콘을 이름으로 불러와서 렌더링합니다.
 */
export class UIcon extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /**
   * 아이콘의 SVG 콘텐츠를 직접 지정합니다. `name` 속성보다 우선 사용됩니다.
   */
  @property({ type: String }) src?: string;

  /**
   * 사용할 아이콘 라이브러리를 지정합니다.
   */
  @property({ type: String }) lib?: IconLibrary;

  /**
   * 사용할 아이콘의 이름을 지정합니다.
   */
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

  /**
   * 아이콘 이름과 라이브러리를 기반으로 SVG 콘텐츠를 비동기로 가져옵니다.
   * - 라이브러리가 지정된 경우: `IconRegistry`에서 해당 라이브러리와 이름으로 아이콘을 조회합니다.
   * - 라이브러리가 지정되지 않은 경우: 기본 URL에서 `${name}.svg` 파일을 가져옵니다.
   * - 가져온 콘텐츠가 유효한 SVG인지 검증한 후, 유효하면 SVG 콘텐츠를 반환하고 그렇지 않으면 `undefined`를 반환합니다.
   * 
   * @param name 아이콘 이름
   */
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

  /**
   * HTML 문자열의 유효성을 검증하고, SVG를 정제합니다.
   * 
   * @param html HTML 문자열
   * @returns 유효한 SVG 문자열 또는 `undefined`
   */
  private sanitize(html?: string): string | undefined {
    if (!html) return undefined;
    const trimmed = html.trim();

    try {
      const doc = new DOMParser().parseFromString(trimmed, "image/svg+xml");
      if (doc.querySelector("parsererror")) return undefined;

      const svg = doc.documentElement;
      if (svg?.tagName.toLowerCase() !== "svg") return undefined;

      svg.setAttribute("part", "svg");
      return svg.outerHTML;
    } catch {
      return undefined;
    }
  }
}
