import { LitElement, html  } from 'lit';
import { customElement, property, query } from 'lit/decorators.js'
import { styles } from './XSplitter.styles';

@customElement('x-splitter')
export class XSplitter extends LitElement {
  
  @query('#host') host!: HTMLElement;
  @query('#thumb') thumb!: HTMLElement;

  @property({ type: String }) orientation: "horizontal" | "vertical" = "horizontal";
  
  private isDragging: boolean = false;
  private initValue: number = 0;
  
  async connectedCallback() {
    super.connectedCallback();
    await this.updateComplete;

    if (this.orientation === 'horizontal') {
      this.style.minWidth = '2px';
      this.style.maxWidth = '2px';
      
      this.host.style.height = '100%';
      this.host.style.width = '2px';

      this.thumb.style.width = '8px';
      this.thumb.style.height = '20px';
      this.thumb.style.top = "calc(50% - 10px)";
      this.thumb.style.left = "-3px";
      this.thumb.style.cursor = "ew-resize";

    } else {
      this.style.minHeight = '2px';
      this.style.maxHeight = '2px';
      
      this.host.style.width = '100%';
      this.host.style.height = '2px';

      this.thumb.style.height = '8px';
      this.thumb.style.width = '20px';
      this.thumb.style.left = "50%";
      this.thumb.style.top = "-3px";
      this.thumb.style.cursor = "ns-resize";
    }

    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.onKeyDown = this.onKeyDown.bind(this);
    
    this.thumb.addEventListener('mousedown', this.onMouseDown);
    document.addEventListener('mousemove', this.onMouseMove);
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('keydown', this.onKeyDown);
  }

  render() {
    return html`
      <div id="host">
        <div id="thumb"></div>
      </div>
    `;
  }

  onMouseDown(e: MouseEvent) {
    this.isDragging = true;
    this.classList.add('dragging');

    this.initValue = this.orientation == 'horizontal'
      ? e.clientX
      : e.clientY;
  }
  
  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;

    if (this.orientation === 'horizontal') {
      const dx = e.clientX - this.initValue;
      this.host.style.left = `${dx}px`;
    } else {
      const dy = e.clientY - this.initValue;
      this.host.style.top = `${dy}px`;
    }
  }
  
  onMouseUp(e: MouseEvent) {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    this.classList.remove('dragging');
    
    if (this.orientation == 'horizontal') {
      this.host.style.left = '0px';
    } else {
      this.host.style.top = '0px';
    }
    
    const distance = this.orientation === 'horizontal'
      ? e.clientX - this.initValue
      : e.clientY - this.initValue;

    this.dispatchEvent(new CustomEvent('on-dragged', {
      detail: distance
    }));
  }
  
  onKeyDown(e: KeyboardEvent) {
    if (!this.isDragging) return;
    
    if (e.key == 'Escape') {
      this.isDragging = false;
      this.classList.remove('dragging');

      if (this.orientation == 'horizontal') {
        this.host.style.left = '0px';
      } else {
        this.host.style.top = '0px';
      }
    }
  }

  static styles = [styles];
}