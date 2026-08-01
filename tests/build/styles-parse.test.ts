import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join, basename } from 'path';

const root = resolve(__dirname, '../..');
const styleFiles = () => globSync('src/components/**/*.styles.ts', { cwd: root });

/**
 * `css` 태그드 템플릿이 깨지면 **테스트가 실패하지 않고 "0개 테스트"가 된다.**
 *
 * 실제로 겪은 형태: CSS 주석 안에 백틱을 하나 넣자 템플릿 리터럴이 그 자리에서 끝나
 * 파일 전체가 파스 불가가 됐고, 그 파일을 임포트하는 브라우저 테스트는
 * `Tests  no tests` 로 보고됐다 — 초록도 빨강도 아닌 **침묵**이다. 개별 파일만 돌렸다면
 * 통과로 읽었을 것이고, 전체 파일 수(25)를 눈으로 세어서야 알았다.
 *
 * 이 검사는 그 침묵을 깨는 것이 목적이다. node 에서 도는 unit 프로젝트에 두어,
 * 브라우저 없이도 즉시 잡힌다.
 */
describe('스타일 시트 파스 무결성', () => {
  it('모든 *.styles.ts 가 임포트된다', async () => {
    const broken: string[] = [];
    for (const rel of styleFiles()) {
      try {
        const mod = await import(/* @vite-ignore */ join(root, rel));
        if (!mod.styles) broken.push(`${basename(rel)}: styles 를 내보내지 않는다`);
      } catch (e) {
        broken.push(`${basename(rel)}: ${(e as Error).message.split('\n')[0]}`);
      }
    }
    expect(broken).toEqual([]);
  });

  it('css 템플릿 안에 백틱이 없다 (주석 포함)', async () => {
    // 위 임포트 검사가 결과를 잡는다면, 이 검사는 **원인**을 이름으로 잡는다.
    // 백틱은 주석 안에서도 템플릿을 끝내므로, 파스 에러 메시지가 원인과
    // 동떨어진 곳을 가리켜(다음 줄의 세미콜론 등) 진단이 오래 걸린다.
    const offenders: string[] = [];
    for (const rel of styleFiles()) {
      const src = readFileSync(join(root, rel), 'utf-8');
      const m = src.match(/\bcss`([\s\S]*)`\s*;/);
      if (!m) { offenders.push(`${basename(rel)}: css 템플릿을 찾지 못했다`); continue; }
      if (m[1].includes('`')) offenders.push(`${basename(rel)}: css 템플릿 안에 백틱이 있다`);
    }
    expect(offenders).toEqual([]);
  });
});
