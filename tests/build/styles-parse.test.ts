import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join, basename } from 'path';

const root = resolve(__dirname, '../..');
const styleFiles = () => globSync('src/components/**/*.styles.ts', { cwd: root });

/**
 * When a `css` tagged template breaks, **the test doesn't fail — it becomes "0 tests".**
 *
 * The actual shape this took: putting a backtick inside a CSS comment ended the template
 * literal right there, making the whole file unparseable, and a browser test that imports
 * that file reported `Tests  no tests` — neither green nor red, just **silence**. Running
 * just that one file would have read as a pass; it was only caught by eyeballing the total
 * file count (25).
 *
 * This check exists to break that silence. It's placed in the unit project, which runs in
 * node, so it's caught instantly without a browser.
 */
describe('style sheet parse integrity', () => {
  // importing 40-odd files through the vite transform can exceed the default 5s.
  // (this is the kind of thing that passes standalone and only surfaces on a full run, so it's given generous headroom explicitly.)
  it('every *.styles.ts imports successfully', async () => {
    const results = await Promise.all(
      styleFiles().map(async rel => {
        try {
          const mod = await import(/* @vite-ignore */ join(root, rel));
          return mod.styles ? null : `${basename(rel)}: does not export styles`;
        } catch (e) {
          return `${basename(rel)}: ${(e as Error).message.split('\n')[0]}`;
        }
      }),
    );
    expect(results.filter(Boolean)).toEqual([]);
  }, 30_000);

  it('no backtick inside a css template (comments included)', async () => {
    // if the import check above catches the symptom, this check names the **cause**.
    // a backtick ends the template even inside a comment, so the parse error message
    // points somewhere unrelated to the cause (e.g. the next line's semicolon), which
    // makes diagnosis slow.
    const offenders: string[] = [];
    for (const rel of styleFiles()) {
      const src = readFileSync(join(root, rel), 'utf-8');
      const m = src.match(/\bcss`([\s\S]*)`\s*;/);
      if (!m) { offenders.push(`${basename(rel)}: could not find a css template`); continue; }
      if (m[1].includes('`')) offenders.push(`${basename(rel)}: has a backtick inside its css template`);
    }
    expect(offenders).toEqual([]);
  });
});
