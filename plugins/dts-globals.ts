import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { createRequire } from 'module';
import { dirname, join, resolve } from 'path';

/**
 * Makes every published entry `.d.ts` self-contained with respect to its `declare global` blocks.
 *
 * Why this exists: a declaration bundler (`vite-plugin-dts` with `bundleTypes`, i.e. api-extractor)
 * copies the global augmentations of the whole source tree into **every** entry it rolls up — a
 * component module's `declare global { interface HTMLElementTagNameMap { 'u-x': UX } }` lands in
 * the main entry too — but it only keeps the declarations that entry itself reaches. The merge
 * body survives while the class it names does not, so a consumer that type-checks libraries
 * (`skipLibCheck: false`) fails with `TS2304: Cannot find name 'UX'` just for importing the
 * package. The same happens when the entry has the name only as a value (a React wrapper `const`),
 * which surfaces as `TS2749`.
 *
 * The fix keeps the augmentation (so `document.querySelector('u-x')` stays typed from any entry)
 * and points each dangling name at the public entry that exports it:
 * `'u-x': UX` becomes `'u-x': import('<package>/<subpath>').UX`. A tag whose class no entry
 * exports is a composed-only internal, so its map value becomes `HTMLElement` — the most specific
 * public type there is. Any other dangling name is left as it is: guessing would hide a real
 * export gap, and the published-declaration compile check is what reports it.
 *
 * Call it from the declaration plugin's `afterBuild` hook, after the bundled `.d.ts` files exist.
 */
export function fixPublishedDtsGlobals(packageRoot: string): void {
  const manifest = JSON.parse(readFileSync(join(packageRoot, 'package.json'), 'utf8')) as {
    name: string;
    exports?: Record<string, unknown>;
  };
  const entries = declarationEntries(manifest.exports ?? {})
    .map((entry) => ({ ...entry, path: resolve(packageRoot, entry.file) }))
    .filter((entry) => existsSync(entry.path));
  const sources = entries.map((entry) => ({ ...entry, source: readFileSync(entry.path, 'utf8') }));
  const exportedFrom = indexExportedTypes(manifest.name, sources);
  const globals = libGlobalNames(packageRoot);
  for (const entry of sources) {
    const fixed = resolveDanglingGlobals(entry.source, exportedFrom, globals);
    if (fixed !== entry.source) writeFileSync(entry.path, fixed);
  }
}

interface DeclarationEntry {
  /** Export key, `.` or `./sub`. */
  key: string;
  /** Built declaration file, relative to the package root. */
  file: string;
}

/**
 * Entry declaration files from the manifest's `exports`. A local manifest may point at `./src/…`
 * because the publish workflow rewrites `src/` to `dist/`; the built file is always under `dist/`.
 */
export function declarationEntries(exportsMap: Record<string, unknown>): DeclarationEntry[] {
  const out: DeclarationEntry[] = [];
  for (const [key, target] of Object.entries(exportsMap)) {
    if (!target || typeof target !== 'object') continue;
    const types = (target as Record<string, unknown>).types;
    if (typeof types !== 'string' || key.includes('*')) continue;
    out.push({ key, file: types.replace(/^\.\/src\//, './dist/') });
  }
  return out;
}

/**
 * `name → specifier` for every type-capable name an entry exports publicly. The main entry wins
 * when several entries export the same name.
 */
export function indexExportedTypes(
  packageName: string,
  entries: { key: string; source: string }[],
): Map<string, string> {
  const index = new Map<string, string>();
  const ordered = [...entries].sort((a, b) => (a.key === '.' ? -1 : b.key === '.' ? 1 : 0));
  for (const { key, source } of ordered) {
    const specifier = key === '.' ? packageName : `${packageName}/${key.replace(/^\.\//, '')}`;
    for (const name of exportedTypeNames(source)) if (!index.has(name)) index.set(name, specifier);
  }
  return index;
}

/** Type-capable names a declaration file exports (`export declare class X` · `export { X }` of a declared `X`). */
export function exportedTypeNames(source: string): Set<string> {
  const declared = localTypeNames(source);
  const exported = new Set<string>();
  for (const m of source.matchAll(/^export\s+declare\s+(?:abstract\s+)?(?:class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm)) {
    exported.add(m[1]);
  }
  for (const m of source.matchAll(/^export\s*\{([^}]*)\}\s*;?\s*$/gm)) {
    for (const part of m[1].split(',')) {
      const [local, alias] = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
      if (local && declared.has(local)) exported.add((alias ?? local).trim());
    }
  }
  return exported;
}

/** Names a declaration file can use as types: its own type declarations and its imports. */
export function localTypeNames(source: string): Set<string> {
  const names = new Set<string>();
  for (const m of source.matchAll(/^\s*(?:export\s+)?(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm)) {
    names.add(m[1]);
  }
  for (const m of source.matchAll(/^\s*import\s+(?:type\s+)?([^;]*?)\s+from\s+['"][^'"]+['"]/gm)) {
    const clause = m[1];
    const named = clause.match(/\{([^}]*)\}/);
    if (named) {
      for (const part of named[1].split(',')) {
        const bits = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/);
        const local = (bits[1] ?? bits[0]).trim();
        if (local) names.add(local);
      }
    }
    const rest = clause.replace(/\{[^}]*\}/, '').replace(/\*\s+as\s+/, '').split(',');
    for (const part of rest) {
      const local = part.trim();
      if (/^[A-Za-z_$][\w$]*$/.test(local)) names.add(local);
    }
  }
  return names;
}

/**
 * Global type names from the TypeScript `lib.*.d.ts` the package builds with (`HTMLElement`,
 * `CustomEvent`, `HTMLDivElement` …). These are never dangling, so they are never rewritten —
 * a tag mapped to a built-in element type keeps that type.
 */
export function libGlobalNames(packageRoot: string): Set<string> {
  const names = new Set<string>();
  let libDir: string;
  try {
    libDir = dirname(createRequire(join(packageRoot, 'package.json')).resolve('typescript/package.json'));
  } catch {
    return names;
  }
  const dir = join(libDir, 'lib');
  for (const file of readdirSync(dir)) {
    if (!/^lib\..*\.d\.ts$/.test(file)) continue;
    const text = readFileSync(join(dir, file), 'utf8');
    for (const m of text.matchAll(/^(?:declare\s+)?(?:interface|type|var|class)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
  }
  return names;
}

/**
 * Rewrites the dangling names inside each top-level `declare global { … }` block — and each
 * augmentation of a bare module specifier, `declare module 'react' { … }` — of one declaration file
 * (see `fixPublishedDtsGlobals`). Everything outside those blocks is untouched.
 */
export function resolveDanglingGlobals(
  source: string,
  exportedFrom: Map<string, string>,
  globals: Set<string> = new Set(),
): string {
  const local = localTypeNames(source);
  // A class the bundler inlined as a private copy (declared here, exported only by another entry) is a second nominal
  // type for the same tag — merging both copies into one global map fails with TS2717. Point at the public one.
  const exportedHere = exportedTypeNames(source);
  for (const name of [...local]) {
    if (exportedHere.has(name) || !exportedFrom.has(name)) continue;
    const declared = new RegExp(`^\\s*(?:export\\s+)?(?:declare\\s+)?(?:abstract\\s+)?(?:class|interface|type|enum)\\s+${name}\\b`, 'm');
    if (declared.test(source)) local.delete(name); // an import is an explicit binding — kept
  }
  for (const name of globals) if (!exportedFrom.has(name)) local.add(name);
  let out = '';
  let cursor = 0;
  // A module augmentation (`declare module 'react' { namespace JSX … }`) is copied the same way and
  // dangles the same way. Only bare specifiers: an entry file is a module, so these are augmentations.
  const marker = /declare\s+(?:global|module\s+(['"])[^'"./][^'"]*\1)\s*\{/g;
  for (let m = marker.exec(source); m; m = marker.exec(source)) {
    const open = m.index + m[0].length - 1;
    const close = matchingBrace(source, open);
    if (close === -1) break;
    out += source.slice(cursor, open) + rewriteBlock(source.slice(open, close + 1), local, exportedFrom);
    cursor = close + 1;
    marker.lastIndex = cursor;
  }
  return out + source.slice(cursor);
}

function matchingBrace(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return i;
  }
  return -1;
}

/**
 * Walks one block, tracking which interface each position sits in, and rewrites type references.
 * Skipped: quoted text, names right after `interface`/`namespace`/`extends` targets that are being
 * declared, and qualified tails (`A.B` — only `A` is a reference).
 */
function rewriteBlock(block: string, local: Set<string>, exportedFrom: Map<string, string>): string {
  const interfaces: (string | null)[] = [];
  let pendingInterface: string | null = null;
  let out = '';
  let i = 0;
  while (i < block.length) {
    const ch = block[i];
    if (ch === "'" || ch === '"' || ch === '`') {
      const end = block.indexOf(ch, i + 1);
      const stop = end === -1 ? block.length : end + 1;
      out += block.slice(i, stop);
      i = stop;
      continue;
    }
    if (ch === '{') {
      interfaces.push(pendingInterface);
      pendingInterface = null;
      out += ch;
      i++;
      continue;
    }
    if (ch === '}') {
      interfaces.pop();
      out += ch;
      i++;
      continue;
    }
    const word = /^[A-Za-z_$][\w$]*/.exec(block.slice(i));
    if (!word) {
      out += ch;
      i++;
      continue;
    }
    const name = word[0];
    const before = out.trimEnd();
    const declaresName = /\b(?:interface|namespace|class|type|enum)$/.test(before);
    const qualifiedTail = before.endsWith('.');
    if (declaresName && /\binterface$/.test(before)) pendingInterface = name;
    if (!declaresName && !qualifiedTail && /^[A-Z]/.test(name) && !local.has(name)) {
      const specifier = exportedFrom.get(name);
      const inTagMap = interfaces[interfaces.length - 1] === 'HTMLElementTagNameMap';
      if (specifier) out += `import('${specifier}').${name}`;
      else if (inTagMap && /:\s*$/.test(out)) out += 'HTMLElement';
      else out += name;
    } else {
      out += name;
    }
    i += name.length;
  }
  return out;
}
