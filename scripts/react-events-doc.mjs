// 컴포넌트가 React 소비자에게 노출하는 이벤트를 레퍼런스 문서로 렌더링한다.
//
// 지금까지 소비자는 이걸 알려면 `dist/react/*.js` 를 열어봐야 했다.
//
// ⚠ 여기의 파싱은 `plugins/vite-plugin-react-wrapper.ts` 의 축약판이다(그쪽이 TS라 .mjs 에서
//    직접 못 부른다). 두 구현이 어긋나지 못하도록 tests/build/react-wrapper-events.test.ts 가
//    이 함수의 결과를 권위 파서(collectComponentEvents)와 대조한다.
//
//   node scripts/react-events-doc.mjs --write
import { readFileSync, writeFileSync, existsSync, globSync } from 'fs';
import { join, resolve, dirname } from 'path';

export const DOC_PATH = 'docs/react-events.md';

const toCamelEvent = name =>
  'on' + name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');

/** 상속 체인을 따라 이벤트를 수집한다 (베이스 → leaf 순서) */
function collect(file, map = new Map(), visited = new Set()) {
  if (visited.has(file) || !existsSync(file)) return map;
  visited.add(file);
  const src = readFileSync(file, 'utf-8');

  const imports = new Map();
  for (const m of src.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g)) {
    for (const n of m[1].split(',')) {
      const name = n.replace(/type\s+/, '').trim();
      if (name) imports.set(name, m[2]);
    }
  }

  const ext = src.match(/export\s+(?:abstract\s+)?class\s+\w+(?:<[^>]*>)?\s+extends\s+(\w+)/);
  if (ext) {
    const p = imports.get(ext[1]);
    if (p?.startsWith('.')) collect(resolve(dirname(file), p.replace(/\.js$/, '.ts')), map, visited);
  }

  for (const m of src.matchAll(/@event\s+([\w-]+)\s*-?\s*([^\n]*)/g)) {
    if (!map.has(m[1])) map.set(m[1], { detail: 'unknown', desc: m[2].trim() });
    else if (!map.get(m[1]).desc) map.get(m[1]).desc = m[2].trim();
  }
  for (const m of src.matchAll(/this\.fire\s*(?:<([^>]+)>)?\s*\(\s*['"]([\w-]+)['"]/g)) {
    const prev = map.get(m[2]);
    map.set(m[2], { detail: m[1] || 'unknown', desc: prev?.desc || '' });
  }
  return map;
}

export function renderReactEventsDoc(root) {
  const components = [];
  for (const rel of globSync('src/components/**/*.ts', { cwd: root })) {
    const file = join(root, rel);
    const src = readFileSync(file, 'utf-8');
    const tag = src.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (!tag) continue;
    const events = [...collect(file)].map(([name, v]) => ({ name, ...v }));
    if (events.length) components.push({ tag: tag[1], events });
  }
  components.sort((a, b) => a.tag.localeCompare(b.tag));

  const total = components.reduce((n, c) => n + c.events.length, 0);
  const lines = [
    '# React Events',
    '',
    '> 자동 생성 문서 — 직접 편집하지 마세요. 컴포넌트 JSDoc 의 `@event` 와 `this.fire()` 가 원본입니다.',
    '> 갱신: `npm run docs:react-events`',
    '',
    '`@iyulab/components/react` 래퍼가 노출하는 이벤트 prop 목록입니다.',
    '',
    '```tsx',
    "import { UDialog } from '@iyulab/components/react';",
    '',
    '<UDialog onShow={e => console.log(e.detail)} onHide={() => …} />',
    '```',
    '',
    '## 네이티브 이벤트는 매핑이 필요 없다',
    '',
    '`onClick`·`onFocus`·`onKeyDown` 같은 **표준 DOM 이벤트는 아래 표에 없어도 그대로 동작한다.**',
    '래퍼가 알지 못하는 prop 은 React 로 그대로 전달되고, React 합성 이벤트가 처리한다.',
    '수동으로 `ref` + `addEventListener` 를 붙일 필요가 없다.',
    '',
    '아래 표는 **커스텀 이벤트**(래퍼가 명시적으로 매핑하는 것)만 담는다.',
    '',
    '`detail` 열이 `unknown` 이면 `CustomEvent`(detail 타입 미지정)로 노출된다.',
    '',
    `**컴포넌트 ${components.length}개 · 이벤트 ${total}개**`,
    '',
  ];

  for (const { tag, events } of components) {
    lines.push(`## \`<${tag}>\``, '', '| React prop | 이벤트 | detail | 설명 |', '|---|---|---|---|');
    for (const e of events) {
      lines.push(`| \`${toCamelEvent(e.name)}\` | \`${e.name}\` | \`${e.detail}\` | ${e.desc || '—'} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

if (process.argv[1]?.replace(/\\/g, '/').endsWith('react-events-doc.mjs')) {
  const root = resolve(process.cwd());
  const content = renderReactEventsDoc(root);
  if (process.argv.includes('--write')) {
    writeFileSync(join(root, DOC_PATH), content, 'utf-8');
    console.log(`wrote ${DOC_PATH}`);
  } else {
    process.stdout.write(content);
  }
}
