import { enumeratedValues } from '../../src/utilities/enumerated.js';

/**
 * **컴파일되는 것 자체가 테스트다**(런타임 단언 없음) — `enumeratedValues` 가 목록과 유니온의 일치를 컴파일러에 맡긴다.
 * 이 파일의 `@ts-expect-error` 는 «어긋나면 실제로 실패한다» 는 증거다: 도우미가 아무 목록이나 받게 무뎌지면 그 줄이
 * «쓸모없는 expect-error» 로 이 프로젝트의 `tsc --noEmit`(= `build` 게이트)을 깨뜨린다.
 */
type Size = 'sm' | 'md' | 'lg';

// 정확히 유니온과 같은 목록 — 통과.
export const exact = enumeratedValues<Size>()(['sm', 'md', 'lg']);
// 순서가 달라도 통과(집합이다).
export const reordered = enumeratedValues<Size>()(['lg', 'sm', 'md']);

// 유니온의 값을 빠뜨렸다 — 목록 ⊉ 유니온.
// @ts-expect-error 'lg' 가 없다
export const missing = enumeratedValues<Size>()(['sm', 'md']);

// 유니온에 없는 값을 더했다 — 목록 ⊄ 유니온.
// @ts-expect-error 'xl' 은 Size 가 아니다
export const extra = enumeratedValues<Size>()(['sm', 'md', 'lg', 'xl']);
