import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '../..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as {
  exports: Record<string, unknown>;
  files: string[];
};

/**
 * Convention: **whatever `exports` points to must actually exist in the published package.**
 *
 * ★Why this file exists: `exports['./plugins/*']` pointed at `./plugins/*`, and `files`
 * declared `plugins/**\/*.js`, but that `.js` **stopped being generated** for a while (after
 * switching to `noEmit` for type-checking only). The declaration stayed while the output
 * disappeared.
 *
 * This defect's nature is nasty — **this repo shows no symptoms at all.** A local build
 * reads the `.ts` source directly via relative paths, and this package's own tests pass. It
 * breaks in **a different package's build that installed the published package**, and even
 * that stays dormant until a caret range picks up the new version. Two consumer packages
 * actually looked fine through **four releases** before failing all at once.
 *
 * ⇒ The publish contract must be checked **on the publishing side.** The consuming side
 * finds out far too late.
 *
 * ★2026-08-05: `exports`'s `.` switched to SRC form (`./src/index.js` etc.) — locally it
 * reads the source directly, and at publish time the release workflow rewrites `src/` →
 * `dist/` (the same policy as the root `exports-check.js`). Since this test's purpose is to
 * verify the **published form**, it applies the same rewrite before checking existence —
 * without the rewrite, `./src/index.d.ts` isn't a real path in the repo, so it would fire on
 * a legitimate SRC-form entry.
 */
describe('publish contract — exports targets actually exist', () => {
  const targets = () =>
    Object.entries(pkg.exports)
      .flatMap(([spec, value]) => {
        const paths = typeof value === 'string' ? [value] : Object.values(value as object);
        return paths.map(p => [spec, String(p)] as const);
      })
      .filter(([, p]) => p.startsWith('./'))
      .map(([spec, p]) => [spec, p.replace(/^\.\/src\//, './dist/')] as const);

  it('every non-wildcard entry point exists', () => {
    const missing = targets()
      .filter(([, p]) => !p.includes('*'))
      .filter(([, p]) => !existsSync(join(root, p)));
    // if dist doesn't exist at all (pre-build), this test can't mean anything — skip.
    if (!existsSync(join(root, 'dist'))) return;
    expect(missing.map(([spec, p]) => `${spec} → ${p}`)).toEqual([]);
  });

  it('★a wildcard entry point\'s directory has output in it', () => {
    if (!existsSync(join(root, 'dist'))) return;
    const emptyDirs = targets()
      .filter(([, p]) => p.includes('*'))
      .map(([spec, p]) => [spec, p.slice(0, p.indexOf('*'))] as const)
      .filter(([, dir]) => !existsSync(join(root, dir)));
    // this is exactly how `./plugins/*` was empty — the mapping stayed while the output disappeared.
    expect(emptyDirs.map(([spec, dir]) => `${spec} → ${dir}(missing)`)).toEqual([]);
  });

  it('the plugin entry point is inside what gets published', () => {
    // a consuming package's vite.config imports this by package name.
    // `files` includes dist, so it must live under dist to ship.
    expect(String(pkg.exports['./plugins/*'])).toMatch(/^\.\/dist\//);
    expect(pkg.files).toContain('dist');
    // and `files` must not keep a path with no matching output — a dead declaration
    // creates the illusion that *"it's shipped"*.
    expect(pkg.files.filter(f => f.startsWith('plugins/'))).toEqual([]);
  });
});
