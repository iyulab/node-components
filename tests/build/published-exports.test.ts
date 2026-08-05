import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '../..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf-8')) as {
  exports: Record<string, unknown>;
  files: string[];
};

/**
 * 규약: **`exports` 가 가리키는 것은 게시본에 실제로 들어 있어야 한다.**
 *
 * ★이 파일이 생긴 이유: `exports['./plugins/*']` 가 `./plugins/*` 를 가리키고 `files` 가
 * `plugins/**\/*.js` 를 선언했는데, 그 `.js` 는 **한동안 생성되지 않고 있었다**
 * (타입 검사만 하도록 `noEmit` 으로 바꾼 뒤로). 선언은 남고 산출물만 사라진 것이다.
 *
 * 이 결함의 성질이 고약하다 — **이 리포에서는 아무 증상이 없다.** 로컬 빌드는 상대
 * 경로로 `.ts` 소스를 직접 읽고, 이 패키지의 테스트도 통과한다. 깨지는 곳은 **게시본을
 * 설치한 다른 패키지의 빌드**이고, 그것도 캐럿 범위가 새 버전을 잡을 때까지 잠복한다.
 * 실제로 두 소비 패키지가 **네 번의 릴리스를 지나** 정상으로 보이다가 한꺼번에 실패했다.
 *
 * ⇒ 게시 계약은 **게시하는 쪽에서** 검사해야 한다. 소비하는 쪽은 너무 늦게 안다.
 *
 * ★2026-08-05: `exports` 의 `.` 이 SRC형으로 바뀌었다(`./src/index.js` 등) — 로컬은
 * 소스를 직접 보고 게시 시에는 배포 워크플로가 `src/` → `dist/` 로 치환한다(루트
 * `exports-check.js` 와 같은 정책). 이 테스트는 **게시본 형태**를 검증하는 것이 목적이므로
 * 같은 치환을 적용한 뒤 존재를 확인한다 — 치환 없이 보면 `./src/index.d.ts` 는 리포에
 * 실재하지 않는 표기라 정당한 SRC형에 발화한다.
 */
describe('게시 계약 — exports 대상이 실재한다', () => {
  const targets = () =>
    Object.entries(pkg.exports)
      .flatMap(([spec, value]) => {
        const paths = typeof value === 'string' ? [value] : Object.values(value as object);
        return paths.map(p => [spec, String(p)] as const);
      })
      .filter(([, p]) => p.startsWith('./'))
      .map(([spec, p]) => [spec, p.replace(/^\.\/src\//, './dist/')] as const);

  it('와일드카드가 아닌 진입점이 전부 존재한다', () => {
    const missing = targets()
      .filter(([, p]) => !p.includes('*'))
      .filter(([, p]) => !existsSync(join(root, p)));
    // 빌드 전이면 dist 가 통째로 없다 — 그때는 이 테스트가 의미를 갖지 못하므로 건너뛴다.
    if (!existsSync(join(root, 'dist'))) return;
    expect(missing.map(([spec, p]) => `${spec} → ${p}`)).toEqual([]);
  });

  it('★와일드카드 진입점의 디렉터리에 산출물이 있다', () => {
    if (!existsSync(join(root, 'dist'))) return;
    const emptyDirs = targets()
      .filter(([, p]) => p.includes('*'))
      .map(([spec, p]) => [spec, p.slice(0, p.indexOf('*'))] as const)
      .filter(([, dir]) => !existsSync(join(root, dir)));
    // `./plugins/*` 가 정확히 이렇게 비어 있었다 — 매핑은 남고 산출물만 사라졌다.
    expect(emptyDirs.map(([spec, dir]) => `${spec} → ${dir}(없음)`)).toEqual([]);
  });

  it('플러그인 진입점이 게시 대상 안에 있다', () => {
    // 소비 패키지의 vite.config 가 이것을 패키지 이름으로 임포트한다.
    // `files` 에 dist 가 있으므로 dist 밑에 있어야 실린다.
    expect(String(pkg.exports['./plugins/*'])).toMatch(/^\.\/dist\//);
    expect(pkg.files).toContain('dist');
    // 그리고 `files` 에 산출물이 나지 않는 경로가 남아 있으면 안 된다 — 죽은 선언은
    // *"실려 있다"* 는 착각을 만든다.
    expect(pkg.files.filter(f => f.startsWith('plugins/'))).toEqual([]);
  });
});
