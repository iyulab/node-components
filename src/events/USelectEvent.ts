export type USelectEvent = CustomEvent<{ value: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'u-select': USelectEvent;
  }
}
