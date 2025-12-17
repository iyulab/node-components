/**
 * 배열을 속성 문자열로, 속성 문자열을 배열로 변환하는 컨버터를 생성합니다.
 * `lit-element`의 `property` 데코레이터에서 사용할 수 있습니다.
 * 
 * @param parser - 문자열을 파싱하는 함수
 * @param separator - 구분자 문자열 (default: `,`)
 * @returns lit 속성 컨버터 객체
 */
export function arrayAttributeConverter<T>(
  parser: (value: string) => T,
  separator: string = ','
) {
  return {
    fromAttribute: (value: string | null): T[] | undefined => {
      if (!value) return undefined;
      return value.split(separator).map(v => parser(v.trim()));
    },
    toAttribute: (value: T[] | undefined): string | null => {
      if (!value) return null;
      return value.join(separator);
    }
  };
}