import { isHangul } from './search.js';

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

  /**
   * 검색어로 쓸 글자 — 확정된 글자에, 글 끝에서 조합 중인 글자가 한글이면 그것까지. 한글의 조합 중 음절은 자모로 풀면 최종
   * 글자 자모의 앞부분이라(`성` → `ㅅㅓㅇ` ⊂ `서울` → `ㅅㅓㅇㅜㄹ`) 검색 일치(`Locale.matchesSearch`)가 그대로 견줄 수 있다.
   * 그 성질은 조합이 글 끝에 있을 때만 서고(가운데라면 뒤 글자가 붙는다), 다른 문자 체계의 조합 글자(가나 → 한자 변환 전)는
   * 최종 글자와 견줄 수 없어 뺀다.
   */
  searchable(input: HTMLInputElement | HTMLTextAreaElement): string {
    const atEnd = this.start !== null && this.start + this.text.length === input.value.length;
    return atEnd && isHangul(this.text) ? input.value : this.settled(input);
  }

  /** 입력의 확정된 글자 — 조합 중인 음절을 뺀 값. 조합 중이 아니면 값 그대로. */
  settled(input: HTMLInputElement | HTMLTextAreaElement): string {
    if (this.start === null) return input.value;
    return input.value.slice(0, this.start) + input.value.slice(this.start + this.text.length);
  }
}

/**
 * 입력 칸의 `input` 처리기를 다시 부른다 — 그 칸 자신의 처리기만(전파하지 않는다). 조합 중에는 거르기·검색을 멈추는
 * 칸이 조합 끝에 확정 글자로 다시 돌게 하는 `onEnd`: `new CompositionTracker(replayInput)`.
 */
export function replayInput(input: HTMLInputElement | HTMLTextAreaElement): void {
  input.dispatchEvent(new Event('input', { bubbles: false, composed: false }));
}
