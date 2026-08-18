import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '../..');
const read = (p: string) => readFileSync(join(root, p), 'utf-8');

/**
 * 디자인 토큰이 문서에 들어가는 **정적 경로**를 계약으로 고정한다.
 *
 * 배경: 토큰 주입 경로가 `Theme.init()` 런타임 호출 하나뿐이고, 앱 셸(`@iyulab/modern-app`)이
 * 그것을 대신 호출하는 구조였다. 셸 **밖**에서 렌더되는 화면(로그인·온보딩·임베드)은 같은
 * 컴포넌트를 쓰면서도 토큰을 못 받아 **에러 없이 무스타일로** 렌더됐다 — 운영에서 실제로
 * 발생했다. 정적 진입점은 그 결합을 끊는다.
 */
describe('디자인 토큰 정적 진입점', () => {
  it('package.json 이 ./styles/* 를 공개한다', () => {
    const pkg = JSON.parse(read('package.json'));
    expect(pkg.exports['./styles/*']).toBe('./dist/styles/*');
  });

  it('tokens.css 가 light/dark 를 모두 끌어온다', () => {
    const css = read('src/assets/styles/tokens.css');
    expect(css).toMatch(/@import\s+['"]\.\/light\.css['"]/);
    expect(css).toMatch(/@import\s+['"]\.\/dark\.css['"]/);
  });

  it('dark 시트는 attribute 스코프라 light 와 공존해도 안전하다', () => {
    // 둘 다 `:root` 였다면 정적 임포트 시 나중 것이 항상 이겨 다크가 고정된다.
    expect(read('src/assets/styles/dark.css')).toMatch(/:root\[theme="dark"\]/);
    expect(read('src/assets/styles/light.css')).toMatch(/^:root\s*\{/m);
  });

  it('빌드 산출물이 세 시트를 모두 포함한다', () => {
    // dist 가 없으면(테스트만 돌린 경우) 건너뛴다 — 있으면 계약을 확인한다.
    if (!existsSync(join(root, 'dist/styles'))) return;
    for (const f of ['light.css', 'dark.css', 'tokens.css']) {
      expect(existsSync(join(root, 'dist/styles', f)), `dist/styles/${f}`).toBe(true);
    }
  });

  it('Theme 의 인라인 번들이 tokens.css 를 포함하지 않는다', () => {
    // 인라인된 <style> 안에서는 상대 @import 가 문서 기준으로 해석돼 깨진다.
    // glob 이 `*.css` 로 넓어지면 이 검사가 잡는다.
    const theme = read('src/utilities/Theme.ts');
    const glob = theme.match(/import\.meta\.glob\(\s*['"]([^'"]+)['"]/);
    expect(glob, 'Theme 이 import.meta.glob 으로 시트를 인라인한다').toBeTruthy();
    expect(glob![1]).not.toMatch(/\*\.css$/);
    expect(glob![1]).toMatch(/\{light,dark\}\.css$/);
  });

  it('토큰 부재를 개발 빌드에서 경고한다', () => {
    const el = read('src/components/UElement.ts');
    expect(el).toMatch(/import\.meta\.env\?\.DEV/);
    expect(el).toMatch(/getPropertyValue\('--u-blue-600'\)/);
  });

  it('문서가 정적 진입점을 안내한다', () => {
    // "제공하고 있다"와 "발견 가능하다"는 다르다 — 이 진입점은 이미 존재했지만
    // 문서에 없어서 소비자가 찾지 못했고, 그 결과 운영 화면이 깨졌다.
    for (const doc of ['README.md', 'docs/theming.md']) {
      expect(read(doc), doc).toContain("@iyulab/components/styles/tokens.css");
    }
  });
});
