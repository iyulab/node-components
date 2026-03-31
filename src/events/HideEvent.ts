export type HideEventDetail = unknown;
export type HideEvent = CustomEvent<HideEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'hide': HideEvent;
  }
}