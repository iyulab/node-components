// 컴포넌트 JSDoc 의 @cssprop 을 소비자용 레퍼런스 문서로 렌더링한다.
//
// 손으로 쓴 표는 반드시 썩는다 — 컴포넌트가 훅을 추가해도 문서는 그대로 남는다.
// 생성해서 커밋하고, 테스트가 drift 를 막는다 (tests/build/cssprop-coverage.test.ts).
//
//   node scripts/cssprops-doc.mjs --write
import { readFileSync, writeFileSync, globSync } from 'fs';
import { join, resolve } from 'path';

export const DOC_PATH = 'docs/css-custom-properties.md';

export function renderCssPropsDoc(root) {
  const components = [];
  for (const rel of globSync('src/components/**/*.ts', { cwd: root })) {
    const source = readFileSync(join(root, rel), 'utf-8');
    const tag = source.match(/@customElement\s*\(\s*['"]([^'"]+)['"]\s*\)/);
    if (!tag) continue;
    // `@cssprop --name - 설명` (설명은 다음 태그/블록 끝까지 이어질 수 있다)
    const props = [...source.matchAll(/@cssprop\s+(--[\w-]+)\s*-\s*([\s\S]*?)(?=\n\s*\*\s*@|\n\s*\*\/)/g)]
      .map(m => [m[1], m[2].replace(/\n\s*\*\s?/g, ' ').replace(/\s+/g, ' ').trim()]);
    if (props.length) components.push([tag[1], props]);
  }
  components.sort((a, b) => a[0].localeCompare(b[0]));

  const total = components.reduce((n, [, p]) => n + p.length, 0);
  const lines = [
    '# CSS Custom Properties',
    '',
    '> 자동 생성 문서 — 직접 편집하지 마세요. 컴포넌트 JSDoc 의 `@cssprop` 이 원본입니다.',
    '> 갱신: `npm run docs:cssprops`',
    '',
    '컴포넌트가 노출하는 CSS 커스텀 프로퍼티 목록입니다. 소비자는 이 이름들을 덮어',
    '컴포넌트를 조절합니다 — 내부 선택자를 침투하지 않아도 됩니다.',
    '',
    '```css',
    '/* 전역 */',
    'u-button { --btn-color: #c42839; }',
    '',
    '/* 개별 인스턴스 */',
    'u-button.cta { --btn-color: #0f9d58; }',
    '```',
    '',
    `전역 테마 토큰(\`--u-*\`)은 [theming.md](theming.md) 를 보세요.`,
    '',
    `**컴포넌트 ${components.length}개 · 프로퍼티 ${total}개**`,
    '',
  ];

  for (const [tag, props] of components) {
    lines.push(`## \`<${tag}>\``, '', '| 프로퍼티 | 설명 |', '|---|---|');
    for (const [name, desc] of props) lines.push(`| \`${name}\` | ${desc} |`);
    lines.push('');
  }

  return lines.join('\n');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const root = resolve(process.cwd());
  const content = renderCssPropsDoc(root);
  if (process.argv.includes('--write')) {
    writeFileSync(join(root, DOC_PATH), content, 'utf-8');
    console.log(`wrote ${DOC_PATH}`);
  } else {
    process.stdout.write(content);
  }
}
