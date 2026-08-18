import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/tree/UTree.js';

/**
 * Convention: **component typography scales with the inherited `font-size`.**
 *
 * `u-tree` was the only component still using `rem`. `rem` is **root-relative**, so if a
 * consumer scales up a container's typography, the tree doesn't follow — it ends up
 * relatively smaller inside that container.
 *
 * ⚠**The two units happen to match in the default case** (root 16px → `0.875rem` =
 * `0.875em` = 14px). So this regression only shows up **once a consumer adjusts
 * typography**, and stays invisible forever in the default storybook/demo. That asymmetry
 * is why this test exists.
 */
describe('u-tree relative typography', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    document.documentElement.style.fontSize = '';
  });

  async function mountIn(containerFontSize: string) {
    const box = document.createElement('div');
    box.style.fontSize = containerFontSize;
    document.body.appendChild(box);
    const tree = document.createElement('u-tree') as HTMLElement & { updateComplete: Promise<unknown> };
    box.appendChild(tree);
    await tree.updateComplete;
    return tree;
  }

  it('is the same size as before in the default context (zero visual change)', async () => {
    const tree = await mountIn('16px');
    expect(getComputedStyle(tree).fontSize).toBe('14px'); // 0.875 × 16
  });

  it('grows when the container typography grows', async () => {
    const tree = await mountIn('24px');
    // With `rem` this would stay pinned at 14px, reading off the root (16px) — that's the behavior being fixed.
    expect(getComputedStyle(tree).fontSize).toBe('21px'); // 0.875 × 24
  });

  it('does not depend on the root font size', async () => {
    document.documentElement.style.fontSize = '20px';
    const tree = await mountIn('16px');
    // With `rem` this would become 17.5px — the container stays the same but only the tree grows, which is also a defect.
    expect(getComputedStyle(tree).fontSize).toBe('14px');
    document.documentElement.style.fontSize = '';
  });
});
