export type UInputEvent = CustomEvent<{ value: string }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'u-input': UInputEvent;
  }
}
