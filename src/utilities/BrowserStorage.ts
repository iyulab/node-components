/** localStorage 설정 옵션 */
export interface LocalStorageOptions {
  type: 'localStorage';
}

/** 쿠키 스토리지 설정 옵션 */
export interface CookieOptions {
  type: 'cookie';
  path?: string;
  domain?: string | null;
  expires?: DOMHighResTimeStamp | null;
  sameSite?: CookieSameSite;
  partitioned?: boolean;
}

export type BrowserStorageOptions = (LocalStorageOptions | CookieOptions) & {
  /** 키 앞에 붙일 접두사 (옵션) */
  prefix?: string;
}

/**
 * 웹 브라우저가 제공하는 저장소 유틸리티 클래스
 */
export class BrowserStorage {
  private readonly options: BrowserStorageOptions;

  constructor(options: BrowserStorageOptions) {
    if (window === undefined) {
      throw new Error('BrowserStorage can only be used in a browser environment.');
    }
    if (options.type === 'cookie' && !('cookieStore' in window)) {
      throw new Error('Cookies are not supported in this browser.');
    }
    this.options = options;
  }

  /** 키에 prefix를 붙인 실제 저장 키 */
  private buildKey(key: string) {
    return `${this.options.prefix || ''}${key}`;
  }

  /**
   * 값 저장
   * @param key 키
   * @param value 문자열 값 (문자열이 아닌 값은 JSON.stringify 권장)
   */
  public async set(key: string, value: string) {
    key = this.buildKey(key);
    try {
      if (this.options.type === 'localStorage') {
        window.localStorage.setItem(key, value);
      } else if (this.options.type === 'cookie') {
        await window.cookieStore.set({
          name: key,
          value: value,
          path: this.options.path,
          domain: this.options.domain,
          expires: this.options.expires,
          sameSite: this.options.sameSite,
          partitioned: this.options.partitioned,
        });
      } else {
        throw new Error(`Unsupported storage type`);
      }
    } catch(e) {
      console.error('[BrowserStorage Error: set]', e);
    }
  }

  /**
   * 값 조회
   * @param key 키
   * @returns 값 (없으면 null)
   */
  public async get(key: string) {
    key = this.buildKey(key);
    try {
      if (this.options.type === 'localStorage') {
        return window.localStorage.getItem(key);
      } else if (this.options.type === 'cookie') {
        const item = await window.cookieStore.get({
          name: key
        });
        return item?.value || null;
      } else {
        throw new Error(`Unsupported storage type`);
      }
    } catch(e) {
      console.error('[BrowserStorage Error: get]', e);
      return null;
    }
  }

  /** 
   * 값 삭제
   * @param key 키
   */
  public async remove(key: string) {
    key = this.buildKey(key);
    try {
      if (this.options.type === 'localStorage') {
        window.localStorage.removeItem(key);
      } else if (this.options.type === 'cookie') {
        await window.cookieStore.delete({
          name: key
        });
      } else {
        throw new Error(`Unsupported storage type`);
      }
    } catch(e) {
      console.error('[BrowserStorage Error: remove]', e);
    }
  }
}