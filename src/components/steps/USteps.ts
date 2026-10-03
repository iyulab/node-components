import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

import { UElement } from "../UElement.js";
import { Locale } from "../../utilities/Locale.js";
import { styles } from "./USteps.styles.js";

/**
 * 단계의 상태.
 * - `complete` 끝난 단계
 * - `current`  지금 단계 (하나)
 * - `hold`     멈춘 단계 — 진행이 막혀 사람의 손이 필요하다
 * - `upcoming` 아직 오지 않은 단계
 */
export type StepStatus = 'complete' | 'current' | 'hold' | 'upcoming';

export interface StepItem {
  /** 단계 이름 */
  label: string;
  /** 이름 옆의 짧은 보조 문구 — 완료 날짜, 담당 등 */
  description?: string;
  /** 지정하면 `current` 로부터의 추론보다 우선한다 */
  status?: StepStatus;
}

/**
 * 진행 단계를 한 줄로 보여 주는 **표시 전용** 컴포넌트입니다(마법사가 아니다 — 단계를 옮기는
 * 동작은 소비자가 옆에 둔다). 여러 트랙(예: 제작·정산)은 인스턴스를 줄지어 둔다.
 *
 * 단계 상태는 `items[].status` 로 주거나, `current`(지금 단계의 번호)만 주면 앞은 `complete`,
 * 뒤는 `upcoming` 으로 정해진다. 상태는 표식 모양으로도 갈린다(색만으로 구분하지 않는다):
 * 완료 = 체크 · 지금 = 굵은 고리 · 보류 = 경고 면 · 예정 = 빈 고리.
 * 보조기기에는 지금 단계를 `aria-current="step"` 으로, 완료·보류를 숨은 글자로 전한다.
 *
 * @csspart base - 바깥 상자
 * @csspart label - 트랙 이름 (`label` 을 줄 때만)
 * @csspart list - 단계 목록(`ol`)
 * @csspart step - 단계 하나 — `step-complete`·`step-current`·`step-hold`·`step-upcoming` 도 함께 붙는다
 * @csspart marker - 단계 표식(고리·체크)
 * @csspart title - 단계 이름
 * @csspart description - 단계 보조 문구
 * @csspart connector - 단계 사이의 선
 *
 * @cssprop --steps-marker-size - 표식 지름 (기본 18px)
 * @cssprop --steps-connector-color - 아직 지나지 않은 연결선 색
 * @cssprop --steps-connector-done-color - 지나온 연결선·완료 표식 색
 * @cssprop --steps-label-width - 트랙 이름 칸 폭 (기본 56px)
 */
@customElement('u-steps')
export class USteps extends UElement {
  static styles = [ super.styles, styles ];

  /** 단계 목록 */
  @property({ attribute: false }) items: StepItem[] = [];
  /** 지금 단계의 번호(0부터). `items[].status` 가 없는 단계의 상태를 여기서 추론한다. */
  @property({ type: Number }) current?: number;
  /** 트랙 이름 — 여러 트랙을 줄지어 둘 때 앞머리에 보인다. 목록의 접근 가능한 이름이기도 하다. */
  @property({ type: String }) label?: string;

  /** 단계의 실효 상태. */
  statusOf(index: number): StepStatus {
    const own = this.items[index]?.status;
    if (own) return own;
    if (this.current === undefined) return 'upcoming';
    if (index < this.current) return 'complete';
    if (index === this.current) return 'current';
    return 'upcoming';
  }

  protected render() {
    const last = this.items.length - 1;
    return html`
      <div class="base" part="base">
        ${this.label ? html`<span class="label" part="label" aria-hidden="true">${this.label}</span>` : nothing}
        <ol class="list" part="list" aria-label=${ifDefined(this.label)}>
          ${this.items.map((item, i) => {
            const status = this.statusOf(i);
            const travelled = i < last && status === 'complete';
            return html`
              <li class="step" part="step step-${status}" data-status=${status}
                aria-current=${ifDefined(status === 'current' ? 'step' : undefined)}>
                <span class="marker" part="marker" aria-hidden="true">${status === 'complete' ? CHECK : nothing}</span>
                <span class="title" part="title">${item.label}</span>
                ${item.description ? html`<span class="description" part="description">${item.description}</span>` : nothing}
                ${status === 'complete' || status === 'hold'
                  ? html`<span class="sr-only">${Locale.getValue(status === 'complete' ? 'stepComplete' : 'stepOnHold')}</span>`
                  : nothing}
              </li>
              ${i < last
                ? html`<li class="connector ${travelled ? 'travelled' : ''}" part="connector" aria-hidden="true"></li>`
                : nothing}
            `;
          })}
        </ol>
      </div>
    `;
  }
}

const CHECK = html`<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.2 5 8.5 9.5 3.5"/></svg>`;

declare global {
  interface HTMLElementTagNameMap {
    'u-steps': USteps;
  }
}
