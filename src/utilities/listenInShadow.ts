import { noChange, nothing } from 'lit';
import { AsyncDirective, directive, PartType, type ElementPart, type PartInfo } from 'lit/async-directive.js';

/*
 * Why these exist: a `click`, `mousedown` or `mouseup` listener on an element makes the browser expose it as
 * clickable, and screen readers announce «clickable» on that element and when entering it — the element and
 * what is inside it (measured with NVDA 2026.2: every button whose host carried a click listener read as
 * «clickable, button»). Only elements whose role already says so (button, link, menuitem, tab, option, radio,
 * checkbox, switch) are spared. A listener on the shadow root is not on an element, so nothing is announced.
 */

/**
 * Listens on a shadow root for events from the elements of that root that match `selector`. The handler
 * receives the event and the matched element. Returns a function that removes the listener.
 */
export function listenInShadow<E extends Event = Event>(
  root: ShadowRoot | HTMLElement,
  type: string,
  selector: string,
  handler: (event: E, matched: HTMLElement) => void,
  options?: AddEventListenerOptions,
): () => void {
  const listener = (event: Event) => {
    for (const node of event.composedPath()) {
      if (node === root) return;
      if (node instanceof HTMLElement && node.getRootNode() === root && node.matches(selector)) {
        handler(event as E, node);
        return;
      }
    }
  };
  root.addEventListener(type, listener, options);
  return () => root.removeEventListener(type, listener, options);
}

type Handler = (event: Event, element: Element) => void;

/** root → event type → element → handler. One listener per root and type, added the first time it is needed. */
const registry = new WeakMap<Node, Map<string, WeakMap<Element, { handler: Handler; host: unknown }>>>();

function register(root: Node, type: string): WeakMap<Element, { handler: Handler; host: unknown }> {
  let types = registry.get(root);
  if (!types) registry.set(root, (types = new Map()));
  let handlers = types.get(type);
  if (!handlers) {
    const map = (handlers = new WeakMap());
    types.set(type, map);
    root.addEventListener(type, (event) => {
      // Walk the path the way the event bubbled through this root, calling each element's handler in turn —
      // the order a listener on each element would have run in. `stopPropagation()` ends the walk.
      for (const node of event.composedPath()) {
        if (node === root) return;
        if (!(node instanceof Element)) continue;
        const entry = map.get(node);
        if (!entry) continue;
        entry.handler.call(entry.host, event, node);
        if (event.cancelBubble) return;
      }
    });
  }
  return handlers;
}

class DelegateDirective extends AsyncDirective {
  private element?: Element;
  private type?: string;
  private root?: Node;

  constructor(part: PartInfo) {
    super(part);
    if (part.type !== PartType.ELEMENT) throw new Error('delegate() belongs in an element position');
  }

  render(_type: string, _handler: Handler) {
    return nothing;
  }

  override update(part: ElementPart, [type, handler]: [string, Handler]) {
    const element = part.element;
    if (this.element && this.type && (this.element !== element || this.type !== type)) this.forget();
    this.element = element;
    this.type = type;
    // On first render the template is filled while still a document fragment — the element's own root is
    // not the shadow root yet. The component that renders it is the one whose root hears the event.
    const host = part.options?.host as { renderRoot?: Node } | undefined;
    const root = host?.renderRoot ?? element.getRootNode();
    this.root = root;
    register(root, type).set(element, { handler, host: host ?? element });
    return noChange;
  }

  protected override disconnected() {
    this.forget();
  }

  protected override reconnected() {
    // `update` runs again on the next render and registers it anew.
  }

  private forget() {
    if (!this.element || !this.type) return;
    if (this.root) registry.get(this.root)?.get(this.type)?.delete(this.element);
  }
}

/**
 * An event handler for an element in a shadow tree, heard on that tree's root instead of on the element:
 * `<div class="container" ${delegate('click', this.open)}>` in place of `@click=${this.open}`. Handlers run in
 * bubbling order and `stopPropagation()` stops the ones further out, as with element listeners. The handler
 * gets the element as its second argument and the component as `this`.
 */
export const delegate = directive(DelegateDirective) as unknown as <E extends Event = Event>(
  type: string,
  handler: (event: E, element: HTMLElement) => void,
) => ReturnType<ReturnType<typeof directive>>;
