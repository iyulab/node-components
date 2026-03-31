export type ShowEventDetail = unknown;
export type ShowEvent = CustomEvent<ShowEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'show': ShowEvent;
  }
}