/**
 * 열거형 속성의 «허용 값 목록» 을 한 자리에서 적고, 그것이 **타입의 유니온과 어긋나지 않음을 컴파일러가 잰다**.
 *
 * 왜 이 모양인가 — 템플릿의 속성 문자열(버튼의 외형에 목록에 없는 이름을 적은 것)은 타입 검사를 받지 않고, 목록 밖의 값은 어떤
 * 스타일 규칙에도 안 걸려 **에러 없이 기본 모양으로 떨어진다**(소비자 실측: 현재 탭 표시가 통째로 사라졌는데 콘솔이 비어
 * 있었다). 그 값을 개발 모드에서 한 번 알리려면 런타임에 허용 값 목록이 있어야 하는데, 타입은 지워진다.
 *
 * - 유니온 별칭은 **그대로 리터럴 유니온으로 둔다** — `attr-value-check` 가 같은 파일의 `export type X = "a" | "b"` 를 읽어
 *   소비 코드의 속성값을 잰다. 별칭을 `typeof LIST[number]` 로 바꾸면 그 검사가 조용히 눈이 먼다.
 * - 목록은 이 도우미로 적는다: 유니온에 있는 값을 하나라도 빠뜨리면 **컴파일이 실패한다**(목록 ⊇ 유니온), 유니온에 없는 값을
 *   적어도 실패한다(목록 ⊆ 유니온). 그래서 둘이 낡는 일이 없다.
 *
 * ```ts
 * type ButtonSize = 'sm' | 'md' | 'lg';
 * static override enumerated = { size: enumeratedValues<ButtonSize>()(['sm', 'md', 'lg']) };
 * ```
 *
 * 빠뜨렸을 때의 컴파일 오류는 «`never` 에 할당할 수 없다» 로 보인다 — 인자 목록이 유니온을 다 덮지 못한다는 뜻이다.
 */
export function enumeratedValues<T extends string>() {
  return <const L extends readonly T[]>(
    values: L & ([T] extends [L[number]] ? unknown : never),
  ): readonly T[] => values;
}
