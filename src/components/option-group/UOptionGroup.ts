import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { HostAria } from "../../utilities/hostAria.js";
import { UOption } from "../option/UOption.js";
import { styles } from "./UOptionGroup.styles.js";

/**
 * A labelled group of `u-option`s inside a `u-select` or a `u-input` combobox — the native `<optgroup>`.
 *
 * The heading is not an option: it takes no focus, cannot be selected, and keyboard movement goes from the last option
 * of one group to the first of the next. For assistive technology the group is `role="group"` named by `label`, the
 * listbox pattern's grouping. While none of its options is visible — a search filtered them all out, or it has none —
 * the whole group, heading included, is hidden (`:state(empty)`).
 *
 * @slot - `u-option` items
 *
 * @csspart label - The heading
 * @csspart options - The box around the options
 */
@customElement('u-option-group')
export class UOptionGroup extends UElement {
  static styles = [super.styles, styles];

  /** The heading, and the group's accessible name. */
  @property({ type: String }) label: string = '';

  private readonly aria = new HostAria(this);
  private readonly internals = this.attachInternals();
  /** Watches the options: added or removed, hidden or shown by a search. */
  private readonly observer = new MutationObserver(() => this.syncEmpty());

  /**
   * The group's options, in order. Matched by tag, not class: a group parsed together with its options is connected
   * before they are upgraded, and the `instanceof` test then saw none — the group hid itself as empty.
   */
  get options(): UOption[] {
    return [...this.children].filter((el): el is UOption => el.localName === 'u-option');
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.aria.set('role', 'group');
    this.observer.observe(this, { childList: true, subtree: true, attributes: true, attributeFilter: ['hidden'] });
    this.syncEmpty();
  }

  disconnectedCallback(): void {
    this.observer.disconnect();
    super.disconnectedCallback();
  }

  protected updated(changed: Map<string, unknown>): void {
    super.updated(changed);
    if (changed.has('label')) this.aria.set('aria-label', this.label || null);
  }

  private syncEmpty(): void {
    const empty = !this.options.some((option) => !option.hidden);
    if (empty) this.internals.states.add('empty');
    else this.internals.states.delete('empty');
  }

  render() {
    // The heading is the group's name already (aria-label) — hidden from the tree so it is not read twice.
    return html`
      <div class="label" part="label" aria-hidden="true">${this.label}</div>
      <div class="options" part="options"><slot></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-option-group': UOptionGroup;
  }
}

/**
 * The options among a listbox's slotted elements, in order — the elements themselves and the options inside groups.
 * `u-select` and the `u-input` combobox collect through this, so a group is transparent to their keyboard, filter and
 * selection.
 */
export function collectOptions(elements: Element[]): UOption[] {
  return elements.flatMap((el) => (el instanceof UOption ? [el] : el instanceof UOptionGroup ? el.options.filter((o) => o instanceof UOption) : []));
}
