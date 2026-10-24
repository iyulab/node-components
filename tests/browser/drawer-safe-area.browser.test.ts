import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import '../../src/components/drawer/UDrawer.js';

/**
 * The panel keeps its content off the screen edges it touches — a notch or a home indicator would otherwise sit over
 * the header's close button or the footer's actions when a side drawer fills a phone screen. The insets come from
 * `env(safe-area-inset-*)`, emulated here through CDP. NEGATIVE: with no insets nothing moves, and a right-hand drawer
 * does not take the left inset.
 */
type Drawer = HTMLElement & { open: boolean; updateComplete: Promise<unknown> };

const session = () => cdp() as unknown as { send(method: string, params?: object): Promise<unknown> };
let meta: HTMLMetaElement | undefined;

afterEach(async () => {
  document.body.innerHTML = '';
  meta?.remove();
  meta = undefined;
  await session().send('Emulation.setSafeAreaInsetsOverride', { insets: {} }).catch(() => undefined);
});

async function mount(placement: string): Promise<HTMLElement> {
  const d = document.createElement('u-drawer') as Drawer;
  d.setAttribute('placement', placement);
  d.innerHTML = '<span slot="header">Title</span><p>Body</p><span slot="footer">Footer</span>';
  document.body.appendChild(d);
  await d.updateComplete;
  return d.shadowRoot!.querySelector('.panel') as HTMLElement;
}

const pad = (el: HTMLElement) => {
  const s = getComputedStyle(el);
  return { top: s.paddingTop, right: s.paddingRight, bottom: s.paddingBottom, left: s.paddingLeft };
};

describe('u-drawer — safe area', () => {
  it('NEGATIVE without insets the panel has no padding', async () => {
    expect(pad(await mount('right'))).toEqual({ top: '0px', right: '0px', bottom: '0px', left: '0px' });
  });

  it('a side drawer stays inside the top, bottom and its own edge; not the far edge', async () => {
    meta = document.createElement('meta');
    meta.name = 'viewport';
    meta.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    document.head.appendChild(meta);
    await session().send('Emulation.setSafeAreaInsetsOverride', { insets: { top: 44, right: 30, bottom: 34, left: 20 } });
    expect(pad(await mount('right'))).toEqual({ top: '44px', right: '30px', bottom: '34px', left: '0px' });
    document.body.innerHTML = '';
    expect(pad(await mount('left'))).toEqual({ top: '44px', right: '0px', bottom: '34px', left: '20px' });
    document.body.innerHTML = '';
    expect(pad(await mount('bottom'))).toEqual({ top: '0px', right: '30px', bottom: '34px', left: '20px' });
  });
});
