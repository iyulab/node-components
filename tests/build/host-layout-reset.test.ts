import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join, basename } from 'path';

const root = resolve(__dirname, '../..');

/**
 * Spacing/borders placed on `:host` get **wiped out** by a consumer app's CSS reset
 * (`* { padding:0; border:0; margin:0 }`) — because for a host element, author stylesheets
 * beat the shadow's own `:host` rules. There's no error and the component still works. It
 * just shrinks, so a consumer reads it as *"upstream looks ugly"* and repaints it themselves
 * (two consumer apps actually painted it differently, and one couldn't paint it at all,
 * running with a broken production screen).
 *
 * Tailwind preflight isn't a special case — it's the most common consumer environment.
 *
 * This check **stops the list from growing.** The baseline below is "not yet fixed", and it
 * shrinks with every fix. If a new component makes the same mistake, this fails immediately.
 */

/** The properties a document-level reset actually wipes out (width/height aren't a preflight target) */
const RESET_VULNERABLE = /^\s*(padding|margin|border)(-(top|right|bottom|left|inline|block|width|style))?\s*:/;

/**
 * Components that still keep spacing/borders on `:host`.
 *
 * Fixing this needs a wrapper element in the shadow DOM — since prefix/suffix slot directly
 * into the host's flex, the existing inner elements alone can't wrap everything. Introducing
 * a wrapper is a structural change that affects `::part` consumers, so it's a human decision
 * and lives in Pending Human Decisions.
 */
// ✅ empty — all 9 components now have reset resilience.
//
// ★ Recording why `UDivider` was the last one left, and why its stated reasoning was only
//   half right: *"`:host`'s margin is spacing between siblings, so moving it inside would
//   collapse it"* is only true **when moving margin**. Moving it to an inner element's
//   **padding** grows the host's own box instead, so siblings still get pushed apart as
//   before — and padding lives inside the shadow, so a document-level reset can't reach it.
//   Proven with an actual render measurement — `tests/browser/divider-spacing-reset.browser.test.ts`.
//   ⇒ it was worth reopening an item that had been written off as unsolvable.
const KNOWN_GAPS = new Set<string>([]);

function hostLayoutDeclarations(css: string): string[] {
  const found: string[] = [];
  for (const block of css.matchAll(/:host(\([^)]*\))?\s*\{([^}]*)\}/g)) {
    for (const line of block[2].split(';')) {
      if (RESET_VULNERABLE.test(line)) found.push(line.trim().split(':')[0].trim());
    }
  }
  return found;
}

describe(':host layout — CSS reset resilience', () => {
  const offenders = new Map<string, string[]>();
  for (const rel of globSync('src/components/**/*.styles.ts', { cwd: root })) {
    const comp = basename(rel).replace('.styles.ts', '');
    const decls = hostLayoutDeclarations(readFileSync(join(root, rel), 'utf-8'));
    if (decls.length) offenders.set(comp, decls);
  }

  it('a component outside the known list does not put spacing/borders on :host', () => {
    const unexpected = [...offenders.keys()].filter(c => !KNOWN_GAPS.has(c)).sort();
    expect(unexpected).toEqual([]);
  });

  it('a fixed component does not linger in the known list', () => {
    // if the list is wider than reality, a regression slips through — remove it the moment it's fixed.
    const stale = [...KNOWN_GAPS].filter(c => !offenders.has(c)).sort();
    expect(stale).toEqual([]);
  });

  it('u-button has its inner elements draw spacing and borders', () => {
    const css = readFileSync(join(root, 'src/components/button/UButton.styles.ts'), 'utf-8');
    expect(hostLayoutDeclarations(css), 'layout declarations left on :host').toEqual([]);
    // confirm it actually moved to the inner-element rule (removing the declaration alone would make the button disappear)
    expect(css).toMatch(/button,\s*a\s*\{[\s\S]*?padding:\s*var\(--btn-padding-block/);
    expect(css).toMatch(/button,\s*a\s*\{[\s\S]*?border:\s*1px solid var\(--btn-border-color/);
  });
});
