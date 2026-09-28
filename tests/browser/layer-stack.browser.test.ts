import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/popover/UPopover.js';
import '../../src/components/dialog/UDialog.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';
import type { UDialog } from '../../src/components/dialog/UDialog.js';
import { OverlayManager } from '../../src/utilities/OverlayManager.js';

/**
 * 층 스택 — «한 번의 Escape 는 가장 위 층 하나만 닫는다», 그리고 «가장 위» 는 «가장 나중에 연» 이다.
 *
 * 층마다 제 리스너로 Escape 를 받던 동안 순서는 «리스너를 등록한 순서» 였고, 그것이 층이 쌓인 순서와
 * 달라 세 가지가 샜다: 팝오버 안에서 연 하위 팝오버가 Escape 한 번에 둘 다 닫혔고, 앱 셸 패널 안에서
 * 나중에 연 층보다 셸이 먼저 돌아 바깥을 닫았고, 앱이 먼저 건 window 리스너는 소비 전의 키를 봤다.
 * 이 파일은 그 셋을 실제 키 입력으로 잰다(흉내 낸 층이 아니라 실제 컴포넌트로).
 */

const settle = (ms = 120) => new Promise(r => setTimeout(r, ms));

function popover(anchor: HTMLElement, text: string, dismiss?: string): UPopover {
  const p = document.createElement('u-popover') as UPopover;
  if (dismiss) p.setAttribute('dismiss', dismiss);
  const b = document.createElement('button');
  b.textContent = text;
  p.appendChild(b);
  p.anchors = [anchor];
  return p;
}

describe('layer stack — Escape closes the topmost layer only', () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    await settle(50);
  });

  it('a popover opened inside a popover closes alone; the next Escape closes the outer one', async () => {
    const trigger = document.createElement('button');
    trigger.textContent = 'outer';
    document.body.appendChild(trigger);
    const outer = popover(trigger, 'inner trigger');
    document.body.appendChild(outer);
    await outer.show(trigger);
    const innerTrigger = outer.querySelector('button')!;
    const inner = popover(innerTrigger, 'leaf');
    document.body.appendChild(inner);
    await inner.show(innerTrigger);
    await settle();

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(inner.open).toBe(false);
    expect(outer.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(outer.open).toBe(false);
  });

  it('a popover inside an open dialog closes first; the dialog closes on the next Escape', async () => {
    const dialog = document.createElement('u-dialog') as UDialog;
    const anchor = document.createElement('button');
    anchor.textContent = 'menu';
    dialog.appendChild(anchor);
    document.body.appendChild(dialog);
    await dialog.show();
    const pop = popover(anchor, 'item');
    document.body.appendChild(pop);
    await pop.show(anchor);
    await settle();

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(pop.open).toBe(false);
    expect(dialog.open).toBe(true);

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog.open).toBe(false);
  });

  it('an app listener on window, registered before any layer opened, sees the Escape as consumed', async () => {
    let seen: boolean | undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') seen = e.defaultPrevented; };
    window.addEventListener('keydown', onKey);
    try {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      const pop = popover(trigger, 'x');
      document.body.appendChild(pop);
      await pop.show(trigger);
      await settle();
      await userEvent.keyboard('{Escape}');
      await settle();
      expect(pop.open).toBe(false);
      expect(seen).toBe(true);
    } finally {
      window.removeEventListener('keydown', onKey);
    }
  });

  it('NEGATIVE — with no layer open, Escape is left alone', async () => {
    let seen: boolean | undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') seen = e.defaultPrevented; };
    window.addEventListener('keydown', onKey);
    try {
      document.body.appendChild(document.createElement('button'));
      await userEvent.keyboard('{Escape}');
      expect(seen).toBe(false);
    } finally {
      window.removeEventListener('keydown', onKey);
    }
  });

  it('NEGATIVE — a popover that does not dismiss on Escape is not a layer; the dialog beneath closes', async () => {
    const dialog = document.createElement('u-dialog') as UDialog;
    const anchor = document.createElement('button');
    dialog.appendChild(anchor);
    document.body.appendChild(dialog);
    await dialog.show();
    const pop = popover(anchor, 'sticky', 'click');
    document.body.appendChild(pop);
    await pop.show(anchor);
    await settle();

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog.open).toBe(false);
    expect(pop.open).toBe(true);
  });

  it('a layer that declines (onEscape returns false) leaves the Escape unconsumed and closes nothing', async () => {
    const panel = document.createElement('div');
    document.body.appendChild(panel);
    let asked = 0;
    let seen: boolean | undefined;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') seen = e.defaultPrevented; };
    window.addEventListener('keydown', onKey);
    OverlayManager.openLayer(panel, () => { asked++; return false; });
    try {
      await userEvent.keyboard('{Escape}');
      await settle();
      expect(asked).toBe(1);
      expect(seen).toBe(false);
      expect(OverlayManager.topLayer).toBe(panel);
    } finally {
      OverlayManager.closeLayer(panel);
      window.removeEventListener('keydown', onKey);
    }
  });

  it('an app-owned layer opened over a dialog is closed first', async () => {
    const dialog = document.createElement('u-dialog') as UDialog;
    document.body.appendChild(dialog);
    await dialog.show();
    const panel = document.createElement('div');
    document.body.appendChild(panel);
    let closed = 0;
    OverlayManager.openLayer(panel, () => { closed++; OverlayManager.closeLayer(panel); });
    expect(OverlayManager.topLayer).toBe(panel);

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(closed).toBe(1);
    expect(dialog.open).toBe(true);
    expect(OverlayManager.topLayer).toBe(dialog);

    await userEvent.keyboard('{Escape}');
    await settle();
    expect(dialog.open).toBe(false);
  });
});
