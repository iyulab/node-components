/**
 * 배열을 속성 문자열로, 속성 문자열을 배열로 변환하는 컨버터를 생성합니다.
 * `lit-element`의 `property` 데코레이터에서 사용할 수 있습니다.
 * 
 * @param parser - 문자열을 파싱하는 함수
 * @param separator - 구분자 문자열 (default: `,`)
 * @returns lit 속성 컨버터 객체
 */
export function arrayAttrConverter<T>(
  parser: (value: string) => T = (value) => value as unknown as T,
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

/**
 * 문자열을 JSON 객체로, JSON 객체를 문자열로 변환하는 컨버터를 생성합니다.
 * `lit-element`의 `property` 데코레이터에서 사용할 수 있습니다.
 * 
 * @param parser - 문자열을 JSON 객체로 파싱하는 함수 (default: `JSON.parse`)
 * @returns lit 속성 컨버터 객체
 */
export function jsonAttrConverter<T>(
  parser: (value: string) => T = JSON.parse
) {
  return {
    fromAttribute: (value: string | null): T | undefined => {
      if (!value) return undefined;
      try {
        return parser(value);
      } catch {
        console.warn(`Failed to parse JSON attribute: ${value}`);
        return undefined;
      }
    },
    toAttribute: (value: T | undefined): string | null => {
      if (value === undefined) return null;
      try {        
        return JSON.stringify(value);
      } catch {
        console.warn(`Failed to stringify JSON attribute:`, value);
        return null;
      }
    }
  };
}

/**
 * 문자열을 불리언으로, 불리언을 문자열로 변환하는 컨버터를 생성합니다.
 * `lit-element`의 `property` 데코레이터에서 사용할 수 있습니다.
 *
 * @returns lit 속성 컨버터 객체
 */
export function booleanAttrConverter() {
  return {
    fromAttribute: (value: string | null): boolean => {
      return !value || value === 'false' ? false : true;
    },
    toAttribute: (value: boolean): string | null => {
      return value ? '' : null;
    }
  };
}

/**
 * 문자열을 날짜 객체로, 날짜 객체를 문자열로 변환하는 컨버터를 생성합니다.
 * `lit-element`의 `property` 데코레이터에서 사용할 수 있습니다.
 *
 * @param parser - 문자열을 날짜 객체로 파싱하는 함수 (default: `Date.parse`)
 * @returns lit 속성 컨버터 객체
 */
export function dateAttrConverter(
  parser: (value: string) => number = Date.parse
) {
  return {
    fromAttribute: (value: string | null): Date | undefined => {
      if (!value) return undefined;
      const timestamp = parser(value);
      return isNaN(timestamp) ? undefined : new Date(timestamp);
    },
    toAttribute: (value: Date | undefined): string | null => {
      if (!value) return null;
      return value.toISOString();
    }
  };
}

/**
 * 문자열을 URL 객체로, URL 객체를 문자열로 변환하는 컨버터를 생성합니다.
 * `lit-element`의 `property` 데코레이터에서 사용할 수 있습니다.
 * 
 * @param parser - 문자열을 URL 객체로 파싱하는 함수 (default: `new URL()`)
 * @returns lit 속성 컨버터 객체
 */
export function urlAttrConverter(
  parser: (value: string) => URL = (value) => new URL(value)
) {
  return {
    fromAttribute: (value: string | null): URL | undefined => {
      if (!value) return undefined;
      try {
        return parser(value);
      }
      catch {
        console.warn(`Failed to parse URL attribute: ${value}`);
        return undefined;
      }
    },
    toAttribute: (value: URL | undefined): string | null => {
      if (!value) return null;
      return value.href;
    }
  };
}