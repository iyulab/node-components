import { CSSResultGroup, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';

import { computePosition, offset, shift, flip, autoPlacement, autoUpdate } from '@floating-ui/dom';
import type { Placement, VirtualElement } from '@floating-ui/dom';

import { getParentElement, querySelectorFrom } from '../internals/node-helpers.js';
import { BaseElement } from './BaseElement.js';
import { styles } from './FloatingElement.styles.js';

/**
 * FloatingElement는 팝오버, 툴팁 등 화면에 떠 있는 엘리먼트를 구현하기 위한 기본 클래스입니다.
 * 이 클래스를 상속하여 커스텀 팝오버 컴포넌트를 만들 수 있습니다.
 * 
 * 1. for, anchor 속성을 통해 연결될 대상 엘리먼트를 지정할 수 있습니다.
 * 2. visible 속성을 통해 엘리먼트의 표시 여부를 제어할 수 있습니다.
 * 3. strategy, placement, distance 속성을 통해 표시 위치 결정 방식을 설정할 수 있습니다.
 * 4. show() 및 hide() 메서드를 통해 프로그래밍적으로 표시하거나 숨길 수 있습니다.
 */
export class FloatingElement extends BaseElement {
  /** 기본 스타일을 정의합니다. */
  static styles: CSSResultGroup = [ super.styles, styles ];
  /** 종속된 컴포넌트를 정의합니다. */
  static dependencies: Record<string, typeof BaseElement> = {};

  // 애니메이션 프레임 아이디
  private rafId: number | null = null;
  // 자동 위치 업데이트 정리 함수
  private cleanup: (() => void) | null = null;

  /** 
   * 연결될 대상 엘리먼트 입니다. 지정하지 않으면 부모 엘리먼트를 사용합니다. 
   */
  @state() anchor?: HTMLElement;
  
  /** 
   * 현재 엘리먼트가 보여지는지 여부입니다. 
   */
  @property({ type: Boolean, reflect: true }) visible: boolean = false;

  /** 
   * 현재 엘리먼트의 위치 결정 전략입니다.
   * 
   * @remarks
   * - `absolute`: 엘리먼트가 문서 흐름에 따라 배치됩니다.
   * - `fixed`: 엘리먼트가 뷰포트에 고정되어 스크롤과 무관하게 위치합니다. 
   */
  @property({ type: String, reflect: true }) strategy: 'absolute' | 'fixed' = 'absolute';

  /** 
   * 앵커 엘리먼트를 찾기 위한 CSS 선택자입니다. querySelector를 사용하여 DOM에서 대상을 검색합니다.
   * 
   * @example
   * - `id`로 찾기: for="#target-id"
   * - `class`로 찾기: for=".target-class"
   * - `태그명`으로 찾기: for="target-tag-name"
   * - `속성`으로 찾기: for="[data-role='target']"
   */
  @property({ type: String }) for?: string;

  /** 
   * 대상 엘리먼트로부터의 배치 위치입니다.
   * 지정하지 않으면 `floating-ui`의 `autoPlacement`가 적용됩니다.
   */
  @property({ type: String }) placement?: Placement;
  
  /** 
   * 대상 엘리먼트로부터의 거리 (px) 입니다. 
   * 
   * @default 0
   */
  @property({ type: Number }) distance: number = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.anchor ||= getParentElement(this); // 기본(부모 엘리먼트)
  }

  disconnectedCallback(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    this.autoPosition(false);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    // for 변경 시 DOM 에서 앵커 재검색
    if (changedProperties.has('for')) {
      const founded = this.for ? querySelectorFrom(this, this.for) : undefined;
      this.anchor = founded || undefined;
    }
  }

  /** 
   * 현재 엘리먼트를 표시합니다.
   * 
   * @param anchor - 위치 계산에 사용할 앵커 엘리먼트입니다. 지정하지 않으면 this.anchor 가 사용됩니다.
   */
  public async show(anchor?: Element | VirtualElement) {
    anchor ||= this.anchor;
    if (!anchor) return;
    
    await this.updateComplete;
    await this.reposition(anchor);
    this.autoPosition(true);
    this.scheduleVisible(true);
  };

  /** 
   * 현재 엘리먼트를 숨깁니다.
   */
  public async hide() {
    await this.updateComplete;
    this.autoPosition(false);
    this.scheduleVisible(false);
  };
  
  /** 
   * `floating-ui` 를 이용하여 위치를 계산하고 style 을 적용합니다. 
   * 
   * @param target - 위치 계산에 사용할 앵커 엘리먼트입니다.
   */
  protected async reposition(target: Element | VirtualElement) {
    const middleware = [
      offset({ mainAxis: this.distance }),
      shift(),
      flip()
    ];

    if (!this.placement) {
      middleware.push(autoPlacement());
    }

    const position = await computePosition(target, this, {
      strategy: this.strategy,
      placement: this.placement,
      middleware: middleware,
    });

    Object.assign(this.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,

      // placement 에 따라 transform-origin 값을 결정합니다.
      transformOrigin: (() => {
        switch (position.placement) {
          case 'top':
          case 'top-start':
          case 'top-end':
            return 'center bottom';
          case 'bottom':
          case 'bottom-start':
          case 'bottom-end':
            return 'center top';
          case 'left':
          case 'left-start':
          case 'left-end':
            return 'right center';
          case 'right':
          case 'right-start':
          case 'right-end':
            return 'left center';
          default:
            return 'center';
        }
      })()
    });
  }

  /**
   * 자동 위치 업데이트를 설정하거나 해제합니다.
   * 
   * @param enable - 자동 위치 업데이트 활성화 여부
   */
  protected autoPosition(enable: boolean) {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
    if (enable && this.anchor) {
      this.cleanup = autoUpdate(this.anchor, this, () => {
        this.reposition(this.anchor!);
      });
    }
  }

  /** 애니메이션 프레임을 사용하여 표시 상태를 스케줄링합니다. */
  private scheduleVisible(visible: boolean) {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.rafId = requestAnimationFrame(() => {
      this.visible = visible;
      this.rafId = null;
    });
  }
}