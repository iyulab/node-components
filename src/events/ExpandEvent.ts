export type ExpandEventDetail = unknown;
export type ExpandEvent = CustomEvent<ExpandEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'expand': ExpandEvent;
  }
}
