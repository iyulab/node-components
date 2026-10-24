import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PropertyValues } from "lit";
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
 * - `skipped`  이 건의 경로에 없는 단계 — 지나갔지만 한 일이 없다(예: 시안이 없는 주문의 «시안»)
 */
export type StepStatus = 'complete' | 'current' | 'hold' | 'upcoming' | 'skipped';

/**
 * 단계 줄의 모양 — `line`(표식과 연결선) · `bars`(단계마다 막대, 그 아래 이름과 보조 문구) ·
 * `compact`(단계마다 작은 칸 하나와 지금 단계의 이름 — 표 칸 · 미리보기 · 카드 머리처럼 한 줄 높이에).
 */
export type StepsAppearance = 'line' | 'bars' | 'compact';

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
 * 완료 = 체크 · 지금 = 굵은 고리 · 보류 = 경고 면 · 예정 = 빈 고리 · 건너뜀 = 점선 고리.
 * `appearance="bars"` 면 단계마다 막대가 칸을 고르게 나눠 갖고, 그 아래에 이름과 보조 문구(날짜 등)가 선다 —
 * 지나온 칸과 지금 칸은 채운 막대, 예정 · 건너뜀은 빈 막대, 지금 단계의 이름은 굵게, 보류는 경고 막대.
 * `appearance="compact"` 면 단계마다 작은 칸만 그리고(지나온 칸은 채우고 지금 칸은 주 색, 보류는 경고 칸) 그 옆에 지금
 * 단계의 이름 하나를 쓴다 — 나머지 단계 이름은 화면에서 숨지만 목록에는 남아 보조기기가 전부 읽는다. 지금 단계가 없으면
 * 마지막으로 지나온 단계의 이름을 쓴다.
 * 기본(`line`)은 단계가 자기 폭에 다 들어가지 않으면 세로로 접힌다 — 단계마다 한 줄, 연결선은 표식 아래로. 폭이 다시 넉넉해지면
 * 가로로 돌아온다(단계 수를 CSS 가 알 수 없어 가로 배치의 실제 폭을 재서 가른다).
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
 * @csspart summary - `compact` 에서 칸 옆에 쓰는 지금 단계 이름
 *
 * @cssprop --steps-marker-size - 표식 지름 (기본 18px)
 * @cssprop --steps-connector-color - 아직 지나지 않은 연결선 색
 * @cssprop --steps-connector-done-color - 지나온 연결선·완료 표식 색
 * @cssprop --steps-label-width - 트랙 이름 칸 폭 (기본 56px)
 * @cssprop --steps-bar-height - `bars` 의 막대 두께 (기본 6px)
 * @cssprop --steps-bar-color - `bars` 의 채운 막대 색 (기본 주 색)
 * @cssprop --steps-segment-width - `compact` 의 칸 폭 (기본 0.875rem)
 * @cssprop --steps-current-color - `compact` 의 지금 칸 색 (기본 `--steps-bar-color`) — 주 색이 잉크인 테마에서 지나온 칸과 가르려고
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
  /** 모양 — `line`(기본) · `bars` · `compact` */
  @property({ type: String, reflect: true }) appearance: StepsAppearance = 'line';

  /** `line` 이 자기 폭에 들어가지 않아 세로로 접혔는가 — 배치만 바꾸므로 다시 그리지 않고 목록의 클래스로 건다. */
  private folded = false;
  /** 가로로 놓였을 때 목록이 필요로 하는 폭 — 접힌 뒤 펼칠지를 이것과 지금 폭으로 가른다. */
  private naturalWidth = 0;
  private resizeObserver?: ResizeObserver;

  connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver ??= new ResizeObserver(() => this.measureFold());
      this.resizeObserver.observe(this);
    }
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  protected willUpdate(changed: PropertyValues<this>): void {
    // 단계나 모양이 바뀌면 가로 폭을 다시 잰다 — 일단 펼쳐 그린 뒤 updated 에서.
    if (changed.has('items') || changed.has('appearance') || changed.has('label')) this.setFolded(false);
  }

  protected updated(): void {
    this.measureFold();
  }

  private measureFold() {
    const list = this.renderRoot.querySelector<HTMLElement>('.list');
    if (!list) return;
    if (this.appearance !== 'line') return this.setFolded(false);
    if (!this.folded) {
      if (list.scrollWidth > list.clientWidth + 1) {
        this.naturalWidth = list.scrollWidth;
        this.setFolded(true);
      }
    } else if (list.clientWidth >= this.naturalWidth) {
      this.setFolded(false);
    }
  }

  private setFolded(folded: boolean) {
    this.folded = folded;
    if (!folded) this.naturalWidth = 0;
    this.renderRoot?.querySelector('.list')?.classList.toggle('folded', folded);
  }

  /** 단계의 실효 상태. */
  statusOf(index: number): StepStatus {
    const own = this.items[index]?.status;
    if (own) return own;
    if (this.current === undefined) return 'upcoming';
    if (index < this.current) return 'complete';
    if (index === this.current) return 'current';
    return 'upcoming';
  }

  /** `compact` 가 칸 옆에 쓰는 이름 — 지금(또는 보류) 단계, 없으면 마지막으로 지나온 단계. */
  private summaryLabel(): string {
    const statuses = this.items.map((_, i) => this.statusOf(i));
    let at = statuses.findIndex((st) => st === 'current' || st === 'hold');
    if (at < 0) at = statuses.lastIndexOf('complete');
    return at < 0 ? '' : this.items[at].label;
  }

  protected render() {
    const last = this.items.length - 1;
    const bars = this.appearance === 'bars';
    const compact = this.appearance === 'compact';
    const plain = bars || compact;
    return html`
      <div class="base" part="base">
        ${this.label ? html`<span class="label" part="label" aria-hidden="true">${this.label}</span>` : nothing}
        <ol class="list" part="list" aria-label=${ifDefined(this.label)}
          style=${ifDefined(bars ? `grid-template-columns: repeat(${Math.max(1, this.items.length)}, minmax(0, 1fr))` : undefined)}>
          ${this.items.map((item, i) => {
            const status = this.statusOf(i);
            const travelled = i < last && status === 'complete';
            return html`
              <li class="step" part="step step-${status}" data-status=${status}
                aria-current=${ifDefined(status === 'current' ? 'step' : undefined)}>
                <span class="marker" part="marker" aria-hidden="true">${status === 'complete' && !plain ? CHECK : nothing}</span>
                <span class="title" part="title">${item.label}</span>
                ${item.description ? html`<span class="description" part="description">${item.description}</span>` : nothing}
                ${status === 'complete' || status === 'hold' || status === 'skipped'
                  ? html`<span class="sr-only">${Locale.getValue(STATUS_WORD[status])}</span>`
                  : nothing}
              </li>
              ${i < last && !plain
                ? html`<li class="connector ${travelled ? 'travelled' : ''}" part="connector" aria-hidden="true"></li>`
                : nothing}
            `;
          })}
        </ol>
        ${compact ? html`<span class="summary" part="summary" aria-hidden="true">${this.summaryLabel()}</span>` : nothing}
      </div>
    `;
  }
}

const STATUS_WORD = { complete: 'stepComplete', hold: 'stepOnHold', skipped: 'stepSkipped' } as const;

const CHECK = html`<svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 6.2 5 8.5 9.5 3.5"/></svg>`;

declare global {
  interface HTMLElementTagNameMap {
    'u-steps': USteps;
  }
}
