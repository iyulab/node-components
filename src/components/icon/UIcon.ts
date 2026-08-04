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
  /**
   * 이름·URL 이 **해석되지 않을 때** 대신 그릴 SVG 원문.
   *
   * ★**«아이콘이 안 보인다»가 «자리 자체가 사라진다»가 되는 곳이 있다.** 사이드바가 접히면
   * 라벨이 숨고 아이콘만 남는데, 그 아이콘이 해석에 실패하면 그 메뉴는 **누를 것이 없는
   * 빈 줄**이 된다 — 이름이 잘못됐는지, 파일이 없는지, 아이콘을 안 준 것인지 화면에서
   * 구분되지 않고 **탐색 수단이 통째로 사라진다.**
   *
   * ⇒ 그런 자리는 «없으면 안 그린다»가 아니라 **«없으면 대신 그린다»** 여야 한다.
   * 해석 실패는 `name` 미지정 · 파일 없음(404) · SVG 파싱 실패를 **모두** 포함한다.
   *
   * ⚠소비자가 주는 값은 `sanitize()` 를 거친다(`name` 경로와 같은 처리).
   */
  @property({ type: String }) fallback?: string;

  render() {
    if (this.src) {
      // IconRegistry.resolveUrl이 캐싱/dedupe를 담당 — 재렌더·재마운트 시 같은 URL을 다시 fetch하지 않는다.
      return until(IconRegistry.resolveUrl(this.src).then(html => {
        return this.paint(this.sanitize(html));
      }), nothing);
    }
    if (this.name) {
      return until(this.resolve(this.name).then(html => this.paint(html)), nothing);
    }
    return this.paint(undefined);
  }

  /** 해석 결과가 없으면 `fallback` 으로 대신한다. 둘 다 없을 때만 아무것도 그리지 않는다. */
  private paint(html?: string) {
    const resolved = html ?? this.sanitize(this.fallback);
    return resolved ? unsafeHTML(resolved) : nothing;
  }

  private async resolve(name: string): Promise<string | undefined> {
    let html: string | undefined = undefined;
    if (this.lib) {
      html = await IconRegistry.resolve(this.lib, name);
    } else {
      const baseUrl = getDefaultBaseUrl();
      const url = `${baseUrl.replace(/\/$/, '')}/${name}.svg`;
      html = await IconRegistry.resolveUrl(url);
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