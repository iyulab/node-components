export interface ShiftEventDetail {
  /** 이동된 구분선의 인덱스 */
  index: number;
  /** 현재 패널 크기 비율 배열 (퍼센트, 합계 100) */
  ratio: number[];
}

export type UShiftEvent = CustomEvent<ShiftEventDetail>;
export type UShiftStartEvent = CustomEvent<ShiftEventDetail>;
export type UShiftEndEvent = CustomEvent<ShiftEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'shift': UShiftEvent;
    'shift-start': UShiftStartEvent;
    'shift-end': UShiftEndEvent;
  }
}
