/**
 * 「복사 · 붙여넣기 · 전체 선택」 의 단축키 수식어 — macOS 는 ⌘(Meta), 그 밖은 Ctrl.
 *
 * `{Control>}c{/Control}` 를 그대로 쓰면 macOS 에서는 다른 키(Ctrl+C 는 복사가 아니다 · Ctrl+A 는 줄 처음으로 간다)가 눌려
 * 시험이 제품이 아니라 운영체제의 키 배치를 잰다. 실제 키 입력 시험은 이 값으로 누른다.
 */
export const MOD: 'Meta' | 'Control' = /Mac|iPhone|iPad/.test(navigator.platform) ? 'Meta' : 'Control';
