// @ts-check
/**
 * Custom Elements Manifest 정합 검사 — `custom-elements.json` 이 **소스와 같은 말을 하는가** 를 소스에서 도출한 기대로 잰다.
 * 시험 러너에 기대지 않는 순수 함수라 컴포넌트 패키지마다 자기 `npm test` 에서 부른다(단독 클론의 CI 도 같은 판정).
 *
 * 대상(등록된 태그 · 이벤트 이름)은 소스에서 읽고, 규칙(무엇이 위반인가)만 여기 있다.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

/**
 * @typedef {{ name?: string, description?: string, inheritedFrom?: unknown, type?: { text: string } }} ManifestEvent
 * @typedef {{ kind: string, name: string, tagName?: string, description?: string, events?: ManifestEvent[] }} ManifestDeclaration
 * @typedef {{ modules: { path: string, declarations?: ManifestDeclaration[] }[] }} Manifest
 */

/** 소스 파일(시험 · 스타일 · 선언 제외) — 경로는 패키지 루트 기준 `/` 구분.
 *  @param {string} root */
function sourceFiles(root) {
  /** @type {{ path: string, text: string }[]} */
  const out = [];
  const walk = (/** @type {string} */ dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (p.endsWith('.ts') && !/\.(test|styles|d)\.ts$/.test(p)) {
        out.push({ path: relative(root, p).split(sep).join('/'), text: readFileSync(p, 'utf8') });
      }
    }
  };
  walk(join(root, 'src'));
  return out;
}

/**
 * @param {{ root: string, manifest: Manifest }} input `root` 는 패키지 루트(`src/` 가 있는 곳)
 * @returns {string[]} 위반 목록 — 비어 있으면 정합
 */
export function checkManifest({ root, manifest }) {
  const files = sourceFiles(root);
  const problems = [];

  const elements = manifest.modules.flatMap((m) => (m.declarations ?? []).filter((d) => d.tagName).map((d) => ({ ...d, module: m.path })));

  // 1. 매니페스트의 요소 = 소스가 등록한 요소
  const registered = new Set(files.flatMap((f) => [
    ...f.text.matchAll(/@customElement\(\s*['"]([a-z0-9-]+)['"]\s*\)/g),
    ...f.text.matchAll(/customElements\.define\(\s*['"]([a-z0-9-]+)['"]/g),
    // `static define(name)` 를 가진 클래스의 `Class.define('tag')` 호출(dimension-timeline) — 매니페스트는 클래스의 JSDoc `@customElement tag` 로 안다
    ...f.text.matchAll(/\b[A-Z]\w*\.define\(\s*['"]([a-z0-9-]+)['"]/g),
  ].map((m) => m[1])));
  if (!registered.size) problems.push('the source registers no element — nothing to check');
  const listed = new Set(elements.map((e) => e.tagName));
  for (const tag of registered) if (!listed.has(tag)) problems.push(`registered but missing from the manifest: ${tag}`);
  for (const tag of listed) if (!registered.has(String(tag))) problems.push(`in the manifest but not registered by the source: ${tag}`);

  // 2. 모든 요소에 설명이 있다 — 클래스 주석이 다른 선언 위에 붙으면 그 선언의 설명이 된다
  for (const e of elements) if (!e.description?.trim()) problems.push(`no description: ${e.tagName} (is its comment attached to a neighbouring declaration?)`);

  // 3. 이름 없는 이벤트, 소스의 «이벤트 이름 자리» 에 리터럴로 없는 이름의 이벤트는 분석기가 변수 이름에서 지어낸 것이다
  //    (물려받은 것은 상위 매니페스트의 몫). «이벤트 이름 자리» = `fire('x')` · `new XEvent('x')` 의 첫 인자, 또는 JSDoc `@fires x`.
  //    아무 문자열 리터럴이나 세지 않는다 — `'name'` 은 속성 이름으로 소스 어디에나 있어서 가짜 `name` 이벤트를 가리게 된다.
  const eventNames = new Set(files.flatMap((f) => [
    ...f.text.matchAll(/\b(?:fire|emit|new\s+\w*Event)(?:<[^>]*>)?\(\s*['"`]([a-z][a-z0-9:_.-]*)['"`]/gi),
    ...f.text.matchAll(/@(?:fires|event)\s+(?:\{[^}]*\}\s+)?([a-z][a-z0-9:_.-]*)/gi),
  ].map((m) => m[1])));
  for (const e of elements) {
    for (const ev of e.events ?? []) {
      if (ev.inheritedFrom) continue;
      if (!ev.name) problems.push(`${e.tagName}: an event without a name`);
      else if (!eventNames.has(ev.name)) problems.push(`${e.tagName}: event '${ev.name}' is not an event name anywhere in the source (invented from a variable name?)`);
    }
  }

  // 4. 클래스가 리터럴 이름으로 내는 이벤트는 전부 그 모듈의 선언에 있다
  for (const f of files) {
    const fired = new Set([...f.text.matchAll(/this\.(?:(?:fire|emit)(?:<[^>]*>)?\(\s*|dispatchEvent\(\s*new\s+\w*Event\(\s*)['"`]([a-z][a-z0-9:_.-]*)['"`]/gi)].map((m) => m[1]));
    if (!fired.size) continue;
    const mod = manifest.modules.find((m) => m.path === f.path);
    const have = new Set((mod?.declarations ?? []).flatMap((d) => (d.events ?? []).map((e) => e.name)));
    for (const name of fired) if (!have.has(name)) problems.push(`${f.path}: fires '${name}' but the manifest does not list it`);
  }

  return problems;
}
