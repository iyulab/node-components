/**
 * A component's own ARIA on its host, written as attributes — and only where the author left them empty.
 *
 * `ElementInternals` defaults are invisible from the DOM by design, so every DOM-based tool — Playwright's
 * `getByRole`, Testing Library's `*ByRole`, axe-core — computes a host with no role and no name, while the
 * browser's accessibility tree shows both. A role-based e2e query then finds nothing, and an audit of a `dialog`
 * named only through internals would report it unnamed. An attribute is what assistive technology and those
 * tools both read.
 *
 * Ownership rule: an attribute is ours only if it was absent the first time we wrote it, and it stays ours only
 * while it still holds the value we last wrote. An author value — set before or after — always wins: we never
 * overwrite it and never remove it. Attributes cannot be written from a custom element constructor, so the first
 * write belongs in `connectedCallback` or later.
 */
export class HostAria {
  /** attribute → the value we last wrote (`null` = we removed it, or wrote nothing yet). */
  private readonly owned = new Map<string, string | null>();
  /** Attributes the author set — never touched again. */
  private readonly authored = new Set<string>();

  constructor(private readonly host: Element) {}

  /** Writes `value` (`null` removes) if the attribute is ours. Returns whether it is. */
  set(name: string, value: string | null): boolean {
    if (!this.claim(name)) return false;
    if (value === null) this.host.removeAttribute(name);
    else if (this.host.getAttribute(name) !== value) this.host.setAttribute(name, value);
    this.owned.set(name, value);
    return true;
  }

  /** True when the author has set this attribute — the host's own value, not ours. */
  isAuthored(name: string): boolean {
    return !this.claim(name, false);
  }

  /**
   * Decides ownership. A first look at an empty attribute makes it ours (when `take`); a value we did not write
   * makes it the author's for good.
   */
  private claim(name: string, take = true): boolean {
    if (this.authored.has(name)) return false;
    const current = this.host.getAttribute(name);
    if (this.owned.has(name)) {
      if (current === this.owned.get(name)) return true;
      this.owned.delete(name);
      this.authored.add(name);
      return false;
    }
    if (current !== null) {
      this.authored.add(name);
      return false;
    }
    if (take) this.owned.set(name, null);
    return true;
  }
}

let nextId = 0;

/**
 * Names `host` after the elements (or text) of one of its slots, as `aria-labelledby` — or `aria-label` when the
 * slot holds only text, or elements outside the host's tree that an IDREF cannot reach. An author's
 * `aria-label`/`aria-labelledby` on the host wins over both. Ids we give to slotted elements are tracked in
 * `given` and withdrawn once those elements leave the slot (unless the author has since changed them).
 */
export function nameFromSlot(aria: HostAria, host: Element, slot: HTMLSlotElement, given: Map<Element, string>): void {
  const authorNamed = aria.isAuthored('aria-label') || aria.isAuthored('aria-labelledby');
  const elements = slot.assignedElements({ flatten: true });
  const sameTree = elements.length > 0 && elements.every((el) => el.getRootNode() === host.getRootNode());

  for (const [el, id] of [...given]) {
    if (!elements.includes(el)) {
      if (el.id === id) el.removeAttribute('id');
      given.delete(el);
    }
  }
  if (authorNamed) return;

  if (sameTree) {
    const ids = elements.map((el) => {
      if (!el.id) {
        el.id = `u-name-${++nextId}`;
        given.set(el, el.id);
      }
      return el.id;
    });
    aria.set('aria-label', null);
    aria.set('aria-labelledby', ids.join(' '));
  } else {
    const text = slot.assignedNodes({ flatten: true }).map((n) => n.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();
    aria.set('aria-labelledby', null);
    aria.set('aria-label', text || null);
  }
}
