import { html, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";

import { arrayAttrConverter } from "../../utilities/converters.js";
import { Locale } from "../../utilities/Locale.js";
import { UElement } from "../UElement.js";
import { styles } from "./USplitPanel.styles.js";
import { type ShiftEventDetail } from "../../events/ShiftEvent.js";

/**
 * 두 패널을 분할하고 크기를 조절할 수 있는 레이아웃 컴포넌트입니다.
 *
 * @slot - 분할된 패널 요소들
 * @slot splitter - 핸들(스플리터) UI
 *
 * @cssprop --splitter-size - 보이는 구분선 두께 (default: 4px)
 * @cssprop --splitter-hit-size - 포인터를 받는 핸들 영역의 두께 — 레이아웃 공간을 차지하므로 패널을
 *   가리지 않는다. 실제 핸들 두께는 이 값과 `--splitter-size` 중 큰 쪽 (default: 24px — WCAG 2.5.8)
 * @cssprop --splitter-color - 스플리터 색상
 * @cssprop --splitter-color-hover - 스플리터 호버 색상
 * @cssprop --splitter-color-active - 스플리터 활성 색상
 *
 * @event shift-start - 구분선 이동 시작 시 발생
 * @event shift - 구분선 이동 중 발생
 * @event shift-end - 구분선 이동 완료 시 발생 (포인터·키보드 공통)
 *
 * 키보드(WAI-ARIA APG «Window Splitter»): 분할 핸들은 `role="separator"` 로 포커스를 받는다.
 * 방향키(가로 배치는 ←/→, 세로 배치는 ↑/↓)로 앞 패널을 줄이거나 늘리고, Home/End 는 앞 패널을
 * 최소/최대로, Enter 는 앞 패널을 접거나 접기 전 크기로 되돌린다. 키 입력 한 번은 하나의 완결된
 * 이동이라 `shift-start`·`shift`·`shift-end` 를 연달아 낸다 — 비율을 저장하는 소비자는 포인터든
 * 키보드든 `shift-end` 하나만 들으면 된다.
 */
@customElement('u-split-panel')
export class USplitPanel extends UElement {
  static styles = [super.styles, styles];

  /** 리사이즈 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 분할 방향 */
  @property({ type: String, reflect: true }) orientation: 'horizontal' | 'vertical' = "horizontal";
  /** 가상 스플리터를 보여주면서 마우스 놓을 지점에 업데이트 */
  @property({ type: Boolean, reflect: true }) lazy = false;
  /** 기본(초기) 패널 비율 */
  @property({
    type: Array,
    reflect: true,
    attribute: 'default-ratio',
    converter: arrayAttrConverter(parseFloat)
  })
  defaultRatio: number[] = [];
  /** 현재 패널 크기 비율 상태 */
  @property({
    type: Array,
    reflect: true,
    converter: arrayAttrConverter(parseFloat)
  })
  ratio: number[] = [];

  @query('.splitter-ghost') private ghost?: HTMLElement;

  private panels: HTMLElement[] = [];
  private splitter?: Node;
  /** Enter 로 접은 핸들별 «접기 전 앞 패널 비율» — 다시 Enter 를 누르면 여기로 돌아간다. */
  private collapsedFrom = new Map<number, number>();
  private dragState = {
    index: -1,
    startPoint: 0,
    availableSize: 0,
    percentages: [] as number[],
    ghostDelta: 0,
  };

  private get percentages(): number[] {
    // 숫자가 아닌 값(예: `default-ratio="[30,70]"` → `[NaN, 70]`)이 섞인 비율은 쓰지 않는다 —
    // 그대로 쓰면 `calc(NaN% …)` 가 무효가 되어 패널 크기가 통째로 무너진다.
    const usable = (r: number[]) =>
      r.length === this.panels.length && r.every((v) => Number.isFinite(v) && v >= 0) && r.some((v) => v > 0);
    const source = usable(this.ratio) ? this.ratio
      : usable(this.defaultRatio) ? this.defaultRatio
      : [];

    if (source.length === this.panels.length) {
      const total = source.reduce((sum, s) => sum + s, 0);
      return source.map(s => (s / total) * 100);
    }
    const equals = 100 / this.panels.length;
    return this.panels.map(() => equals);
  }

  /**
   * 핸들 하나가 레이아웃에서 차지하는 두께(px). 렌더된 핸들을 재는 것이 정본이다 — CSS 가
   * `max(--splitter-size, --splitter-hit-size)` 로 정하고 `rem` 등 어떤 단위든 올 수 있다.
   * 아직 렌더되지 않았거나 숨겨져 0 이면 두 변수를 읽어 같은 규칙을 흉내 낸다.
   */
  private get splitterSize(): number {
    const el = this.renderRoot?.querySelector<HTMLElement>('.splitter');
    if (el) {
      const r = el.getBoundingClientRect();
      const measured = this.orientation === 'horizontal' ? r.width : r.height;
      if (measured > 0) return measured;
    }
    const style = getComputedStyle(this);
    const read = (name: string, fallback: number) =>
      parseFloat(style.getPropertyValue(name).trim()) || fallback;
    return Math.max(read('--splitter-size', 4), read('--splitter-hit-size', 24));
  }

  private get splitterCount(): number {
    return Math.max(0, this.panels.length - 1);
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (['orientation','defaultRatio','ratio'].some(k => changedProperties.has(k))) {
      this.updatePanelLayout();
    } else if (changedProperties.has('disabled')) {
      this.syncSplitterAria();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>

      <div class="splitter-ghost"></div>
      <div hidden aria-hidden="true">
        <slot name="splitter" @slotchange=${this.handleSplitterSlotChange}></slot>
      </div>
    `;
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.panels = slot.assignedElements({ flatten: true })
      .filter((el): el is HTMLElement => el instanceof HTMLElement);
    this.appendSplitters();
    this.updatePanelLayout();
  }

  private handleSplitterSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.splitter = slot.assignedNodes({ flatten: true }).at(0);
    this.appendSplitters();
  }

  private appendSplitters() {
    const root = this.renderRoot;
    if (!root) return;

    root.querySelectorAll('.splitter').forEach(el => el.remove());

    const ref = this.ghost ?? null;
    for (let i = 0; i < this.splitterCount; i++) {
      const splitter = this.createSplitter(i);
      root.insertBefore(splitter, ref);
    }
    this.syncSplitterAria();
  }

  private createSplitter(index: number) {
    const el = document.createElement('div');
    el.setAttribute('class', 'splitter');
    el.setAttribute('part', 'splitter');
    el.style.order = String(index * 2 + 1);
    el.dataset.index = String(index);

    if (this.splitter) {
      el.appendChild(this.splitter.cloneNode(true));
    }

    el.setAttribute('role', 'separator');
    el.addEventListener('pointerdown', this.handlePointerDown);
    el.addEventListener('dblclick', this.handleDblClick);
    el.addEventListener('keydown', this.handleKeyDown);

    return el;
  }

  /**
   * 분할 핸들의 접근성 상태 — APG «Window Splitter». 핸들은 명령형으로 만들어 Lit 템플릿 밖에
   * 있으므로, 비율·방향·비활성이 바뀔 때마다 여기서 다시 쓴다.
   *
   * 값은 **앞 패널(primary pane)의 몫**이다. 패널이 셋 이상이면 한 핸들은 이웃한 두 패널 사이만
   * 옮기므로 최대값은 100 이 아니라 그 두 패널의 몫의 합이다.
   */
  private syncSplitterAria() {
    const root = this.renderRoot;
    if (!root) return;
    const p = this.percentages;
    const round = (v: number) => String(Math.round(v * 10) / 10);
    const label = Locale.getValue('resizePanels');
    root.querySelectorAll<HTMLElement>('.splitter').forEach((el) => {
      const i = Number(el.dataset.index);
      el.setAttribute('aria-valuenow', round(p[i] ?? 0));
      el.setAttribute('aria-valuemin', '0');
      el.setAttribute('aria-valuemax', round((p[i] ?? 0) + (p[i + 1] ?? 0)));
      // 분할선은 패널 배치와 수직이다 — 나란히(horizontal) 놓인 패널 사이의 선은 세로다.
      el.setAttribute('aria-orientation', this.orientation === 'horizontal' ? 'vertical' : 'horizontal');
      el.setAttribute('aria-label', label);
      el.tabIndex = this.disabled ? -1 : 0;
      if (this.disabled) el.setAttribute('aria-disabled', 'true');
      else el.removeAttribute('aria-disabled');
      // `aria-controls` 의 IDREF 는 섀도 경계를 넘지 못한다 — 요소 참조 반사로 앞 패널을 가리킨다.
      const reflect = el as HTMLElement & { ariaControlsElements?: Element[] | null };
      if ('ariaControlsElements' in reflect && this.panels[i]) reflect.ariaControlsElements = [this.panels[i]];
    });
  }

  /** 방향키 한 번이 옮기는 앞 패널의 몫(나머지 공간 기준 %). */
  private static readonly KEY_STEP = 5;

  private handleKeyDown = (e: KeyboardEvent) => {
    if (this.disabled) return;
    const i = Number((e.currentTarget as HTMLElement).dataset.index);
    const p = this.percentages;
    if (p[i] === undefined || p[i + 1] === undefined) return;
    const pair = p[i] + p[i + 1];
    const horizontal = this.orientation === 'horizontal';
    // RTL 가로 배치에서는 앞 패널이 오른쪽에 있다 — «←» 는 여전히 «선을 왼쪽으로» 다(APG).
    const rtl = horizontal && getComputedStyle(this).direction === 'rtl';
    const shrink = horizontal ? (rtl ? 'ArrowRight' : 'ArrowLeft') : 'ArrowUp';
    const grow = horizontal ? (rtl ? 'ArrowLeft' : 'ArrowRight') : 'ArrowDown';

    let a: number;
    if (e.key === shrink) a = p[i] - USplitPanel.KEY_STEP;
    else if (e.key === grow) a = p[i] + USplitPanel.KEY_STEP;
    else if (e.key === 'Home') a = 0;
    else if (e.key === 'End') a = pair;
    else if (e.key === 'Enter') {
      const restore = this.collapsedFrom.get(i);
      if (p[i] > 0) {
        this.collapsedFrom.set(i, p[i]);
        a = 0;
      } else {
        a = restore ?? pair / 2;
        this.collapsedFrom.delete(i);
      }
    } else return;

    e.preventDefault();
    // 키 입력은 깨끗한 값에 떨어져야 한다 — 5 씩 오르내리면 부동소수 오차가 쌓여 `ratio` 에
    // `45.000000000000014` 같은 값이 반영(reflect)된다.
    a = Math.round(Math.min(pair, Math.max(0, a)) * 1e6) / 1e6;
    if (Math.abs(a - p[i]) < 1e-6) return;
    if (e.key !== 'Enter') this.collapsedFrom.delete(i);

    const next = [...p];
    next[i] = a;
    next[i + 1] = pair - a;
    // 이벤트명은 리터럴로 둔다 — React 래퍼의 이벤트 수집이 소스를 정적으로 읽는다.
    const init = (ratio: number[]) => ({ bubbles: false, composed: false, detail: { index: i, ratio: [...ratio] } });
    this.fire<ShiftEventDetail>('shift-start', init(p));
    this.ratio = next;
    this.updatePanelLayout();
    this.fire<ShiftEventDetail>('shift', init(next));
    this.fire<ShiftEventDetail>('shift-end', init(next));
  }

  private updatePanelLayout() {
    if (this.panels.length === 0) return;
    const dim = this.orientation === 'horizontal' ? 'width' : 'height';
    const otherDim = this.orientation === 'horizontal' ? 'height' : 'width';
    const percentages = this.percentages;

    this.panels.forEach((panel, index) => {
      panel.style[dim] = this.panelSize(percentages[index]);
      panel.style[otherDim] = '';
      panel.style.order = String(index * 2);
      panel.style.boxSizing = 'border-box';
      panel.style.flexShrink = '0';
      panel.style.overflow = 'auto';
    });
    this.syncSplitterAria();
  }

  private handleDblClick = () => {
    if (this.disabled) return;
    this.ratio = this.defaultRatio.length === this.panels.length ? [...this.defaultRatio] : [];
    this.updatePanelLayout();
  }

  private handlePointerDown = (e: PointerEvent) => {
    if (e.button !== 0 || this.disabled) return;
    e.preventDefault();

    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    target.addEventListener('pointermove', this.handlePointerMove);
    target.addEventListener('pointerup', this.handlePointerUp);
    target.addEventListener('pointercancel', this.handlePointerUp);

    const hostRect = this.getBoundingClientRect();
    const containerSize = this.orientation === 'horizontal' ? hostRect.width : hostRect.height;
    const splitterRect = target.getBoundingClientRect();
    const splitterPos = this.orientation === 'horizontal'
      ? splitterRect.left - hostRect.left
      : splitterRect.top - hostRect.top;

    this.dragState = {
      index: parseInt(target.dataset.index || '-1'),
      startPoint: this.orientation === 'horizontal' ? e.clientX : e.clientY,
      availableSize: containerSize - this.splitterSize * this.splitterCount,
      percentages: this.percentages,
      ghostDelta: 0,
    };

    if (this.lazy && this.ghost) {
      this.ghost.style.left = '';
      this.ghost.style.top = '';
      this.ghost.style.transform = '';
      const prop = this.orientation === 'horizontal' ? 'left' : 'top';
      this.ghost.style[prop] = `${splitterPos}px`;
      this.ghost.setAttribute('active', '');
    }

    document.body.style.userSelect = 'none';
    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';

    this.fire<ShiftEventDetail>('shift-start', {
      bubbles: false,
      composed: false,
      detail: {
        index: this.dragState.index,
        ratio: [...this.percentages],
      }
    });
  }

  private handlePointerMove = (e: PointerEvent) => {
    e.preventDefault();

    const current = this.orientation === 'horizontal' ? e.clientX : e.clientY;
    const deltaPixel = current - this.dragState.startPoint;
    const deltaPercent = (deltaPixel / this.dragState.availableSize) * 100;
    const aIdx = this.dragState.index;
    const bIdx = aIdx + 1;

    if (this.lazy && this.ghost) {
      const maxDelta = (this.dragState.percentages[bIdx] / 100) * this.dragState.availableSize;
      const minDelta = -(this.dragState.percentages[aIdx] / 100) * this.dragState.availableSize;
      this.dragState.ghostDelta = Math.max(minDelta, Math.min(maxDelta, deltaPixel));
      const axis = this.orientation === 'horizontal' ? 'X' : 'Y';
      this.ghost.style.transform = `translate${axis}(${this.dragState.ghostDelta}px)`;
    } else {
      const [aPercent, bPercent] = this.clampPair(
        this.dragState.percentages[aIdx] + deltaPercent,
        this.dragState.percentages[bIdx] - deltaPercent,
      );
      const dim = this.orientation === 'horizontal' ? 'width' : 'height';
      this.panels[aIdx].style[dim] = this.panelSize(aPercent);
      this.panels[bIdx].style[dim] = this.panelSize(bPercent);
      const newRatio = [...this.dragState.percentages];
      newRatio[aIdx] = aPercent;
      newRatio[bIdx] = bPercent;
      this.ratio = newRatio;
    }

    this.fire<ShiftEventDetail>('shift', {
      bubbles: false,
      composed: false,
      detail: {
        index: this.dragState.index,
        ratio: this.lazy ? this.percentages : [...this.ratio],
      }
    });
  }

  private handlePointerUp = (e: PointerEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    target.removeEventListener('pointermove', this.handlePointerMove);
    target.removeEventListener('pointerup', this.handlePointerUp);
    target.removeEventListener('pointercancel', this.handlePointerUp);

    if (this.lazy && this.ghost) {
      this.ghost.removeAttribute('active');
      this.ghost.style.transform = '';

      const deltaPercent = (this.dragState.ghostDelta / this.dragState.availableSize) * 100;
      const aIdx = this.dragState.index;
      const bIdx = aIdx + 1;
      const newRatio = [...this.dragState.percentages];
      const [a, b] = this.clampPair(newRatio[aIdx] + deltaPercent, newRatio[bIdx] - deltaPercent);
      newRatio[aIdx] = a;
      newRatio[bIdx] = b;
      this.ratio = newRatio;
      this.updatePanelLayout();
    }

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    this.fire<ShiftEventDetail>('shift-end', {
      bubbles: false,
      composed: false,
      detail: {
        index: this.dragState.index,
        ratio: [...this.percentages],
      }
    });
  }

  /**
   * 패널 하나의 크기 — 비율은 «핸들을 뺀 나머지 공간»에 대한 몫이다.
   *
   * 🔴각 패널은 핸들 전체 두께 중 **자기 비율만큼**을 뺀다. 종전에는 핸들 몫을 패널 수로 똑같이
   * 나눠 뺐는데(`p% - 핸들합/n`), 그 식은 비율이 균등할 때만 «나머지 공간의 p%» 와 같다. 드래그는
   * 이동량을 나머지 공간 기준 비율로 바꾸므로(`availableSize`), 비율이 균등에서 멀어질수록 패널이
   * 포인터보다 더 움직였다 — 핸들이 굵을수록 크게(24px 핸들이면 이동량의 약 9%).
   */
  private panelSize(percent: number): string {
    const handles = this.splitterSize * this.splitterCount;
    return `calc(${percent}% - ${(handles * percent) / 100}px)`;
  }

  private clampPair(aRaw: number, bRaw: number): [number, number] {
    const sum = aRaw + bRaw;
    let a = aRaw, b = bRaw;
    if (a < 0) { a = 0; b = sum; }
    else if (b < 0) { b = 0; a = sum; }
    return [a, b];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-split-panel': USplitPanel;
  }
}
