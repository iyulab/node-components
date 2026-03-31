export type CheckEventDetail = unknown;
export type CheckEvent = CustomEvent<CheckEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'check': CheckEvent;
  }
}
