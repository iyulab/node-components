/**
 * Element event typing — **compiling is the test** (main `tsconfig` includes `tests/**`, so `npm run typecheck`
 * runs it; nothing executes).
 *
 * Custom events with a generic name (`search`, a non-bubbling `change`) are typed per element, not on the
 * global event map: `change` is already the native `Event` there, and other libraries use the same names.
 * Before, `select.addEventListener('search', (e) => e.detail.query)` failed to compile.
 */
import '../src/components/select/USelect.js';
import '../src/components/tab-panel/UTabPanel.js';

export function typedElementEvents(): void {
  const select = document.createElement('u-select');
  select.addEventListener('search', (e) => {
    const query: string = e.detail.query;
    void query;
  });
  // The native form-control events keep their DOM types.
  select.addEventListener('input', (e) => {
    const event: Event = e;
    void event;
  });

  const tabs = document.createElement('u-tab-panel');
  tabs.addEventListener('change', (e) => {
    const detail: null = e.detail;
    void detail;
  });
}
