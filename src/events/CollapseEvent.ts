export type CollapseEventDetail = unknown;
export type CollapseEvent = CustomEvent<CollapseEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'collapse': CollapseEvent;
  }
}
