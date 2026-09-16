import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import '../../src/components/field/UField.js';
import '../../src/components/input/UInput.js';
import '../../src/components/select/USelect.js';
import '../../src/components/switch/USwitch.js';
import '../../src/components/textarea/UTextarea.js';
import { resetDevWarnings } from '../../src/utilities/devWarning.js';

/**
 * docket #309 — `u-field` 가 라벨을 **그리기만** 하고 슬롯된 컨트롤과 잇지 않았다.
 * 소비자 실측: 한 화면에서 컨트롤 11개가 접근성 트리에서 이름을 잃었다. 그리고 그 형태는
 * 이 패키지 자신의 게시 문서(`references/components/field.md`)와 house-style 레시피가
 * **적극 권하는 정석 형태**였다 — 소비자 오용이 아니다.
 *
 * 조사 중 같은 뿌리의 두 번째 결함이 드러났다: `tabbable` 의 `isFocusable()` 은 섀도우를
 * 보지 않아 `<u-input>` 같은 호스트에 false 를 준다 ⇒ 종전 `focus()`/라벨 클릭은
 * **네이티브 엘리먼트를 슬롯했을 때만** 동작했고 `u-*` 컨트롤에서는 조용히 no-op 이었다.
 *
 * 처방: `u-field` 가 슬롯 호스트에 `aria-label`/`aria-description` 을 «문자열 복사»로 얹고,
 * `UFormControlElement` 가 그것을 내부 네이티브 컨트롤로 내려보낸다(`u-button` 이 docket
 * `#75` 에서 쓰던 처방을 공통 기반으로 올린 것). `aria-labelledby` 는 섀도우 경계를 넘지
 * 못해 쓸 수 없다.
 *
 * ★NEGATIVE 가 절반 — 자기 이름을 가진 컨트롤을 덮으면 눈에 보이는 라벨과 접근성 이름이
 * 어긋난다(WCAG 2.5.3 Label in Name). 침묵해야 하는 입력이 이 스위트의 설계 대부분이다.
 */
describe('u-field ↔ 슬롯 컨트롤 라벨 연결', () => {
  beforeEach(() => { document.body.innerHTML = ''; resetDevWarnings(); });

  async function mount(markup: string): Promise<void> {
    document.body.innerHTML = markup;
    const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
    for (const el of all) if (el.updateComplete) await el.updateComplete;
    await new Promise((r) => setTimeout(r, 30));
  }
  const byId = (id: string) => document.getElementById(id)!;
  const shadow = (id: string, sel: string) => byId(id).shadowRoot!.querySelector(sel);

  it('레퍼런스 레시피 형태가 내부 네이티브 input 에 이름을 준다', async () => {
    await mount('<u-field label="Keyword"><u-input id="i"></u-input></u-field>');
    expect((shadow('i', 'input') as HTMLInputElement).getAttribute('aria-label')).toBe('Keyword');
  });

  it('u-select 도 같은 경로로 이름을 받는다', async () => {
    await mount('<u-field label="Status"><u-select id="s"></u-select></u-field>');
    expect(byId('s').getAttribute('aria-label')).toBe('Status');
  });

  it('description 은 aria-description 으로 내려간다 (요청자 곁가지)', async () => {
    await mount('<u-field label="Keyword" description="Order number"><u-input id="i"></u-input></u-field>');
    expect((shadow('i', 'input') as HTMLInputElement).getAttribute('aria-description')).toBe('Order number');
  });

  it('네이티브 엘리먼트를 슬롯하면 그 엘리먼트가 직접 이름을 받는다', async () => {
    await mount('<u-field label="Native"><input id="n"></u-field>');
    expect(byId('n').getAttribute('aria-label')).toBe('Native');
  });

  it('바깥 라벨이 있어도 컨트롤의 내부 u-field 는 라벨을 그리지 않는다 — 중복 렌더 없음', async () => {
    await mount('<u-field label="Keyword"><u-input id="i"></u-input></u-field>');
    const innerField = shadow('i', 'u-field') as HTMLElement;
    expect(innerField.shadowRoot!.querySelector('.header')!.hasAttribute('hidden')).toBe(true);
  });

  it('라벨을 동적으로 바꾸면 따라간다', async () => {
    await mount('<u-field id="f" label="Before"><u-input id="i"></u-input></u-field>');
    (byId('f') as HTMLElement & { label?: string }).label = 'After';
    await (byId('f') as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    await new Promise((r) => setTimeout(r, 30));
    expect((shadow('i', 'input') as HTMLInputElement).getAttribute('aria-label')).toBe('After');
  });

  it('호스트의 aria-label 은 u-field 없이도 내부로 전달된다 (docket #75 처방의 폼 컨트롤 확장)', async () => {
    await mount('<u-input id="i" aria-label="HostAria"></u-input>');
    expect((shadow('i', 'input') as HTMLInputElement).getAttribute('aria-label')).toBe('HostAria');
  });

  it('focus() 가 u-* 컨트롤에 닿는다 — 종전에는 네이티브만 닿았다', async () => {
    await mount('<u-field id="f" label="Keyword"><u-input id="i"></u-input></u-field>');
    (byId('f') as HTMLElement).focus();
    await new Promise((r) => setTimeout(r, 30));
    expect(document.activeElement?.id).toBe('i');
  });

  it('라벨 클릭이 u-* 컨트롤로 포커스를 넘긴다', async () => {
    await mount('<u-field id="f" label="Keyword"><u-input id="i"></u-input></u-field>');
    (shadow('f', 'label') as HTMLElement).click();
    await new Promise((r) => setTimeout(r, 30));
    expect(document.activeElement?.id).toBe('i');
  });

  it('u-switch 의 label 속성이 눈에 보이는 라벨을 그린다 (조사 중 발견한 죽은 선언)', async () => {
    await mount('<u-switch id="w" label="SwitchLabel"></u-switch>');
    expect((shadow('w', '.label') as HTMLElement).textContent!.trim()).toContain('SwitchLabel');
  });

  // ── NEGATIVE — 침묵해야 하는 입력 ───────────────────────────────────────────

  it('NEGATIVE: 컨트롤이 자기 label 을 가지면 덮지 않는다 (WCAG 2.5.3)', async () => {
    await mount('<u-field label="Outer"><u-input id="i" label="Own"></u-input></u-field>');
    expect((shadow('i', 'input') as HTMLInputElement).getAttribute('aria-label')).toBe('Own');
  });

  it('NEGATIVE: 소비자가 준 aria-label 을 덮지 않는다', async () => {
    await mount('<u-field label="Outer"><input id="n" aria-label="Consumer"></u-field>');
    expect(byId('n').getAttribute('aria-label')).toBe('Consumer');
  });

  it('NEGATIVE: 필드에 라벨이 없으면 아무것도 얹지 않는다', async () => {
    await mount('<u-field><u-input id="i"></u-input></u-field>');
    expect(byId('i').hasAttribute('aria-label')).toBe(false);
  });

  it('NEGATIVE: aria-labelledby 를 가진 컨트롤은 건드리지 않는다', async () => {
    await mount('<span id="ext">External</span><u-field label="Outer"><input id="n" aria-labelledby="ext"></u-field>');
    expect(byId('n').hasAttribute('aria-label')).toBe(false);
  });
});

describe('u-field 개발 모드 경고', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => { document.body.innerHTML = ''; resetDevWarnings(); warn = vi.spyOn(console, 'warn').mockImplementation(() => {}); });
  afterEach(() => { warn.mockRestore(); });

  const ours = () => (warn.mock.calls as unknown[][]).filter((c) => /^\[@iyulab\/components\] u-field/.test(String(c[0])));
  async function mount(markup: string): Promise<void> {
    document.body.innerHTML = markup;
    const all = Array.from(document.body.querySelectorAll('*')) as (HTMLElement & { updateComplete?: Promise<unknown> })[];
    for (const el of all) if (el.updateComplete) await el.updateComplete;
    await new Promise((r) => setTimeout(r, 60));
  }

  it('라벨은 있는데 컨트롤이 없으면 경고한다 — 그 라벨은 아무것도 가리키지 않는다', async () => {
    await mount('<u-field label="Orphan"><span>not a control</span></u-field>');
    expect(ours().length).toBe(1);
  });

  it('필드와 컨트롤이 둘 다 label 을 가지면 경고한다 — 라벨이 두 번 그려진다', async () => {
    await mount('<u-field label="Outer"><u-input label="Own"></u-input></u-field>');
    expect(ours().length).toBe(1);
  });

  it('NEGATIVE: 정상 형태는 침묵한다', async () => {
    await mount('<u-field label="Keyword"><u-input></u-input></u-field>');
    expect(ours().length).toBe(0);
  });

  it('NEGATIVE: 라벨 없는 필드는 컨트롤이 없어도 침묵한다', async () => {
    await mount('<u-field><span>text</span></u-field>');
    expect(ours().length).toBe(0);
  });

  /**
   * 🔴**cycle-639 — 위 넷은 전부 «보이는» 상태로 마운트한다. 그 시야 밖에 결함이 살아 있었다.**
   *
   * 판정이 `isFocusable()`(tabbable)로 후보를 골랐고 그 기본 `displayCheck` 는 **렌더 여부를
   * 본다** ⇒ `display:none` 하위에서 처음 렌더되면 **정상 컨트롤이 «없는 것» 이 됐다.** 발견은
   * 우리 자신의 레퍼런스 앱(`house-style`)에서다 — 로그인 폼이 700ms 뒤 열리는 `u-drawer`
   * 안에 있어 첫 렌더가 숨겨진 상태였고, 열린 뒤 접근성 트리는 `textbox "Username"` 으로
   * **정상**이었다. 닫힌 드로어·접힌 아코디언·비활성 탭 패널·마법사의 다음 단계는
   * 이 스택이 겨냥한 LOB 화면형 그 자체다.
   *
   * ⚠**그리고 오탐 자체보다 그 다음이 나쁘다** — 키가 평평해 오탐이 «한 번뿐인 예산» 을 먼저
   * 쓰면 같은 페이지의 **진짜 위반이 조용히 억제된다.** 마지막 두 케이스가 그 축을 고정한다.
   */
  describe('가시성 축 — 숨겨진 컨테이너 (cycle-639)', () => {
    async function mountHidden(markup: string): Promise<void> {
      await mount(`<div id="hidden-host" style="display:none">${markup}</div>`);
    }

    // 이 패키지가 내부적으로 u-field 를 쓰는 여덟 중, 슬롯 안쪽이 서로 다른 형태인 것들.
    // (네이티브 input/textarea · tabindex 트리거 · tabindex thumb — 구조 술어의 세 갈래를 덮는다)
    it.each([
      ['u-input', '<u-input label="HiddenInput"></u-input>'],
      ['u-textarea', '<u-textarea label="HiddenTextarea"></u-textarea>'],
      ['u-select', '<u-select label="HiddenSelect"></u-select>'],
    ])('NEGATIVE: %s 가 숨겨진 컨테이너에서 처음 렌더돼도 침묵한다', async (_name, markup) => {
      await mountHidden(markup);
      expect(ours(), `숨김 상태는 구조를 바꾸지 않는다 — 발화하면 정상 폼을 고발하는 것이다`).toHaveLength(0);
    });

    it('NEGATIVE: 숨겨진 u-field + u-input 조합도 침묵한다', async () => {
      await mountHidden('<u-field label="HiddenWrapped"><u-input></u-input></u-field>');
      expect(ours()).toHaveLength(0);
    });

    it('숨겨진 채로만 존재하는 «진짜» 위반은 여전히 발화한다', async () => {
      await mountHidden('<u-field label="HiddenOrphan"><span>not a control</span></u-field>');
      expect(ours(), '숨김을 통째로 면제하면 이 자리를 영구히 놓친다').toHaveLength(1);
    });

    it('비활성 컨트롤은 위반이 아니다 — 라벨이 가리킬 대상은 그대로다', async () => {
      await mount('<u-field label="DisabledOne"><input disabled></u-field>');
      expect(ours()).toHaveLength(0);
    });

    it('예산 축: 라벨이 다른 위반은 각각 한 번씩 발화한다', async () => {
      await mount('<u-field label="OrphanA"><span>x</span></u-field><u-field label="OrphanB"><span>y</span></u-field>');
      expect(ours(), '키가 평평하면 첫 하나만 보이고 나머지는 사라진다').toHaveLength(2);
    });

    it('예산 축: 오탐이 있었더라도 뒤따르는 진짜 위반을 삼키지 않는다', async () => {
      await mountHidden('<u-input label="CorrectButHidden"></u-input>');
      document.body.insertAdjacentHTML('beforeend', '<u-field label="RealViolation"><span>x</span></u-field>');
      await new Promise((r) => setTimeout(r, 60));
      expect(ours().map(String).join(' ')).toContain('RealViolation');
    });
  });
});
