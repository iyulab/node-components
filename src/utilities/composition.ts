/**
 * IME 조합(한국어 · 일본어 · 중국어)을 따라가는 입력 도우미 — 조합 중인 음절을 뺀 «확정된 글자» 를 준다.
 *
 * 글자마다 거르거나 찾는 입력은 조합 단계(«서울» 의 가는 길 «ㅅ» · «서» · «성» · «서우»)마다 그 글자로 거른다. 조합 중인
 * 음절은 아직 무엇이 될지 모르는 «진행 중» 이라, 그것으로 거르면 사용자가 찾는 항목을 숨기고 «결과 없음» 을 알린다.
 * 확정된 부분을 담는 항목은 최종 글자를 담는 항목의 상위 집합이므로(포함 · 접두 일치 둘 다), 확정된 부분으로 거르면 찾는
 * 항목을 숨기지 않는다.
 *
 * 리스너 객체로 입력 요소에 건다 — Lit 템플릿에서는
 * `@compositionstart=${tracker} @compositionupdate=${tracker} @compositionend=${tracker}`.
 *
 * Chromium 은 조합의 마지막 `input` 을 `isComposing: true` 로 내고 `compositionend` 로 끝낸다 — 조합 끝의 확정 글자로
 * 다시 거르려면 `onEnd` 를 받는다.
 */
export class CompositionTracker implements EventListenerObject {
  /** 조합이 시작된 자리 — 조합 중이 아니면 `null`. */
  private start: number | null = null;
  /** 지금 조합 중인 글자. */
  private text = '';

  /** @param onEnd 조합이 끝났을 때(확정 글자가 입력 요소에 들어간 뒤) 부른다. */
  constructor(private readonly onEnd?: (input: HTMLInputElement | HTMLTextAreaElement) => void) {}

  /** 조합이 진행 중인가. */
  get composing(): boolean {
    return this.start !== null;
  }

  handleEvent(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    switch (event.type) {
      case 'compositionstart':
        this.start = input.selectionStart ?? input.value.length;
        this.text = '';
        break;
      case 'compositionupdate':
        this.text = (event as CompositionEvent).data ?? '';
        break;
      case 'compositionend':
        this.start = null;
        this.text = '';
        this.onEnd?.(input);
        break;
    }
  }

  /** 입력의 확정된 글자 — 조합 중인 음절을 뺀 값. 조합 중이 아니면 값 그대로. */
  settled(input: HTMLInputElement | HTMLTextAreaElement): string {
    if (this.start === null) return input.value;
    return input.value.slice(0, this.start) + input.value.slice(this.start + this.text.length);
  }
}
