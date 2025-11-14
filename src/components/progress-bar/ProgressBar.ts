import { html } from 'lit';
import { property } from 'lit/decorators.js';

import { BaseElement } from '@iyulab/components/dist/components/BaseElement.js';
import { styles } from './ProgressBar.styles.js';

/**
 * ProgressBar 컴포넌트는 진행 상태를 시각적으로 표시합니다.
 * 로딩 상태나 작업 진행률을 표시하는데 사용됩니다.
 */
export class ProgressBar extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 불확정 상태 (로딩 애니메이션 표시) */
  @property({ type: Boolean, reflect: true }) indeterminate = false;
  /** 최소값 (기본값: 0) */
  @property({ type: Number }) minValue = 0;
  /** 최대값 (기본값: 100) */
  @property({ type: Number }) maxValue = 100;
  /** 현재값 */
  @property({ type: Number }) value = 0;

  // 내부 이전값 추적 (null은 indeterminate 또는 미설정 상태)
  private _prevValue: number | null = 0;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'progressbar');

    // 초기 aria 값 설정
    this.setAttribute('aria-valuemin', String(this.minValue));
    this.setAttribute('aria-valuemax', String(this.maxValue));
    if (!this.indeterminate) {
      this.setAttribute('aria-valuenow', String(this.value));
    }

    // 초기 내부값 준비
    this._prevValue = this.value ?? this.minValue;
    // 초기 스타일 보정 (초기 렌더링 때)
    const clamped = Math.min(Math.max(this.value, this.minValue), this.maxValue);
    const progress = (clamped - this.minValue) / Math.max(1, (this.maxValue - this.minValue));
    this.style.transform = `scaleX(${progress})`;
    this.style.opacity = this.value >= this.maxValue ? '0' : '1';
  }

  protected updated(changedProperties: Map<string, unknown>): void {
    super.updated(changedProperties);

    if (changedProperties.has('minValue')) {
      this.setAttribute('aria-valuemin', String(this.minValue));
      // min/max 변경 시 내부 prev 보정 (안정성)
      if (this._prevValue === null) {
        this._prevValue = this.minValue;
      }
    }
    if (changedProperties.has('maxValue')) {
      this.setAttribute('aria-valuemax', String(this.maxValue));
    }

    if (changedProperties.has('indeterminate')) {
      // indeterminate 속성 변경은 public API와 동일 처리
      if (this.indeterminate) {
        // 진짜 indeterminate로 전환
        this._enterIndeterminate();
      } else {
        // determinate로 전환: aria 정리
        this.removeAttribute('aria-busy');
        if (typeof this._prevValue === 'number') {
          this.setAttribute('aria-valuenow', String(this._prevValue));
        }
      }
    }

    if (changedProperties.has('value')) {
      const prev = (changedProperties.get('value') as number) ?? this._prevValue ?? this.minValue;
      const curr = this.value;
      // 외부에서 value 프로퍼티만 바뀔 때에도 동일 로직 적용
      this._handleValueChange(prev, curr);
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  // -----------------------
  // Public API
  // -----------------------

  /**
   * begin: 완전 초기화 후 이펙트 시작
   * value 가 "indeterminate" 이면 indeterminate 모드 진입
   * value 가 숫자면 0에서부터 해당 값으로 애니메이션
   */
  public begin(value: "indeterminate" | number): void {
    if (value === 'indeterminate') {
      // indeterminate 모드로 전환
      this.indeterminate = true;
      this._prevValue = null;
      this._enterIndeterminate();
      return;
    }

    // determinate 초기화: 트랜지션을 잠시 끄고 즉시 scaleX(0)로 세팅 -> 이후 애니메이션으로 자연스럽게 오른쪽으로 채움
    this.indeterminate = false;
    // aria 준비
    this.setAttribute('aria-valuemin', String(this.minValue));
    this.setAttribute('aria-valuemax', String(this.maxValue));
    this.removeAttribute('aria-busy');

    // 즉시 리셋 (transition 방지)
    const originalTransition = this.style.transition;
    this.style.transition = 'none';
    this.style.opacity = '1';
    this.style.transform = `scaleX(0)`;

    // 강제 reflow 후 transition 해제하고 애니메이션 시작
    // requestAnimationFrame 사용하여 브라우저가 스타일 적용을 처리하도록 함
    // 이후 update()로 실제 목표값으로 애니메이션
    // prevValue는 minValue(초기 상태)로 설정
    this._prevValue = this.minValue;

    // 다음 frame에서 transition을 복원하고 업데이트 수행
    requestAnimationFrame(() => {
      // 인라인 transition 제거(so css의 transition 규칙이 다시 적용됨)
      this.style.transition = originalTransition || '';
      // 실제로 target 값으로 애니메이션 (update 내부에서 처리)
      this.progress(value);
    });
  }

  /**
   * update: 외부/내부에서 진행률을 업데이트할 때 사용
   * "indeterminate" 또는 숫자 가능
   */
  public progress(value: "indeterminate" | number): void {
    if (value === 'indeterminate') {
      // 이미 indeterminate이면 무시
      if (this.indeterminate) return;
      this.begin('indeterminate');
      return;
    }

    const newVal = Number(value);
    if (isNaN(newVal)) return;

    // indeterminate에서 determinate로 넘어오는 경우
    if (this.indeterminate) {
      this.indeterminate = false;
      this.removeAttribute('aria-busy');
      // prev 는 minValue로 간주 (안전)
      this._prevValue = this._prevValue === null ? this.minValue : this._prevValue;
    }

    const prev = typeof this._prevValue === 'number' ? this._prevValue : this.minValue;

    // 동일 값이면 무시
    if (newVal === prev) return;

    // 이전보다 작다면(감소) : 감소 애니메이션 없이 begin() 후 증가
    if (prev > newVal) {
      this.begin(newVal);
      return;
    }

    // 이전보다 크다면 증가 애니메이션
    this._applyProgress(newVal);

    // aria
    this.setAttribute('aria-valuenow', String(newVal));

    // max 도달 시 done 호출
    if (newVal >= this.maxValue) {
      // 약간의 여유를 두고 done 실행 (transition이 끝난 뒤 자연스럽게 처리)
      const transitionDuration = 300; // CSS와 맞춘 값(0.3s)
      setTimeout(() => this.done(), transitionDuration + 20);
    }

    // 내부 prev 갱신
    this._prevValue = newVal;
  }

  /**
   * done: 완전 채움 후 서서히 사라짐 시작
   */
  public done(): void {
    // indeterminate 상태라면 먼저 determinate로 전환
    if (this.indeterminate) {
      this.indeterminate = false;
      this.removeAttribute('aria-busy');
    }

    // 강제로 최대치로 채움 (aria 정리)
    const clampedMax = this.maxValue;
    this._applyProgress(clampedMax);
    this.setAttribute('aria-valuenow', String(clampedMax));
    this._prevValue = clampedMax;

    // 서서히 사라지게 처리 (opacity -> 0)
    // CSS transition(0.3s)과 맞춰서 지연 처리
    setTimeout(() => {
      this.style.opacity = '0';
      // aria값은 필요 시 제거
      this.removeAttribute('aria-valuenow');
    }, 300);
  }

  // -----------------------
  // 내부 헬퍼
  // -----------------------

  // indeterminate 내부 진입 처리
  private _enterIndeterminate() {
    // aria
    this.setAttribute('aria-busy', 'true');
    this.removeAttribute('aria-valuenow');
    // 스타일은 CSS의 @keyframes 에 의해 동작 (host [indeterminate] 셀렉터)
    // 단, ensure opacity/transform 초기화
    this.style.opacity = '1';
    this.style.transform = 'translateX(-100%)'; // indeterminate 애니메이션 시작 위치에 맞춰서
  }

  // determinate 값을 화면에 적용 (increase 시에만 자연스럽게 동작)
  private _applyProgress(targetValue: number) {
    // 클램프
    const clamped = Math.min(Math.max(targetValue, this.minValue), this.maxValue);
    const denom = (this.maxValue - this.minValue) || 1;
    const progress = (clamped - this.minValue) / denom;

    // ensure determinate mode
    this.indeterminate = false;
    this.removeAttribute('aria-busy');

    // 보이도록 유지
    this.style.opacity = '1';

    // transform으로 채움 (CSS의 transition 규칙에 따라 애니메이션 됨)
    // 직접 감소 애니메이션을 만들지 않기 때문에 호출 전에는 prev <= target 인 것을 보장해야 함
    this.style.transform = `scaleX(${progress})`;
  }

  // updated() 등에서 이전->현재를 처리할 때 재사용하는 함수
  private _handleValueChange(prev: number | undefined, curr: number) {
    const prevVal = typeof prev === 'number' ? prev : (typeof this._prevValue === 'number' ? this._prevValue : this.minValue);
    if (curr === prevVal) return;

    if (curr === Number.POSITIVE_INFINITY) return;

    if (prevVal > curr) {
      // 감소: 처음부터 다시 시작
      this.begin(curr);
      return;
    } else {
      // 증가
      this._applyProgress(curr);
      this.setAttribute('aria-valuenow', String(curr));
      if (curr >= this.maxValue) {
        setTimeout(() => this.done(), 320);
      }
      this._prevValue = curr;
    }
  }
}