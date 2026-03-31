export type NavigateEventDetail = unknown;
export type NavigateEvent = CustomEvent<NavigateEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'navigate': NavigateEvent;
  }
}
