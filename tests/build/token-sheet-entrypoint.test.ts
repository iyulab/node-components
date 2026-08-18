import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(join(root, p), 'utf-8');

/**
 * Pins, as a contract, the **static path** by which design tokens get into a document.
 *
 * Background: token injection had exactly one path — a runtime call to `Theme.init()` — and
 * the app shell (`@iyulab/modern-app`) was the one calling it. A screen rendered **outside**
 * the shell (login, onboarding, an embed) uses the same components but never got the
 * tokens, rendering **unstyled with no error** — this actually happened in production. The
 * static entry point breaks that coupling.
 */
describe('design-token static entry point', () => {
  it('package.json publishes ./styles/*', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.exports['./styles/*']).toBe('./dist/styles/*');
  });

  it('tokens.css pulls in both light and dark', () => {
    const css = read('src/assets/styles/tokens.css');
    expect(css).toMatch(/@import\s+['"]\.\/light\.css['"]/);
    expect(css).toMatch(/@import\s+['"]\.\/dark\.css['"]/);
  });

  it('the dark sheet is attribute-scoped, so it coexists safely with light', () => {
    // if both were `:root`, a static import would always let whichever comes later win, pinning dark permanently.
    expect(read('src/assets/styles/dark.css')).toMatch(/:root\[theme="dark"\]/);
    expect(read('src/assets/styles/light.css')).toMatch(/^:root\s*\{/m);
  });

  it('the build output includes all three sheets', () => {
    // skip if dist doesn't exist (tests-only run) — confirm the contract when it does.
    if (!existsSync(join(root, 'dist/styles'))) return;
    for (const f of ['light.css', 'dark.css', 'tokens.css']) {
      expect(existsSync(join(root, 'dist/styles', f)), `dist/styles/${f}`).toBe(true);
    }
  });

  it('Theme\'s inline bundle does not include tokens.css', () => {
    // inside an inlined <style>, a relative @import resolves against the document and breaks.
    // if the glob widens to `*.css`, this check catches it.
    const theme = read('src/utilities/Theme.ts');
    const glob = theme.match(/import\.meta\.glob\(\s*['"]([^'"]+)['"]/);
    expect(glob, 'Theme inlines the sheets via import.meta.glob').toBeTruthy();
    expect(glob![1]).not.toMatch(/\*\.css$/);
    expect(glob![1]).toMatch(/\{light,dark\}\.css$/);
  });

  it('warns about missing tokens in a dev build', () => {
    const el = read('src/components/UElement.ts');
    expect(el).toMatch(/import\.meta\.env\?\.DEV/);
    expect(el).toMatch(/getPropertyValue\('--u-blue-600'\)/);
  });

  it('the docs point to the static entry point', () => {
    // "it's provided" and "it's discoverable" are different things — this entry point
    // already existed but wasn't documented, so a consumer never found it, and a
    // production screen broke as a result.
    for (const doc of ['README.md', 'docs/theming.md']) {
      expect(read(doc), doc).toContain("@iyulab/components/styles/tokens.css");
    }
  });
});
