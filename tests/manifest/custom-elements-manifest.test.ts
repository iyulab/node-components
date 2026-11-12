import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-expect-error — JSDoc 타입을 단 JS 소스라 이 트리에는 선언 파일이 없다(게시본에는 dist/plugins/cem-check.d.ts 가 있다)
import { checkManifest as check } from '../../plugins/cem-check.js';

/**
 * `custom-elements.json` — 도구와 에이전트가 요소의 속성 · 이벤트 · 슬롯을 읽는 매니페스트. 분석기가 만든 것을 그대로 믿지 않는다:
 * 분석기는 `this.fire()` 로 내는 이벤트를 모르고 `fire()` 자신의 변수 이름을 이벤트로 적는다(`plugins/cem-events-plugin.js` 가
 * 바로잡는다). 이 시험은 `npm run analyze` 와 같은 명령을 임시 폴더로 돌려 **소스에서 도출한** 기대와 대조한다
 * (`plugins/cem-check.js` — 형제 패키지가 같은 검사를 자기 시험에서 부른다). 대상(등록된 태그 · 이벤트 이름)을 손으로 적지 않는다.
 */
const root = fileURLToPath(new URL('../../', import.meta.url));
const OUT = join('node_modules', '.cache', 'cem-test');

interface Declaration { kind: string; name: string; tagName?: string; description?: string; events?: { name?: string; type?: { text: string } }[] }
interface Manifest { modules: { path: string; declarations?: Declaration[] }[] }
const checkManifest = check as (input: { root: string; manifest: Manifest }) => string[];
let manifest: Manifest;

beforeAll(() => {
  const cem = createRequire(import.meta.url).resolve('@custom-elements-manifest/analyzer/cem.js');
  execFileSync(process.execPath, [cem, 'analyze', '--outdir', OUT], { cwd: root, stdio: 'pipe' });
  manifest = JSON.parse(readFileSync(join(root, OUT, 'custom-elements.json'), 'utf8')) as Manifest;
}, 120_000);

describe('custom-elements.json', () => {
  it('says what the source says: registered elements, descriptions, no invented events, every fired event listed', () => {
    expect(checkManifest({ root, manifest })).toEqual([]);
  });

  it('types an event fired with a detail type as CustomEvent<Detail>', () => {
    const select = manifest.modules.flatMap(m => m.declarations ?? []).find(d => d.tagName === 'u-select')!;
    expect(select.events!.find(e => e.name === 'query-change')!.type?.text).toBe('CustomEvent<USelectQueryChangeDetail>');
  });

  it('lists an event fired from an arrow-function field (the analyzer reads methods only)', () => {
    const fileInput = manifest.modules.flatMap(m => m.declarations ?? []).find(d => d.tagName === 'u-file-input')!;
    expect(fileInput.events!.map(e => e.name)).toContain('input');
  });
});

describe('checkManifest', () => {
  const sample = (events: { name?: string }[], description = 'x'): Manifest => ({
    modules: [{ path: 'src/components/select/USelect.ts', declarations: [{ kind: 'class', name: 'USelect', tagName: 'u-select', description, events }] }],
  });

  it('NEGATIVE: reports an event invented from a variable name, a missing description, and a missing registration', () => {
    const problems = checkManifest({ root, manifest: sample([{ name: 'name' }, {}], '') });
    expect(problems.some(p => p.includes("event 'name'"))).toBe(true);
    expect(problems.some(p => p.includes('an event without a name'))).toBe(true);
    expect(problems.some(p => p.includes('no description: u-select'))).toBe(true);
    expect(problems.some(p => p.startsWith('registered but missing from the manifest'))).toBe(true);
  });
});
