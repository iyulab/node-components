import { nothing } from "lit";
import { property } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";

import { BaseElement } from "../BaseElement.js";
import { icons } from "../../utilities/icons.js";
import { styles } from "./Icon.styles.js";

export type IconLibrary = "internal" | "default" | (string & {});

/**
 * 아이콘 컴포넌트입니다. SVG 아이콘을 이름으로 불러와서 렌더링합니다.
 */
export class Icon extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /**
   * 사용할 아이콘 라이브러리를 지정합니다.
   * - 기본 내장 라이브러리: `internal`, `default`
   * - 사용자 확장 라이브러리: `icons.register()`로 등록한 라이브러리 이름
   * 
   * @default "default"
   */
  @property({ type: String })
  lib: IconLibrary  = "default";

  /**
   * 사용할 아이콘의 이름을 지정합니다.
   */
  @property({ type: String })
  name?: string;

  render() {
    if (!this.lib || !this.name) return nothing;

    return until(icons.resolve(this.lib, this.name).then(html => {
      return this.validate(html)
        ? unsafeHTML(html)
        : nothing;
    }), nothing);
  }

  /**
   * SVG 콘텐츠가 유효한 HTML인지 검사합니다.
   */
  private validate(html?: string): boolean {
    if (!html) return false;
    const trimmed = html.trim();

    try {
      const doc = new DOMParser().parseFromString(trimmed, "image/svg+xml");
      if (doc.querySelector("parsererror")) return false;
      return doc.documentElement?.tagName.toLowerCase() === "svg";
    } catch {
      return false;
    }
  }
}
