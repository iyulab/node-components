/**
 * 배열을 속성 문자열로, 속성 문자열을 배열로 변환하는 컨버터를 생성합니다.
 * @param parser - 문자열을 파싱하는 함수 (기본값: parseFloat)
 * @param separator - 구분자 (기본값: ',')
 * @returns Lit 속성 컨버터 객체
 */
export function arrayAttrConverter<T = number>(
  parser: (value: string) => T = parseFloat as any,
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