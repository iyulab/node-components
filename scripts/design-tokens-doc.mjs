// light.css 의 토큰 정의를 소비자용 레퍼런스 문서로 렌더링한다.
//
// `cssprops-doc.mjs` 는 **컴포넌트** JSDoc 만 훑는다 — 시트 레벨 토큰(팔레트·역할·시맨틱)은
// 어느 컴포넌트의 JSDoc 에도 없으므로 그 문서에 나타나지 않는다. 실제로 `--u-primary-color`
// 같은 브랜드 훅이 생성 레퍼런스에서 빠져 있었고, 소비자는 생성 문서를 먼저 연다.
//
//   node scripts/design-tokens-doc.mjs --write
import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

export const DOC_PATH = 'docs/design-tokens.md';
const SHEET = 'src/assets/styles/light.css';

const ROLES = ['primary', 'info', 'success', 'warning', 'danger'];
const STEP_ORDER = ['-weakest', '-weaker', '-weak', '', '-strong'];

/** `--name: value;` 을 선언 순서대로 뽑는다. */
function declarations(css) {
  return [...css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)].map(m => [m[1], m[2].trim()]);
}

const isPalette = name => /^--u-[a-z]+-\d+$/.test(name);
// 스케일 축은 늘어난다(반경 → 여백 → …). 접두사를 하나씩 하드코딩하면 새 축이 조용히
// **시맨틱으로 오분류**되므로, 축 목록을 한곳에 둔다.
const SCALE_AXES = ['radius', 'space'];
const isScale = name => SCALE_AXES.some(a => name.startsWith(`--u-${a}-`));
const roleOf = name => {
  const m = name.match(/^--u-([a-z]+)-color(-[a-z]+)?$/);
  return m && ROLES.includes(m[1]) ? m : null;
};

export function renderDesignTokensDoc(root) {
  const css = readFileSync(join(root, SHEET), 'utf-8');
  const decls = declarations(css);

  const palette = decls.filter(([n]) => isPalette(n));
  const roles = decls.filter(([n]) => roleOf(n));
  const roleNames = new Set(roles.map(([n]) => n));
  const scale = decls.filter(([n]) => isScale(n));
  const semantic = decls.filter(([n]) => !isPalette(n) && !isScale(n) && !roleNames.has(n));

  // 팔레트를 hue 별로 묶어 shade 수만 보고한다 (11단 × 10 hue 를 전부 나열하면 문서가 죽는다)
  const hues = new Map();
  for (const [n] of palette) {
    const hue = n.match(/^--u-([a-z]+)-\d+$/)[1];
    hues.set(hue, (hues.get(hue) || 0) + 1);
  }

  const lines = [
    '# Design Tokens',
    '',
    '> 자동 생성 문서 — 직접 편집하지 마세요. `src/assets/styles/light.css` 가 원본입니다.',
    '> 갱신: `npm run docs:tokens`',
    '',
    '문서 전역에 정의되는 토큰입니다. 컴포넌트가 노출하는 개별 훅은',
    '[css-custom-properties.md](css-custom-properties.md), 넣는 방법과 브랜딩 지침은',
    '[theming.md](theming.md) 를 보세요.',
    '',
    '`dark.css` 는 같은 이름을 같은 구조로 정의하며 **값만** 다릅니다 — 다크 대응을 위해',
    '컴포넌트나 소비자가 할 일은 없습니다.',
    '',
    `**역할 ${roles.length} · 스케일 ${scale.length} · 시맨틱 ${semantic.length} · 팔레트 ${palette.length}**`,
    '',
    '---',
    '',
    '## 역할 토큰 — 브랜딩은 여기서',
    '',
    '의미가 있는 자리(상태·유효성·포커스·링크·선택)는 팔레트가 아니라 이 층을 참조합니다.',
    '**하나를 덮으면 해당 의미를 가진 모든 컴포넌트가 따라옵니다.**',
    '',
    '단은 **강도** 축입니다(weakest → strong). 용도(배경/테두리/텍스트)는 소비처가 정합니다.',
    '',
    '| 역할 | ' + STEP_ORDER.map(s => `\`${s || '(기본)'}\``).join(' | ') + ' |',
    '|---|' + STEP_ORDER.map(() => '---').join('|') + '|',
  ];

  for (const role of ROLES) {
    const cells = STEP_ORDER.map(step => {
      const hit = roles.find(([n]) => n === `--u-${role}-color${step}`);
      return hit ? `\`${hit[1].replace(/^var\((.+)\)$/, '$1')}\`` : '—';
    });
    lines.push(`| **${role}** | ${cells.join(' | ')} |`);
  }

  lines.push(
    '',
    '> `primary` 와 `info` 는 기본 색상이 같지만 **다른 역할**입니다 — 리브랜딩은 `primary` 만 바꿉니다.',
    '',
    '⚠ `color` 속성(`<u-tag color="purple">`)은 **장식 축**이라 역할 오버라이드에 반응하지 않습니다.',
    '',
    '---',
    '',
    '## 스케일 토큰',
    '',
    '색이 아닌 축입니다. 테마와 무관하므로 두 시트가 같은 값을 가집니다.',
    '',
    '⚠ `--u-space-*` 는 **컨테이너·오버레이의 레이아웃 여백**입니다(카드·대화상자·드로어·',
    '알림·메뉴·툴팁). 폼·인라인 요소의 여백은 `em` 이라 **상속된 `font-size` 에 비례**합니다 —',
    '`body { font-size: 18px }` 를 주면 버튼·입력의 여백도 따라 커집니다. 그 비례를 유지하려고',
    '일부러 절대 스케일에 넣지 않았으니, 폼 여백을 조정할 때는 이 토큰이 아니라',
    '해당 컴포넌트의 훅(`--btn-padding-*` 등) 또는 타이포를 쓰세요.',
    '',
    '### 타이포에 반응하는 컴포넌트 / 그렇지 않은 컴포넌트',
    '',
    '대부분의 컴포넌트는 `font-size: inherit` 이라 소비자의 타이포를 그대로 따릅니다.',
    '**네 컴포넌트는 의도적으로 자기 크기를 고정**합니다 — 배지·트리 항목·아이콘 버튼처럼',
    '주변 텍스트와 무관하게 일정한 크기여야 읽히는 것들입니다:',
    '',
    '| 컴포넌트 | 고정 크기 | 타이포 상속 |',
    '|---|---|---|',
    '| `u-tag` · `u-tree-item` | `12px` | ✗ |',
    '| `u-copy-button` | `18px` | ✗ |',
    '| `u-icon-button` | `20px` | ✗ |',
    '| 그 외 전부 | — | ✓ `inherit` |',
    '',
    '이 넷의 여백은 `em` 으로 쓰여 있지만 고정 크기 위에 얹히므로 **실질적으로 절대값**입니다.',
    '`body` 타이포를 키워도 이 넷은 커지지 않습니다 — 크기를 바꾸려면 각 컴포넌트의',
    '여백 훅(`--tag-padding-block` 등)을 쓰세요.',
    '',
    '| 토큰 | 값 |',
    '|---|---|',
    ...scale.map(([n, v]) => `| \`${n}\` | \`${v}\` |`),
    '',
    '---',
    '',
    '## 시맨틱 토큰',
    '',
    '텍스트·아이콘·테두리·배경 등 용도별 토큰입니다. 일부는 역할 층을 경유하므로',
    '역할 토큰을 덮으면 함께 따라옵니다(아래 `var(--u-*-color*)` 표기).',
    '',
    '| 토큰 | 기본값 |',
    '|---|---|',
  );
  for (const [name, value] of semantic) lines.push(`| \`${name}\` | \`${value}\` |`);

  lines.push(
    '',
    '---',
    '',
    '## 팔레트 프리미티브',
    '',
    '`--u-{hue}-{shade}` — shade 는 `0, 100, … 1000`.',
    '**직접 참조는 장식 축에서만 하세요.** 의미가 있는 자리는 역할 토큰을 씁니다.',
    '',
    '| Hue | 단 수 |',
    '|---|---|',
  );
  for (const [hue, n] of hues) lines.push(`| \`--u-${hue}-*\` | ${n} |`);
  lines.push('');

  return lines.join('\n');
}

if (process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/').split('/').pop())) {
  const root = resolve(process.cwd());
  const content = renderDesignTokensDoc(root);
  if (process.argv.includes('--write')) {
    writeFileSync(join(root, DOC_PATH), content, 'utf-8');
    console.log(`wrote ${DOC_PATH}`);
  } else {
    process.stdout.write(content);
  }
}
