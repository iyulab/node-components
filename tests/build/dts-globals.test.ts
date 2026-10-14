// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import {
  declarationEntries,
  fixPublishedDtsGlobals,
  indexExportedTypes,
  resolveDanglingGlobals,
} from '../../plugins/dts-globals';

/** Fixture package name — kept out of string literals that look like imports. */
const PKG = ['@acme', 'pkg'].join('/');

const tagMap = (body: string) => `declare global {\n    interface HTMLElementTagNameMap {\n${body}\n    }\n}\n`;

describe('resolveDanglingGlobals', () => {
  const exported = new Map([
    ['UListPage', `${PKG}/list-page`],
    ['UOutlet', PKG],
    ['RouteBeginEvent', PKG],
  ]);

  it('points a tag whose class this entry lacks at the entry that exports it', () => {
    const src = `export declare function f(): void;\n\n${tagMap("        'u-list-page': UListPage;")}`;
    expect(resolveDanglingGlobals(src, exported)).toContain(`'u-list-page': import('${PKG}/list-page').UListPage;`);
  });

  it('leaves a name the entry declares itself', () => {
    const src = `export declare class UListPage extends HTMLElement {}\n${tagMap("        'u-list-page': UListPage;")}`;
    expect(resolveDanglingGlobals(src, exported)).toBe(src);
  });

  it('rewrites a name the entry has only as a value (a React wrapper const)', () => {
    const src = `export declare const UOutlet: unknown;\n${tagMap("        'u-outlet': UOutlet;")}`;
    expect(resolveDanglingGlobals(src, exported)).toContain(`'u-outlet': import('${PKG}').UOutlet;`);
  });

  it('rewrites references inside type arguments and other global interfaces', () => {
    const src = "declare global {\n    interface WindowEventMap {\n        'route-begin': CustomEvent<RouteBeginEvent>;\n    }\n}\n";
    const out = resolveDanglingGlobals(src, exported, new Set(['CustomEvent']));
    expect(out).toContain(`CustomEvent<import('${PKG}').RouteBeginEvent>`);
  });

  it('types a tag no entry exports as HTMLElement (composed-only internal)', () => {
    const src = tagMap("        'u-internal': UInternal;");
    expect(resolveDanglingGlobals(src, exported)).toContain("'u-internal': HTMLElement;");
  });

  it('never rewrites a built-in global type, even in the tag map', () => {
    const src = tagMap("        'u-box': HTMLDivElement;");
    expect(resolveDanglingGlobals(src, exported, new Set(['HTMLDivElement']))).toBe(src);
  });

  it('leaves an unknown name outside the tag map for the compile check to report', () => {
    const src = "declare global {\n    interface WindowEventMap {\n        'x': CustomEvent<Missing>;\n    }\n}\n";
    expect(resolveDanglingGlobals(src, exported, new Set(['CustomEvent']))).toBe(src);
  });

  it('does not touch names outside declare global blocks or inside quotes', () => {
    const src = `export declare const UListPage: 'UListPage';\ntype T = UOutlet;\n`;
    expect(resolveDanglingGlobals(src, exported)).toBe(src);
  });

  it('points a private copy of a class (declared, not exported here) at the entry that exports it', () => {
    const src = `export declare const ListPage: unknown;\ndeclare class UListPage extends HTMLElement {}\n${tagMap("        'u-list-page': UListPage;")}`;
    expect(resolveDanglingGlobals(src, exported)).toContain(`'u-list-page': import('${PKG}/list-page').UListPage;`);
  });

  it('treats an imported name as local', () => {
    const src = `import { UOutlet } from './outlet';\n${tagMap("        'u-outlet': UOutlet;")}`;
    expect(resolveDanglingGlobals(src, exported)).toBe(src);
  });

  it('rewrites a dangling name inside an augmentation of a bare module (React JSX)', () => {
    const src = "declare module 'react' {\n    namespace JSX {\n        interface IntrinsicElements {\n            'u-outlet': OutletProps;\n        }\n    }\n}\n";
    const out = resolveDanglingGlobals(src, new Map([['OutletProps', PKG]]));
    expect(out).toContain(`'u-outlet': import('${PKG}').OutletProps;`);
    expect(out).toContain('namespace JSX');
  });

  it('NEGATIVE: leaves a relative module declaration alone', () => {
    const src = "declare module './outlet' {\n    interface X {\n        a: OutletProps;\n    }\n}\n";
    expect(resolveDanglingGlobals(src, new Map([['OutletProps', PKG]]))).toBe(src);
  });
});

describe('indexExportedTypes / declarationEntries', () => {
  it('prefers the main entry and reads export lists of declared names', () => {
    const index = indexExportedTypes(PKG, [
      { key: './react', source: 'export declare class UOutlet {}\n' },
      { key: '.', source: 'declare class UOutlet {}\ndeclare const helper: 1;\nexport { UOutlet, helper }\n' },
    ]);
    expect(index.get('UOutlet')).toBe(PKG);
    expect(index.has('helper')).toBe(false);
  });

  it('maps local src/ export targets to dist/ and skips pattern exports', () => {
    expect(declarationEntries({
      '.': { types: './src/index.d.ts', import: './src/index.js' },
      './*': { types: './src/*.d.ts' },
      './style.css': './dist/style.css',
    })).toEqual([{ key: '.', file: './dist/index.d.ts' }]);
  });
});

describe('fixPublishedDtsGlobals', () => {
  it('rewrites every entry file in place from the manifest', () => {
    const root = mkdtempSync(join(tmpdir(), 'dts-globals-'));
    mkdirSync(join(root, 'dist'));
    writeFileSync(join(root, 'package.json'), JSON.stringify({
      name: PKG,
      exports: {
        '.': { types: './src/index.d.ts' },
        './list-page': { types: './src/list-page.d.ts' },
      },
    }));
    writeFileSync(join(root, 'dist', 'index.d.ts'), `export declare function f(): void;\n${tagMap("        'u-list-page': UListPage;")}`);
    writeFileSync(join(root, 'dist', 'list-page.d.ts'), `export declare class UListPage extends HTMLElement {}\n${tagMap("        'u-list-page': UListPage;")}`);
    fixPublishedDtsGlobals(root);
    expect(readFileSync(join(root, 'dist', 'index.d.ts'), 'utf8')).toContain(`import('${PKG}/list-page').UListPage`);
    expect(readFileSync(join(root, 'dist', 'list-page.d.ts'), 'utf8')).toContain("'u-list-page': UListPage;");
  });
});
