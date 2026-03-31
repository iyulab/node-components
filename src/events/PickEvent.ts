export interface PickEventDetail {
  /** 아이템의 고유값 */
  value: string;
  /** 클릭 후 선택 상태 */
  selected: boolean;
  /** Shift 키 누름 여부 (범위 선택) */
  shiftKey: boolean;
  /** Meta/Cmd 키 누름 여부 (Mac 다중 개별 선택) */
  metaKey: boolean;
  /** Ctrl 키 누름 여부 (Windows/Linux 다중 개별 선택) */
  ctrlKey: boolean;
}

export type PickEvent = CustomEvent<PickEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'pick': PickEvent;
  }
}