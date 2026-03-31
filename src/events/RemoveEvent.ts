export type RemoveEventDetail = unknown;
export type RemoveEvent = CustomEvent<RemoveEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'remove': RemoveEvent;
  }
}
