import { html } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { styles } from './ContextMenu.styles.js';

export class ContextMenu extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};
  
  @state() posX?: number;
  @state() posY?: number;

  @property({ type: Boolean, reflect: true }) open: boolean = false;
  @property({ type: Array }) bounds: HTMLElement[] = [];
  @property({ type: Boolean }) hideOnClick: boolean = false;

  protected async firstUpdated(changedProperties: any) {
    super.firstUpdated(changedProperties);
    await this.updateComplete;
    this.setEvents();
  }

  disconnectedCallback() {
    this.disposeEvents();
    super.disconnectedCallback();
  }

  render() {
    return html`<slot></slot>`;
  }

  public toggle() {
    this.open = !this.open;
  }

  public show() {
    this.open = true;
  }

  public hide = () => {
    this.open = false;
  }

  // 컨텍스트 메뉴 표시 이벤트
  private handleShowContext = (event: MouseEvent) => {
    event.preventDefault(); // 기본 컨텍스트 메뉴를 방지
    this.posX = event.offsetX;
    this.posY = event.offsetY;
    this.style.left = `${this.posX}px`;
    this.style.top = `${this.posY}px`;
    this.open = true;
  }

  // 컨텍스트 메뉴 숨김 이벤트(컨텍스트 메뉴 영역 외 클릭시 숨김)
  private handleHideContext = (event: MouseEvent) => {
    if (event.composedPath().includes(this)) return;
    this.open = false;
  }

  // 이벤트 등록
  private setEvents() {
    // 휠 이벤트 발생시 컨텍스트 메뉴 숨김
    document.addEventListener('wheel', this.hide);

    // 마우스 클릭 이벤트 발생시 컨텍스트 메뉴 숨김
    if (this.hideOnClick) {
      document.addEventListener('mousedown', this.hide);
    } else {
      document.addEventListener('mousedown', this.handleHideContext);
    }
    
    // 컨텍스트 메뉴가 발동될 엘리먼트에 이벤트 등록
    if(this.bounds.length === 0) {
      this.parentElement?.addEventListener('contextmenu', this.handleShowContext);
    } else {
      this.bounds.forEach((bound) => {
        console.log(bound);
        bound.addEventListener('contextmenu', this.handleShowContext);
      });
    }
  }

  // 이벤트 해제
  private disposeEvents() {
    document.removeEventListener('wheel', this.hide);

    if (this.hideOnClick) {
      document.removeEventListener('mousedown', this.hide);
    } else {
      document.removeEventListener('mousedown', this.handleHideContext);
    }
    
    if(this.bounds.length === 0) {
      this.parentElement?.removeEventListener('contextmenu', this.handleShowContext);
    } else {
      this.bounds.forEach((bound) => {
        bound.removeEventListener('contextmenu', this.handleShowContext);
      });
    }
  }
}