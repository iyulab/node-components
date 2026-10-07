import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import '../button/UButton.js';
import '../icon/UIcon.js';
import '../select/USelect.js';
import '../option/UOption.js';

import { UElement } from "../UElement.js";
import { Locale } from "../../utilities/Locale.js";
import { styles } from "./UPagination.styles.js";

export type PaginationSize = 'sm' | 'md' | 'lg';

/** `page-change` 의 detail — 0 기준 페이지와 그때의 페이지 크기. */
export interface PageChangeDetail {
  page: number;
  pageSize: number;
}

/** 쪽 번호 사이에 생략을 둘 때의 한 칸 — 쪽 번호(0 기준) 또는 생략. */
type PageCell = number | 'gap';

/**
 * 페이지 이동 — 범위와 총 건수, 이전·다음, 쪽 번호, 선택적으로 «페이지당 행 수».
 *
 * 페이지는 **0 기준**이다(`page-change` 의 `page` 도) — 데이터 소스(`createODataSource`)와 두 표(`flex-table` ·
 * `u-rich-table`)가 같은 축을 쓴다. 화면에는 1부터 보인다.
 *
 * 혼자서도 동작한다: 누르면 `page-change`(취소 가능)를 내고, 취소되지 않으면 스스로 `page`·`page-size` 를 바꾼다.
 * 소스에 묶으면(`page`·`page-size`·`total-count` 를 소스 상태로) 소스가 정답이다.
 *
 * @event page-change - `{ page, pageSize }` — 쪽을 옮기거나 페이지 크기를 바꿨다(크기를 바꾸면 첫 장). 취소하면 그대로다.
 *
 * @csspart nav - 내비게이션 요소
 * @csspart range - «1–20 / 345» 글자
 * @csspart page - 쪽 번호 버튼(현재 쪽은 `aria-current="page"`)
 * @csspart prev - 이전 버튼
 * @csspart next - 다음 버튼
 * @csspart page-size - «페이지당 행 수» 선택
 */
@customElement('u-pagination')
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export class UPagination extends UElement {
  static styles = [ super.styles, styles ];

  /** 현재 페이지 — 0 기준. 범위를 넘으면 마지막(또는 첫) 페이지로 보인다. */
  @property({ type: Number, reflect: true }) page = 0;
  /** 한 페이지의 행 수. */
  @property({ type: Number, attribute: 'page-size' }) pageSize = 20;
  /** 전체 행 수(페이지 나누기 전). */
  @property({ type: Number, attribute: 'total-count' }) totalCount = 0;
  /**
   * 고를 수 있는 페이지 크기. 비어 있으면 «페이지당 행 수» 선택을 그리지 않는다. 속성으로는 쉼표 목록(`page-sizes="20,50,100"`).
   */
  @property({
    attribute: 'page-sizes',
    converter: {
      fromAttribute: (v: string | null) => (v ?? '').split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n) && n > 0),
      toAttribute: (v: number[]) => v.join(','),
    },
  })
  pageSizes: number[] = [];
  /** 버튼·선택의 크기 단 — 다른 컨트롤과 같은 세 단. */
  @property({ type: String, reflect: true }) size: PaginationSize = 'md';
  /** 현재 쪽 양옆에 보일 쪽 번호 수. */
  @property({ type: Number }) siblings = 1;
  /**
   * 내비게이션의 접근 가능한 이름. 비우면 로케일 문장(`pagination`). 한 화면에 페이저가 둘 이상이면 각자 이름을 준다
   * (랜드마크는 이름으로 구별된다 — 예: «주문 목록 페이지»).
   */
  @property({ type: String }) label = '';
  /**
   * 범위 글자를 만든다 — `(start, end, total)`, `start` 는 1 기준(행이 없으면 0). 비우면 로케일 문장(`rangeOfTotal` —
   * «1–20 / 345»). 숫자 형식·문구를 화면 규약에 맞출 때.
   */
  @property({ attribute: false }) formatRange?: (start: number, end: number, total: number) => string;

  /** 페이지 수 — 행이 없어도 1. */
  get pageCount(): number {
    return Math.max(1, Math.ceil(this.totalCount / Math.max(1, this.pageSize)));
  }

  private get current(): number {
    return Math.min(Math.max(0, Math.floor(this.page)), this.pageCount - 1);
  }

  render() {
    const current = this.current;
    const last = this.pageCount - 1;
    const start = this.totalCount === 0 ? 0 : current * this.pageSize + 1;
    const end = Math.min(this.totalCount, (current + 1) * this.pageSize);
    return html`
      <nav part="nav" aria-label=${this.label || Locale.getValue('pagination')}>
        <span class="range" part="range">${this.formatRange
          ? this.formatRange(start, end, this.totalCount)
          : Locale.getValue('rangeOfTotal', { start, end, total: this.totalCount })}</span>
        <div class="pages">
          <u-button part="prev" class="step" appearance="plain" size=${this.size}
            aria-label=${Locale.getValue('previousPage')}
            ?disabled=${current <= 0}
            @click=${() => this.go(current - 1)}>
            <u-icon lib="internal" name="chevron-left"></u-icon>
          </u-button>
          ${this.cells(current, last).map((cell) => cell === 'gap'
            ? html`<span class="gap" aria-hidden="true">…</span>`
            : html`<u-button part="page" class="page" size=${this.size}
                appearance=${cell === current ? 'soft' : 'plain'}
                aria-label=${Locale.getValue('pageN', { n: cell + 1 })}
                aria-current=${cell === current ? 'page' : nothing}
                @click=${() => this.go(cell)}>${cell + 1}</u-button>`)}
          <u-button part="next" class="step" appearance="plain" size=${this.size}
            aria-label=${Locale.getValue('nextPage')}
            ?disabled=${current >= last}
            @click=${() => this.go(current + 1)}>
            <u-icon lib="internal" name="chevron-right"></u-icon>
          </u-button>
        </div>
        ${this.pageSizes.length ? html`
          <u-select part="page-size" class="page-size" size=${this.size}
            aria-label=${Locale.getValue('rowsPerPage')}
            .value=${String(this.pageSize)}
            @change=${this.onPageSizeChange}>
            ${this.pageSizes.map((n) => html`<u-option value=${String(n)}>${n}</u-option>`)}
          </u-select>` : nothing}
      </nav>
    `;
  }

  /** 처음 · 끝 · 현재와 그 양옆 — 사이가 한 쪽뿐이면 생략 대신 그 쪽을 그린다. */
  private cells(current: number, last: number): PageCell[] {
    const keep = new Set<number>([0, last]);
    for (let i = current - this.siblings; i <= current + this.siblings; i++) if (i >= 0 && i <= last) keep.add(i);
    const sorted = [...keep].sort((a, b) => a - b);
    const out: PageCell[] = [];
    sorted.forEach((p, i) => {
      const prev = sorted[i - 1];
      if (prev !== undefined && p - prev === 2) out.push(prev + 1);
      else if (prev !== undefined && p - prev > 2) out.push('gap');
      out.push(p);
    });
    return out;
  }

  private go(page: number) {
    const next = Math.min(Math.max(0, page), this.pageCount - 1);
    if (next === this.current) return;
    if (this.fire<PageChangeDetail>('page-change', { detail: { page: next, pageSize: this.pageSize } })) this.page = next;
  }

  private onPageSizeChange = (e: Event) => {
    e.stopPropagation();
    const size = Number((e.target as HTMLElement & { value: string }).value);
    if (!Number.isFinite(size) || size <= 0 || size === this.pageSize) return;
    if (this.fire<PageChangeDetail>('page-change', { detail: { page: 0, pageSize: size } })) {
      this.pageSize = size;
      this.page = 0;
    }
  };
}

/** Custom events `<u-pagination>` dispatches. */
export interface UPaginationEventMap {
  /** A page was chosen, or the page size changed (then `page` is 0). Cancelable — cancel it to keep the current page. */
  'page-change': CustomEvent<{ page: number; pageSize: number }>;
}

/** Typed listeners for {@link UPaginationEventMap} — element-scoped, the DOM's own pattern (`HTMLMediaElementEventMap`). */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export interface UPagination {
  addEventListener<K extends keyof UPaginationEventMap>(type: K, listener: (this: UPagination, ev: UPaginationEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UPagination, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof UPaginationEventMap>(type: K, listener: (this: UPagination, ev: UPaginationEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UPagination, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'u-pagination': UPagination;
  }
}
