import { LitElement, html, nothing  } from 'lit';
import { customElement, property, } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { until } from "lit/directives/until.js";
import { convertReact } from "../../utils";

import { UIconModel, type UIconType } from "./UIcon.model";
import { UIconController } from "./UIconController";
import { SystemIcon } from "./UIcon.resource";
import { styles } from './UIcon.styles';

@customElement('u-icon')
export class UIconElement extends LitElement implements UIconModel {

  @property({ type: String }) type: UIconType = 'default';
  @property({ type: String }) name?: string;
  @property({ type: String }) size?: string;
  @property({ type: String }) color?: string;

  protected async updated(changedProperties: any) {
    super.updated(changedProperties);
    await this.updateComplete;

    if (changedProperties.has('size')) {
      this.style.fontSize = this.size ?? '16px';
    }
    if (changedProperties.has('color')) {
      this.style.color = this.color ?? 'currentColor';
    }
  }

  render() {
    if(!this.name) return nothing;

    if(this.type === 'system') {
      return this.renderSystemIcon(this.name);
    } else if(this.type === 'default') {
      return html`${until(this.renderDefaultIcon(this.name), nothing)}`;
    } else if(UIconController.renderers.has(this.type)) {
      const renderer = UIconController.renderers.get(this.type);
      return html`${until(renderer?.(this.name), nothing)}`;
    } else {
      return nothing;
    }
  }

  private renderSystemIcon(name: string) {
    const vector = SystemIcon[name];
    if(!vector) return nothing;
    return html`
      <svg viewBox="${vector.viewBox || '0 0 16 16'}">
        <path d=${vector.path}></path>
      </svg>
    `;
  }

  private async renderDefaultIcon (name: string) {
    const basePath = UIconController.basePath;
    const fullPath = `${basePath.endsWith('/') ? basePath.slice(0, -1) : basePath}/${name}.svg`;
    const result = await fetch(fullPath);
    const content = await result.text();
    return content.startsWith('<svg') ? unsafeHTML(content) : nothing;
  }
  
  static styles = [styles];

}

export const UIcon = convertReact({
  elementClass: UIconElement,
  tagName: 'u-icon',
});