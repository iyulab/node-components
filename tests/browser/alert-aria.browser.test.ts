import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/alert/UAlert.js';

/**
 * u-alert didn't set its own role/aria-live, so consumers had to attach role="alert" at
 * every call site (screen-reader users missed dynamic appearances like a failed login).
 * Since status already expresses severity, role is derived from it (the WAI-ARIA
 * Alert/Status pattern) — error/warning get role="alert" (implicit assertive), everything
 * else gets role="status" (implicit polite).
 */
describe('u-alert ARIA role', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  async function mount(attrs: Record<string, string> = {}): Promise<HTMLElement> {
    const el = document.createElement('u-alert');
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await (el as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    return el;
  }

  it('status="error" is role="alert"', async () => {
    const el = await mount({ status: 'error' });
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('status="warning" is role="alert"', async () => {
    const el = await mount({ status: 'warning' });
    expect(el.getAttribute('role')).toBe('alert');
  });

  it('status="info" is role="status"', async () => {
    const el = await mount({ status: 'info' });
    expect(el.getAttribute('role')).toBe('status');
  });

  it('status="success" is role="status"', async () => {
    const el = await mount({ status: 'success' });
    expect(el.getAttribute('role')).toBe('status');
  });

  it('status="notice" is role="status" (treated as non-urgent notice)', async () => {
    const el = await mount({ status: 'notice' });
    expect(el.getAttribute('role')).toBe('status');
  });

  it('no status (default) is role="status" — with severity unknown, it does not interrupt assertively', async () => {
    const el = await mount();
    expect(el.getAttribute('role')).toBe('status');
  });

  it('aria-atomic="true" is always set (the whole content is read as one announcement)', async () => {
    const el = await mount({ status: 'error' });
    expect(el.getAttribute('aria-atomic')).toBe('true');
  });

  it('when status changes dynamically, role updates along with it', async () => {
    const el = await mount({ status: 'info' }) as HTMLElement & { status?: string; updateComplete: Promise<unknown> };
    expect(el.getAttribute('role')).toBe('status');

    el.status = 'error';
    await el.updateComplete;
    expect(el.getAttribute('role')).toBe('alert');
  });
});
