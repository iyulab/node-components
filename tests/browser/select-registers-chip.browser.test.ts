import { describe, it, expect } from 'vitest';
// Only this module — the deep-import path the docs teach. Nothing else may register `u-chip` here.
import '../../src/components/select/USelect.js';

/**
 * A deep import of `u-select` registers everything it renders. It rendered multi-select chips as `<u-chip>` but
 * imported `UChip` for a type only, so the build dropped the import: with `u-select` alone, the chips were undefined
 * elements (the barrel import hid it — another module registered `u-chip`).
 */
describe('u-select registers what it renders', () => {
  it('u-chip is defined after importing only u-select', () => {
    expect(customElements.get('u-chip')).toBeDefined();
  });
});
