import { CSSResultGroup, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';

import { computePosition, offset, shift, flip, autoPlacement, autoUpdate, arrow } from '@floating-ui/dom';
import type { OffsetOptions, Placement, VirtualElement } from '@floating-ui/dom';

import { getParentElement, querySelectorAllWithin } from '../utilities/elements.js';
import { UElement } from './UElement.js';
import { styles } from './UFloatingElement.styles.js';
import { ShowEventDetail } from '../events/ShowEvent.js';
import { HideEventDetail } from '../events/HideEvent.js';

export type FloatingStrategy = 'absolute' | 'fixed';

/**
 * UFloatingElement는 팝오버, 툴팁 등 화면에 떠 있는 엘리먼트를 구현하기 위한 기본 클래스입니다.
 * 이 클래스를 상속하여 커스텀 팝오버 컴포넌트를 만들 수 있습니다.
 * 
 * @event show - 엘리먼트가 표시되기 전에 발생합니다. 이벤트 핸들러에서 false를 반환하면 표시가 취소됩니다.
 * @event hide - 엘리먼트가 숨겨지기 전에 발생합니다. 이벤트 핸들러에서 false를 반환하면 숨김이 취소됩니다.
 */
export class UFloatingElement extends UElement {
  static styles: CSSResultGroup = [ super.styles, styles ];
  
  /** 
   * 현재 엘리먼트가 보여지는지 여부입니다. 
   * 
   * @default false
   */
  @property({ type: Boolean, reflect: true }) open: boolean = false;

  /**
   * 엘리먼트가 비활성화 상태인지 여부입니다.
   * true일 경우 엘리먼트가 표시되지 않고, 앵커와의 상호작용도 발생하지 않습니다.
   * 
   * @default false
   */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;

  /** 
   * 앵커 엘리먼트를 찾기 위한 CSS 선택자입니다. querySelector를 사용하여 DOM에서 대상을 검색합니다.
   * 
   * @remarks
   * - `id`로 찾기: "#target-id"
   * - `class`로 찾기: ".target-class"
   * - `태그명`으로 찾기: "target-tag-name"
   * - `속성`으로 찾기: "[data-role='target']"
   */
  @property({ type: String, reflect: true }) for?: string;

  /** 
   * 현재 엘리먼트의 위치 결정 전략입니다.
   * 
   * @remarks
   * - `absolute`: 엘리먼트가 문서 흐름에 따라 배치됩니다.
   * - `fixed`: 엘리먼트가 뷰포트에 고정되어 스크롤과 무관하게 위치합니다. 
   */
  @property({ type: String }) strategy: FloatingStrategy = 'absolute';

  /** 
   * 대상 엘리먼트로부터의 배치 위치입니다.
   * 지정하지 않으면 자동으로 가장 적절한 위치가 선택됩니다.
   * 
   * @default undefined
   */
  @property({ type: String }) placement?: Placement;

  /**
   * 대상 엘리먼트로부터의 픽셀 단위의 간격입니다.
   * 상세 간격 조정을 위한 { mainAxis, crossAxis } 형태의 객체도 허용합니다.
   * 
   * @default 0
   */
  @property({ type: Number }) offset: OffsetOptions = 0;

  /**
   * 엘리먼트가 화면 안에 머물도록 자동으로 위치를 조정할지 여부입니다.
   * 
   * @default false
   */
  @property({ type: Boolean }) shift: boolean = false;

  /**
   * 화살표를 표시할지 여부입니다. true로 설정하면 화살표 요소가 root 내부에 추가됩니다.
   *
   * @default false
   */
  @property({ type: Boolean }) arrow: boolean = false;


  /** 
   * 엘리먼트가 표시되기 전 지연 시간(ms)입니다. 
   * 
   * @default 0
   */
  @property({ type: Number, attribute: 'show-delay' }) showDelay: number = 0;
  
  /** 
   * 엘리먼트가 숨겨지기 전 지연 시간(ms)입니다.
   *
   * @default 0 
   */
  @property({ type: Number, attribute: 'hide-delay' }) hideDelay: number = 0;

  /** 연결된 엘리먼트 입니다. 기본으로 부모 엘리먼트가 포함됩니다. */
  @state() anchors?: HTMLElement[];

  /** 현재 위치에 연결된 타겟 엘리먼트입니다. */
  protected targetEl?: HTMLElement | VirtualElement;
  /** arrow를 사용할 때 만들어지는 화살표 엘리먼트입니다. */
  protected arrowEl?: HTMLElement;

  // 자동 위치 업데이트 정리 함수
  private cleanup: (() => void) | null = null;
  // 딜레이 타이머
  private showTimer?: number;
  private hideTimer?: number;

  connectedCallback(): void {
    super.connectedCallback();

    if (!this.anchors || this.anchors.length === 0) {
      const parent = getParentElement(this);
      this.anchors = parent ? [parent] : [];
    }
  }

  disconnectedCallback(): void {
    if (this.cleanup !== null) this.cleanup();
    this.cleanup = null;
    clearTimeout(this.showTimer);
    clearTimeout(this.hideTimer);
    this.showTimer = undefined;
    this.hideTimer = undefined;
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    // for 변경시 앵커 엘리먼트 갱신
    if (changedProperties.has('for')) {
      this.anchors = this.getAnchors(this.for);
    }
    // arrow 변경시 화살표 엘리먼트 토글
    if (changedProperties.has('arrow')) {
      this.toggleArrowElement(this.arrow);
    }
  }

  /** 
   * 현재 엘리먼트를 표시합니다.
   * 
   * @param target - 위치 계산에 사용할 타겟 엘리먼트입니다.
   * @returns 표시 성공 여부를 나타내는 Promise입니다.
   */
  public async show(target: Element | VirtualElement): Promise<boolean> {
    if (this.disabled) return false;

    // hide 타이머가 있으면 취소
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
    // 이미 대기 중이면 무시
    if (this.showTimer) return true;
    // 자동 위치 업데이트 정리 
    if (this.cleanup !== null) {
      this.cleanup();
      this.cleanup = null;
    }

    // 위치 계산 및 스타일 적용
    await this.reposition(target);
    this.cleanup = autoUpdate(target, this, () => {
      this.reposition(target);
    });
    this.targetEl = target;
    if (this.open) return true;

    if (this.fire<ShowEventDetail>('show')) {
      // show 딜레이 적용
      if (this.showDelay > 0) {
        this.showTimer = window.setTimeout(() => {
          this.showTimer = undefined;
          this.open = true;
        }, this.showDelay);
      } else {
        this.open = true;
      }
      return true;
    }
    return false;
  };

  /** 
   * 현재 엘리먼트를 숨깁니다.
   * 
   * @returns 숨김 성공 여부를 나타내는 Promise입니다.
   */
  public async hide(): Promise<boolean> {
    if (this.disabled) return false;

    // show 타이머가 있으면 취소
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = undefined;
    }
    // 이미 대기 중이면 무시
    if (this.hideTimer) return true;
    // 자동 위치 업데이트 정리 
    if (this.cleanup !== null) {
      this.cleanup();
      this.cleanup = null;
    }

    // 타겟 엘리먼트 초기화
    await this.updateComplete;
    this.targetEl = undefined;
    if (!this.open) return true;

    if (this.fire<HideEventDetail>('hide')) {
      // hide 딜레이 적용
      if (this.hideDelay > 0) {
        this.hideTimer = window.setTimeout(() => {
          this.hideTimer = undefined;
          this.open = false;
        }, this.hideDelay);
      } else {
        this.open = false;
      }
      return true;
    }
    return false;
  };
  
  /** 
   * `@floating-ui/dom` 를 이용하여 위치를 계산하고 style 을 적용합니다. 
   * 
   * @param target - 위치 계산에 사용할 타겟 엘리먼트입니다.
   */
  public async reposition(target: Element | VirtualElement) {
    const position = await computePosition(target, this, {
      strategy: this.strategy,
      placement: this.placement,
      middleware: [
        offset(this.offset),
        shift({ mainAxis: this.shift }),
        this.placement ? flip() : autoPlacement(),
        ...(this.arrowEl ? [arrow({ element: this.arrowEl })] : []),
      ],
    });

    const side = position.placement.split('-')[0] as 'top' | 'bottom' | 'left' | 'right';
    const sideConfig = {
      top: {
        transform: 'center bottom',
        aside: 'bottom',
        clipPath: 'polygon(0 0, 100% 0, 50% 70%)',
      },
      bottom: {
        transform: 'center top',
        aside: 'top',
        clipPath: 'polygon(50% 30%, 100% 100%, 0 100%)',
      },
      left: {
        transform: 'right center',
        aside: 'right',
        clipPath: 'polygon(0 0, 70% 50%, 0 100%)',
      },
      right: {
        transform: 'left center',
        aside: 'left',
        clipPath: 'polygon(100% 0, 100% 100%, 30% 50%)',
      },
    } as const;
    const config = sideConfig[side];

    Object.assign(this.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
      transformOrigin: config.transform,
    });

    const arrowData = position.middlewareData.arrow;
    if (!this.arrowEl || !arrowData) return;

    Object.assign(this.arrowEl.style, {
      left: arrowData.x != null ? `${arrowData.x}px` : '',
      top: arrowData.y != null ? `${arrowData.y}px` : '',
      right: '',
      bottom: '',
      [config.aside]: `-${this.arrowEl.offsetWidth - 1}px`,
      clipPath: config.clipPath,
    });
  }

  /** 
   * 이벤트에서 사용할 가상 타겟 엘리먼트를 생성합니다. 
   * 
   * @param event - 마우스 이벤트 객체입니다.
   * @returns 가상 타겟 엘리먼트입니다.
   */
  protected createVirtualTarget(event: MouseEvent | PointerEvent): VirtualElement {
    return {
      getBoundingClientRect: () => ({
        width: 0, 
        height: 0,
        x: event.clientX, 
        y: event.clientY,
        top: event.clientY, 
        left: event.clientX,
        right: event.clientX, 
        bottom: event.clientY,
      }),
    };
  }

  /** arrow 속성의 변경에 따라 화살표 요소를 추가 또는 제거하는 메서드입니다. */
  private toggleArrowElement(enabled: boolean) {
    if (enabled) {
      if (this.arrowEl) return;
      this.arrowEl = document.createElement('div');
      this.arrowEl.id = 'arrow';
      this.renderRoot.appendChild(this.arrowEl);
    } else {
      if (!this.arrowEl) return;
      this.renderRoot.removeChild(this.arrowEl);
      this.arrowEl = undefined;
    }
  }

  /** 쿼리 선택자를 사용하여 앵커 엘리먼트를 찾습니다. */
  private getAnchors(selectors?: string) {
    if (selectors) {
      const anchors = querySelectorAllWithin(this, selectors);
      return Array.from(anchors);
    } else {
      const parent = getParentElement(this);
      return parent ? [parent] : [];
    }
  }
}