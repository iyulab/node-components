export type StorageMode = 'localStorage' | 'cookie';

export interface LocalStorageOptions {
  type: 'localStorage';
}

export interface CookieOptions {
  type: 'cookie';
  /** 만료: Date | milliseconds timestamp | ISO string | days (number) */
  expires?: Date | number | string;
  path?: string;
  domain?: string;
  sameSite?: 'Lax' | 'Strict' | 'None';
  secure?: boolean;
}

export type BrowserStorageOptions = (LocalStorageOptions | CookieOptions) & {
  /** 키 앞에 붙일 접두사 (옵션) */
  prefix?: string;
}

/**
 * BrowserStorage - localStorage / cookie 래퍼
 *
 * 사용:
 * const s = new BrowserStorage({ type: 'localStorage', prefix: 'app' });
 * s.set('token', 'abc');
 * s.get('token'); // 'abc'
 *
 * const c = new BrowserStorage({ type: 'cookie', prefix: 'app', expires: 7 }); // expires = 7일
 * c.set('lang', 'ko');
 */
export class BrowserStorage {
  private mode: StorageMode;
  private prefix: string;
  private cookieOpts: CookieOptions | null;

  constructor(options: BrowserStorageOptions) {
    if (typeof window === 'undefined' && typeof document === 'undefined') {
      throw new Error('BrowserStorage can only be used in a browser environment.');
    }

    this.mode = options.type;
    this.prefix = options.prefix ? String(options.prefix) + ':' : '';
    if (this.mode === 'cookie') {
      this.cookieOpts = options as CookieOptions;
    } else {
      this.cookieOpts = null;
    }
  }

  /** 키에 prefix를 붙인 실제 저장 키 */
  private buildKey(key: string) {
    return `${this.prefix}${key}`;
  }

  /**
   * 값 저장
   * @param key 키
   * @param value 문자열 값 (문자열이 아닌 값은 JSON.stringify 권장)
   */
  set(key: string, value: string) {
    const k = this.buildKey(key);
    if (this.mode === 'localStorage') {
      try {
        window.localStorage.setItem(k, value);
      } catch (e) {
        // quota 초과 등 에러 무시 또는 필요시 로그
        // console.warn('[BrowserStorage] set failed', e);
      }
    } else {
      const co = this.cookieOpts;
      const val = encodeURIComponent(value);
      let cookieStr = `${k}=${val}; path=${co?.path ?? '/'}; SameSite=${co?.sameSite ?? 'Lax'}`;
      if (co?.domain) cookieStr += `; domain=${co.domain}`;
      if (co?.secure) cookieStr += `; Secure`;
      let exp = '';
      if (!co?.expires) exp = '';
      if (co?.expires instanceof Date) exp = co?.expires.toUTCString();
      if (typeof co?.expires === 'number') {
        // 숫자: 밀리초 타임스탬프 또는 일수(음수 아닌 정수일 경우 'days'로 간주)
        if (co?.expires > 1000000000000) {
          // 아마 밀리초 timestamp
          exp = new Date(co?.expires).toUTCString();
        } else {
          // days
          const d = new Date();
          d.setDate(d.getDate() + Math.floor(co?.expires));
          exp = d.toUTCString();
        }
      }
      const parsed = new Date(String(co?.expires));
      if (!isNaN(parsed.getTime())) exp = parsed.toUTCString();
      if (exp) cookieStr += `; expires=${exp}`;
      document.cookie = cookieStr;
    }
  }

  /**
   * 값 조회
   * @param key 키
   * @returns 값 (없으면 null)
   */
  get(key: string): string | null {
    const k = this.buildKey(key);
    if (this.mode === 'localStorage') {
      try {
        return window.localStorage.getItem(k);
      } catch {
        return null;
      }
    } else if (this.mode === 'cookie') {
      const re = new RegExp('(?:^|; )' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)');
      const m = document.cookie.match(re);
      if (!m) return null;
      try {
        return decodeURIComponent(m[1]);
      } catch {
        return m[1];
      }
    } else {
      throw new Error(`Unsupported storage mode: ${this.mode}`);
    }
  }

  /** 
   * 키 제거 
   */
  remove(key: string) {
    const k = this.buildKey(key);
    if (this.mode === 'localStorage') {
      try {
        window.localStorage.removeItem(k);
      } catch {}
    } else {
      // 쿠키 삭제: 만료를 과거로 설정
      document.cookie = `${k}=; path=${this.cookieOpts?.path ?? '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${this.cookieOpts?.sameSite ?? 'Lax'}`;
    }
  }

  /**
   * 현재 prefix 기준으로 모든 항목 제거 (주의: localStorage 전체 삭제 아님)
   */
  clear() {
    if (this.mode === 'localStorage') {
      try {
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && k.startsWith(this.prefix)) keysToRemove.push(k);
        }
        for (const k of keysToRemove) localStorage.removeItem(k);
      } catch {}
    } else {
      // 쿠키: 해당 prefix와 일치하는 키들을 찾아 삭제
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      for (const c of cookies) {
        const [rawKey] = c.split('=');
        if (rawKey && rawKey.startsWith(this.prefix)) {
          document.cookie = `${rawKey}=; path=${this.cookieOpts?.path ?? '/'}; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=${this.cookieOpts?.sameSite ?? 'Lax'}`;
        }
      }
    }
  }

  /** 
   * 모든 키 목록 반환 (prefix 적용된 실제 키들에서 접두사 제거한 상태) 
   */
  keys(): string[] {
    const out: string[] = [];
    if (this.mode === 'localStorage') {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k) continue;
        if (k.startsWith(this.prefix)) out.push(k.slice(this.prefix.length));
      }
    } else {
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      for (const c of cookies) {
        const [rawKey] = c.split('=');
        if (!rawKey) continue;
        if (rawKey.startsWith(this.prefix)) out.push(rawKey.slice(this.prefix.length));
      }
    }
    return out;
  }

}
