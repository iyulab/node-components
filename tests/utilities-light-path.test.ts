// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, join } from 'path';

/**
 * A utility's own module (`@iyulab/components/dist/utilities/<name>.js`) is the light path the docs teach to apps that
 * import components one by one — the barrel registers every component even when one value is taken from it. That path
 * stays light only while no utility reaches a component module (each one registers a tag as a side effect).
 */
const SRC = resolve(__dirname, '../src');
const UTILITIES = join(SRC, 'utilities');

/** Relative value imports of a module (type-only imports are erased by the build). */
function relativeImports(file: string): string[] {
  const src = readFileSync(file, 'utf-8');
  const out: string[] = [];
  for (const m of src.matchAll(/^\s*(?:import|export)\s+(?!type\b)(?:[^'"]*?\sfrom\s+)?['"](\.[^'"]+)['"]/gm)) out.push(m[1]);
  return out;
}

function resolveTs(from: string, spec: string): string | null {
  const base = resolve(dirname(from), spec).replace(/\.js$/, '');
  for (const candidate of [`${base}.ts`, join(base, 'index.ts')]) if (existsSync(candidate)) return candidate;
  return null;
}

/** Every module a file reaches through relative value imports. */
function reach(entry: string): Set<string> {
  const seen = new Set<string>();
  const stack = [entry];
  while (stack.length) {
    const file = stack.pop()!;
    if (seen.has(file)) continue;
    seen.add(file);
    for (const spec of relativeImports(file)) {
      const next = resolveTs(file, spec);
      if (next) stack.push(next);
    }
  }
  return seen;
}

describe('utility modules are a light path', () => {
  const utilities = readdirSync(UTILITIES).filter((f) => f.endsWith('.ts') && !f.endsWith('.d.ts'));

  it('finds the utility modules', () => {
    expect(utilities).toEqual(expect.arrayContaining(['Theme.ts', 'Toast.ts', 'Locale.ts', 'Dialog.ts', 'format.ts']));
  });

  const reached = (name: string) =>
    [...reach(join(UTILITIES, name))].map((f) => f.slice(SRC.length + 1).replace(/\\/g, '/'));

  it.each(utilities)('%s does not reach the barrel', (name) => {
    expect(reached(name)).not.toContain('index.ts');
  });

  it('Dialog loads the prompt input on demand — alert and confirm do not carry it', () => {
    expect(reached('Dialog.ts')).not.toContain('components/input/UInput.ts');
    expect(readFileSync(join(UTILITIES, 'Dialog.ts'), 'utf-8')).toMatch(/await import\(['"]\.\.\/components\/input\/UInput\.js['"]\)/);
  });

  // Dialog and Toast draw elements, so they register what they draw — every other utility registers nothing.
  const DRAWS = new Set(['Dialog.ts', 'Toast.ts']);
  it.each(utilities.filter((n) => !DRAWS.has(n)))('%s reaches no component module', (name) => {
    expect(reached(name).filter((f) => f.startsWith('components/') && /\/U[A-Z]\w*\.ts$/.test(f))).toEqual([]);
  });
});
