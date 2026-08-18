import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/expander/UExpander.js';

/**
 * `u-expander` — measures the disclosure's **three requirements** in a real browser.
 *
 * A consumer draft (`lob-layout-primitives` R3) asked for three things: **collapse/expand**
 * · **keyboard operation** · **respecting `prefers-reduced-motion`**. This measures them
 * here because jsdom can't reproduce any of the three — height is a grid-track
 * (`0fr`↔`1fr`) computation, media rules require reading the CSSOM, and "does it drop out
 * of tab order" is an actual focus move.
 *
 * ## 🔴 Why this component exists — «a property existing ≠ it working»
 *
 * `u-panel` only **declared** `collapsible` (rendering was a single `<slot>` · 0 style rules
 * · 0 handlers). But the published skill docs said *"Allow the panel to collapse"* — **as if
 * it worked.** The skill-doc cross-check built in cycle-197 measures «existence» and
 * «default value», so it was **green** — the property genuinely exists. ⇒ another variant of
 * a form this repo keeps recording (*a gate existing ≠ linting working* · *a token existing
 * ≠ being wired up* · *an axis existing ≠ reaching anywhere*).
 *
 * ## ⚠ Collapsed state is not judged by height alone
 *
 * Collapsing with `overflow: hidden` alone leaves **the collapsed content still in the
 * accessibility tree and tab order** — a defect invisible to the eye where tab still enters
 * content that's gone from the screen. So height (⑴) and **focus reachability** (⑷) are
 * measured separately. ⑷ is this file's negative control: drop the `visibility` transition
 * and ⑴ keeps passing while only ⑷ breaks.
 */

const mount = async (html: string) => {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  const el = host.firstElementChild as HTMLElement & {
    updateComplete: Promise<unknown>;
    open: boolean;
    toggle(): boolean;
  };
  await el.updateComplete;
  return el;
};

const headerOf = (el: HTMLElement) =>
  el.shadowRoot!.querySelector<HTMLButtonElement>('[part="header"]')!;
const contentOf = (el: HTMLElement) =>
  el.shadowRoot!.querySelector<HTMLElement>('[part="content"]')!;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('u-expander — collapse/expand', () => {
  it('⑴ collapsed content occupies no height, and occupies height when expanded', async () => {
    const el = await mount(`<u-expander label="Title"><p style="height:120px">Body</p></u-expander>`);

    expect(contentOf(el).getBoundingClientRect().height).toBe(0);

    el.open = true;
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 400)); // wait for the transition to finish

    expect(contentOf(el).getBoundingClientRect().height).toBeGreaterThan(100);
  });

  it('⑵ clicking the header flips the state and aria-expanded follows', async () => {
    const el = await mount(`<u-expander label="Title">Body</u-expander>`);
    const header = headerOf(el);

    expect(header.getAttribute('aria-expanded')).toBe('false');

    header.click();
    await el.updateComplete;
    expect(el.open).toBe(true);
    expect(header.getAttribute('aria-expanded')).toBe('true');

    header.click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });

  it('⑵-b canceling `expand` prevents opening (the event is the gate)', async () => {
    const el = await mount(`<u-expander label="Title">Body</u-expander>`);
    el.addEventListener('expand', e => e.preventDefault());

    headerOf(el).click();
    await el.updateComplete;

    expect(el.open).toBe(false);
  });

  it('⑵-c does not open when `disabled`', async () => {
    const el = await mount(`<u-expander label="Title" disabled>Body</u-expander>`);
    headerOf(el).click();
    await el.updateComplete;
    expect(el.open).toBe(false);
  });
});

describe('u-expander — keyboard', () => {
  it('⑶ operable by keyboard alone — the header is a native button, so Enter/Space arrive as-is', async () => {
    const el = await mount(`<u-expander label="Title">Body</u-expander>`);
    const header = headerOf(el);

    header.focus();
    expect(el.shadowRoot!.activeElement).toBe(header);

    // a native button turns Enter/Space into a click — this confirms that contract.
    expect(header.tagName).toBe('BUTTON');
    expect(header.type).toBe('button');

    header.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    header.click(); // the one step the browser does on the component's behalf
    await el.updateComplete;

    expect(el.open).toBe(true);
  });

  it('⑷ 🔴collapsed content drops out of tab order — a condition height:0 alone does not satisfy', async () => {
    const el = await mount(
      `<u-expander label="Title"><button id="inner">Inner button</button></u-expander>`,
    );
    const inner = el.querySelector<HTMLButtonElement>('#inner')!;

    inner.focus();
    expect(document.activeElement).not.toBe(inner); // visibility: hidden ⇒ cannot be focused

    el.open = true;
    await el.updateComplete;
    await new Promise(r => setTimeout(r, 400));

    inner.focus();
    expect(document.activeElement).toBe(inner);
  });
});

describe('u-expander — prefers-reduced-motion', () => {
  it('⑸ the transition is «decoration», so it stops under reduce (read via CSSOM)', async () => {
    const el = await mount(`<u-expander label="Title">Body</u-expander>`);

    const reduceRules = [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
      .flatMap(s => [...s.cssRules])
      .filter(
        (r): r is CSSMediaRule =>
          r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'),
      )
      .flatMap(m => [...m.cssRules]) as CSSStyleRule[];

    expect(reduceRules.length).toBeGreaterThan(0);
    const stopped = reduceRules.filter(r => r.style.transitionDuration === '0s');
    expect(stopped.length).toBeGreaterThan(0);
    // does the selector actually cover this component's two transition targets
    expect(stopped.some(r => r.selectorText.includes('.content'))).toBe(true);
    expect(stopped.some(r => r.selectorText.includes('.icon'))).toBe(true);
  });
});
