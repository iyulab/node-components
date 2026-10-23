import type { ReactiveController, ReactiveControllerHost } from 'lit';

/**
 * 이름 붙은 슬롯(`prefix` · `suffix` 등)에 라이트 DOM 자식이 꽂혀 있는가 — 슬롯을 감싼 섀도 안 상자를 비었을 때 그리지 않으려고 쓴다.
 *
 * 슬롯 옆 간격을 `::slotted()` 의 여백으로 주면 문서의 전역 리셋(Tailwind preflight 류 `* { margin: 0 }`)에 진다 — 캡슐화 문맥이
 * 다르면 문서 쪽 normal 선언이 이긴다. 간격은 섀도 안 상자가 갖고, 그 상자는 꽂힌 것이 있을 때만 선다.
 *
 * 첫 렌더 전에도 답하도록 `slotchange` 가 아니라 자식 목록을 본다(직속 자식의 `slot` 속성).
 */
export class SlotPresence implements ReactiveController {
  private present = new Set<string>();
  private readonly observer = new MutationObserver(() => this.sync());

  constructor(
    private readonly host: ReactiveControllerHost & HTMLElement,
    private readonly names: readonly string[],
  ) {
    host.addController(this);
  }

  /** 그 이름의 슬롯에 꽂힌 자식이 있는가. */
  has(name: string): boolean {
    return this.present.has(name);
  }

  hostConnected(): void {
    this.sync();
    this.observer.observe(this.host, { childList: true, attributes: true, attributeFilter: ['slot'], subtree: true });
  }

  hostDisconnected(): void {
    this.observer.disconnect();
  }

  private sync(): void {
    const next = new Set(this.names.filter((name) => Array.from(this.host.children).some((c) => c.slot === name)));
    if (next.size === this.present.size && [...next].every((n) => this.present.has(n))) return;
    this.present = next;
    this.host.requestUpdate();
  }
}
