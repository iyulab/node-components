export type UChangeEvent = CustomEvent<{ value?: string; checked?: boolean }>;

declare global {
  interface GlobalEventHandlersEventMap {
    'u-change': UChangeEvent;
  }
}
