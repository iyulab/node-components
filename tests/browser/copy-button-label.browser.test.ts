import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/copy-button/UCopyButton.js';
import type { UCopyButton } from '../../src/components/copy-button/UCopyButton.js';

/**
 * Capability gap ISSUE-20260715-ucopybutton-no-inline-label:
 * u-copy-button was icon-only (its default slot feeds the icon-button tooltip),
 * so a labeled copy button ("Copy results" + icon) could not reuse its clipboard
 * logic. Adds an additive `label` prop that renders a visible inline text label
 * next to the icon, while the icon-only form (no label) stays unchanged.
 */
describe('u-copy-button inline label', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(attrs: Record<string, string>): Promise<UCopyButton> {
    const el = document.createElement('u-copy-button') as UCopyButton;
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('renders the label as visible text when `label` is set', async () => {
    const el = await mount({ label: 'Copy results', value: 'hello' });
    const btn = el.shadowRoot!.querySelector('u-button');
    expect(btn).toBeTruthy();
    // The label text is projected as visible button content (not a tooltip).
    expect(btn!.textContent).toContain('Copy results');
  });

  it('stays icon-only (u-icon-button, no u-button) when `label` is absent', async () => {
    const el = await mount({ value: 'hello' });
    expect(el.shadowRoot!.querySelector('u-button')).toBeNull();
    expect(el.shadowRoot!.querySelector('u-icon-button')).toBeTruthy();
  });

  it('still dispatches the cancelable copy event from the labeled surface', async () => {
    const el = await mount({ label: 'Copy', value: 'payload' });
    let copiedText: string | undefined;
    el.addEventListener('copy', (e) => {
      copiedText = (e as ClipboardEvent).clipboardData?.getData('text/plain');
    });
    const btn = el.shadowRoot!.querySelector('u-button') as HTMLElement;
    btn.click();
    expect(copiedText).toBe('payload');
  });
});
