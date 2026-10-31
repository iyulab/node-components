import { html, nothing, CSSResultGroup, PropertyValues } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { ifDefined } from 'lit/directives/if-defined.js';
import '../icon/UIcon.js';
import '../spinner/USpinner.js';

import { UOverlayElement } from '../UOverlayElement.js';
import { styles } from './UCommandPalette.styles.js';
import { Locale } from '../../utilities/Locale.js';
import { isImeComposing } from '../../utilities/keyboard.js';

import { delegate } from "../../utilities/listenInShadow.js";
/** 팔레트의 항목 하나. */
export interface CommandItem {
  /** 출처 안에서 고유한 값. */
  id: string;
  /** 보이는 이름. */
  label: string;
  /** 이름 옆의 보조 글(경로 · 상태 등). 접근 가능한 설명으로도 나간다. */
  description?: string;
  /** 아이콘 이름(`u-icon` 의 `name`). */
  icon?: string;
  /** 아이콘 라이브러리(`u-icon` 의 `lib`). */
  iconLib?: string;
  /** 고르면 갈 곳. `command` 이벤트를 취소하지 않으면 그 주소로 이동한다. */
  href?: string;
  /** 일치 판정에 함께 쓰는 낱말(`filterCommands` 가 본다). */
  keywords?: string[];
  /** 앱이 실어 두는 값 — 팔레트는 읽지 않는다. */
  data?: unknown;
}

/** 출처의 검색 — 새 검색어가 오면 이전 요청의 `signal` 이 중단된다. */
export type CommandSearch = (query: string, options: { signal: AbortSignal }) => CommandItem[] | Promise<CommandItem[]>;

/** 항목을 내는 곳 하나 — 결과는 출처 순서대로 묶이고 묶음 머리는 `label` 이다. */
export interface CommandSource {
  /** 출처의 고유값(`command` 이벤트의 `source`). */
  id: string;
  /** 묶음 머리. */
  label: string;
  search: CommandSearch;
}

/** `command` 이벤트의 detail. */
export interface UCommandPaletteCommandDetail {
  item: CommandItem;
  /** 그 항목을 낸 출처의 `id`. */
  source: string;
}

/** Events `<u-command-palette>` dispatches (plus `show` · `hide` from the overlay base). */
export interface UCommandPaletteEventMap {
  /** An item was chosen (Enter or click). Cancelable — when not canceled and the item has `href`, the page goes there. Does not bubble. */
  'command': CustomEvent<UCommandPaletteCommandDetail>;
}

/**
 * 정적 항목을 검색어로 거른다 — 이름 · 설명 · 낱말을 활성 로케일의 검색 일치로 견준다(`u-select` 와 같은 규칙). 빈 검색어는 모두다.
 * 출처의 `search` 를 짓는 도우미: `search: (q) => filterCommands(items, q)`.
 */
export function filterCommands(items: readonly CommandItem[], query: string): CommandItem[] {
  const q = query.trim();
  if (!q) return [...items];
  return items.filter((item) =>
    [item.label, item.description ?? '', ...(item.keywords ?? [])].some((text) => text && Locale.matchesSearch(text, q)));
}

interface SourceState {
  source: CommandSource;
  status: 'loading' | 'done' | 'error';
  items: CommandItem[];
}

interface Row {
  key: string;
  item: CommandItem;
  source: string;
}

let nextId = 0;

/**
 * 명령 팔레트 — 한 칸에서 화면 · 레코드 · 동작을 찾아 고른다(Ctrl/⌘ K 류). 대화상자 안의 검색 칸(WAI-ARIA APG combobox)과
 * 결과 목록(listbox)이고, 결과는 출처(`sources`)마다 묶인다.
 *
 * - 열면 칸에 초점이 가고 빈 검색어로 출처를 부른다(최근 항목 · 화면 목록처럼 «찾기 전» 에 보일 것). 치면 `debounce` 뒤에 다시
 *   부르고, 새 검색어는 이전 요청을 `AbortSignal` 로 중단한다. 한 출처의 실패 · 지연은 다른 출처의 결과를 막지 않는다.
 * - ↑ ↓ 로 항목을 옮기고(끝에서 처음으로 돈다) Enter 로 고른다 · Escape 로 닫는다. 입력기 조합을 확정하는 Enter 는 고르지 않는다.
 * - 고르면 `command` 를 내고 닫는다. 취소하지 않았고 항목에 `href` 가 있으면 그 주소로 간다 — 클라이언트 라우터를 쓰는 앱은
 *   취소하고 스스로 옮긴다. 닫으면 열기 전의 초점으로 돌아간다.
 *
 * 단축키(Ctrl/⌘ K)는 이 요소가 걸지 않는다 — 어디서 여는가는 앱(또는 셸)의 몫이다.
 *
 * @event command - 항목을 골랐다. `detail: { item, source }` · 취소 가능 · 거품 없음.
 * @event show - 열리기 직전(취소하면 열리지 않는다).
 * @event hide - 닫히기 직전(취소하면 닫히지 않는다).
 *
 * @csspart panel - 대화상자 상자
 * @csspart input - 검색 칸
 * @csspart listbox - 결과 목록
 * @csspart group-label - 묶음 머리
 * @csspart option - 항목
 * @csspart status - 불러오는 중 · 결과 없음 · 출처 오류 줄
 */
@customElement('u-command-palette')
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export class UCommandPalette extends UOverlayElement {
  static styles: CSSResultGroup = [super.styles, styles];

  /** 항목을 내는 곳들 — 묶음은 이 순서다. 프로퍼티로만 준다. */
  @property({ attribute: false }) sources: CommandSource[] = [];
  /** 검색 칸의 자리표시 글. */
  @property({ type: String }) placeholder = '';
  /** 검색 칸의 접근 가능한 이름 — 비면 로캘 `search`. */
  @property({ type: String }) label = '';
  /** 치기를 멈춘 뒤 출처를 부르기까지(ms). */
  @property({ type: Number }) debounce = 150;

  @state() private query = '';
  @state() private results: SourceState[] = [];
  @state() private activeKey?: string;

  @query('input.input') private inputEl?: HTMLInputElement;

  private readonly idBase = `u-command-palette-${++nextId}`;
  private controller?: AbortController;
  private timer?: number;

  protected ownInitialFocus(): HTMLElement | null {
    return this.inputEl ?? null;
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.hasAttribute('aria-label')) this.aria.set('aria-label', this.label || Locale.getValue('search'));
  }

  disconnectedCallback(): void {
    this.cancel();
    super.disconnectedCallback();
  }

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    if (changed.has('label')) this.aria.set('aria-label', this.label || Locale.getValue('search'));
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('open')) {
      if (this.open) {
        this.query = '';
        if (this.inputEl) this.inputEl.value = '';
        this.run('');
      } else {
        this.cancel();
      }
    } else if (changed.has('sources') && this.open) {
      this.run(this.query);
    }
  }

  protected override localeChanged(): void {
    if (this.label === '') this.aria.set('aria-label', Locale.getValue('search'));
    super.localeChanged();
  }

  render() {
    const rows = this.rows;
    const listboxId = `${this.idBase}-listbox`;
    const active = rows.find((r) => r.key === this.activeKey);
    const settled = this.results.length > 0 && this.results.every((r) => r.status !== 'loading');
    const loading = this.results.some((r) => r.status === 'loading');
    return html`
      <div class="container">
        <div class="panel" part="panel">
          <div class="field">
            <u-icon class="field-icon" lib="internal" name="search" aria-hidden="true"></u-icon>
            <input class="input" part="input"
              type="text"
              role="combobox"
              autocomplete="off"
              spellcheck="false"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded="true"
              aria-controls=${listboxId}
              aria-activedescendant=${ifDefined(active ? this.optionId(active) : undefined)}
              aria-label=${this.label || Locale.getValue('search')}
              placeholder=${this.placeholder}
              @input=${this.handleInput}
              @keydown=${this.handleKeydown} />
            ${loading ? html`<u-spinner class="field-spinner" aria-hidden="true"></u-spinner>` : nothing}
          </div>
          <div class="listbox" part="listbox" role="listbox" id=${listboxId}
            aria-label=${this.label || Locale.getValue('search')}
            ?hidden=${rows.length === 0}>
            ${this.results.map((state) => this.renderGroup(state))}
          </div>
          ${this.results.filter((r) => r.status === 'error').map((r) => html`
            <div class="error" part="status">${Locale.getValue('searchFailed', { source: r.source.label })}</div>`)}
          <div class="status" part="status" role="status">${settled && rows.length === 0
            ? Locale.getValue('noMatches')
            : loading && rows.length === 0 ? Locale.getValue('loading') : ''}</div>
        </div>
      </div>
    `;
  }

  private renderGroup(state: SourceState) {
    const headingId = `${this.idBase}-g-${state.source.id}`;
    if (state.status === 'error' || state.items.length === 0) return nothing;
    return html`
      <div role="group" aria-labelledby=${headingId} class="group">
        <div class="group-label" part="group-label" id=${headingId} role="presentation">${state.source.label}</div>
        ${state.items.map((item) => {
          const row = { key: this.rowKey(state.source.id, item), item, source: state.source.id };
          const isActive = row.key === this.activeKey;
          const descId = item.description ? `${this.optionId(row)}-d` : undefined;
          return html`
            <div class="option" part="option" role="option"
              id=${this.optionId(row)}
              aria-selected=${isActive ? 'true' : 'false'}
              aria-describedby=${ifDefined(descId)}
              ?data-active=${isActive}
              @pointermove=${() => { if (this.activeKey !== row.key) this.activeKey = row.key; }}
              ${delegate('click', () => this.choose(row))}>
              ${item.icon ? html`<u-icon class="option-icon" lib=${ifDefined(item.iconLib)} name=${item.icon} aria-hidden="true"></u-icon>` : nothing}
              <span class="option-label">${item.label}</span>
              ${item.description ? html`<span class="option-description" id=${ifDefined(descId)}>${item.description}</span>` : nothing}
            </div>`;
        })}
      </div>
    `;
  }

  /** 보이는 순서의 항목들(출처 순 → 출처가 준 순). */
  private get rows(): Row[] {
    return this.results.flatMap((state) =>
      state.status === 'error' ? [] : state.items.map((item) => ({ key: this.rowKey(state.source.id, item), item, source: state.source.id })));
  }

  private rowKey(source: string, item: CommandItem) {
    return `${source}\u0000${item.id}`;
  }

  /** 항목의 id — 섀도 안의 같은 트리라 `aria-activedescendant` IDREF 가 닿는다. */
  private optionId(row: Row) {
    const index = this.rows.findIndex((r) => r.key === row.key);
    return `${this.idBase}-o-${index}`;
  }

  private handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    this.query = value;
    window.clearTimeout(this.timer);
    if (!value.trim()) {
      this.run('');
      return;
    }
    this.timer = window.setTimeout(() => this.run(value), Math.max(0, this.debounce));
  };

  private handleKeydown = (e: KeyboardEvent) => {
    const rows = this.rows;
    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        e.preventDefault();
        if (!rows.length) return;
        const at = rows.findIndex((r) => r.key === this.activeKey);
        const step = e.key === 'ArrowDown' ? 1 : -1;
        const next = at === -1 ? (step === 1 ? 0 : rows.length - 1) : (at + step + rows.length) % rows.length;
        this.activeKey = rows[next].key;
        void this.updateComplete.then(() =>
          this.renderRoot.querySelector('.option[data-active]')?.scrollIntoView?.({ block: 'nearest' }));
        break;
      }
      case 'Enter': {
        if (isImeComposing(e)) return;
        const row = rows.find((r) => r.key === this.activeKey);
        if (row) {
          e.preventDefault();
          this.choose(row);
        }
        break;
      }
    }
  };

  /** 검색어로 출처를 부른다 — 이전 요청은 중단하고, 출처마다 따로 끝난다. */
  private run(query: string) {
    window.clearTimeout(this.timer);
    this.controller?.abort();
    const controller = new AbortController();
    this.controller = controller;
    const previous = new Map(this.results.map((r) => [r.source.id, r.items]));
    // 앞 결과를 지우지 않고 «불러오는 중» 으로 둔다 — 치는 동안 목록이 깜박이지 않게.
    this.results = this.sources.map((source) => ({ source, status: 'loading', items: previous.get(source.id) ?? [] }));
    this.sources.forEach((source, i) => {
      Promise.resolve()
        .then(() => source.search(query, { signal: controller.signal }))
        .then(
          (items) => this.settle(controller, i, { source, status: 'done', items: Array.isArray(items) ? items : [] }),
          (error: unknown) => {
            if (controller.signal.aborted) return;
            console.warn(`[@iyulab/components] u-command-palette: source "${source.id}" failed`, error);
            this.settle(controller, i, { source, status: 'error', items: [] });
          },
        );
    });
    if (this.sources.length === 0) this.syncActive();
  }

  private settle(controller: AbortController, index: number, state: SourceState) {
    if (controller !== this.controller || controller.signal.aborted) return;
    const next = [...this.results];
    next[index] = state;
    this.results = next;
    this.syncActive();
  }

  /** 검색어가 바뀌면 첫 항목이 후보다(APG «list autocomplete with automatic selection») — 지금 후보가 남아 있으면 그대로. */
  private syncActive() {
    const rows = this.rows;
    if (!rows.some((r) => r.key === this.activeKey)) this.activeKey = rows[0]?.key;
  }

  private choose(row: Row) {
    const proceed = this.fire<UCommandPaletteCommandDetail>('command', {
      detail: { item: row.item, source: row.source },
      bubbles: false,
      composed: false,
    });
    this.hide();
    if (proceed && row.item.href) window.location.assign(row.item.href);
  }

  private cancel() {
    window.clearTimeout(this.timer);
    this.controller?.abort();
    this.controller = undefined;
  }
}

/** Typed listeners for {@link UCommandPaletteEventMap} — element-scoped, the DOM's own pattern (`HTMLMediaElementEventMap`). */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export interface UCommandPalette {
  addEventListener<K extends keyof UCommandPaletteEventMap>(type: K, listener: (this: UCommandPalette, ev: UCommandPaletteEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UCommandPalette, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof UCommandPaletteEventMap>(type: K, listener: (this: UCommandPalette, ev: UCommandPaletteEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UCommandPalette, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'u-command-palette': UCommandPalette;
  }
}
