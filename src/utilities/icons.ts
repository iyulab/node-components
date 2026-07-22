/**
 * 아이콘 리소스를 외부(정적 파일/네트워크 경로)에서 로드할 때 기준이 되는 URL입니다.
 *
 * 이 값은 모듈 내부에서만 직접 접근하며,
 * 외부에서는 항상 `getDefaultBaseUrl` / `setDefaultBaseUrl`을 통해 사용해야 합니다.
 */
let defaultIconBaseUrl = '/assets/icons/';

/**
 * 기본 라이브러리에서 아이콘을 로드할 때 사용할 기본 URL을 반환합니다.
 */
function getDefaultBaseUrl(): string {
  return defaultIconBaseUrl;
}

/**
 * 기본 라이브러리에서 아이콘을 로드할 때 사용할 기본 URL을 설정합니다.
 *
 * @param url - 아이콘 리소스의 기본 URL (예: `/assets/icons/` 또는 `https://cdn.example.com/icons/`)
 */
function setDefaultBaseUrl(url: string): void {
  defaultIconBaseUrl = url;
}

/**
 * vite의 `import.meta.glob`을 사용하여 내부 경로상의 모든 SVG 파일을 빌드 시점에 한 번에 로드합니다.
 * 이 레지스트리는 런타임 동안 불변이며, 아이콘 조회 시 재사용됩니다.
 */
const InternalIconBundle = new Map<string, string>(
  Object.entries(import.meta.glob('../assets/icons/*.svg', {
    eager: true,
    query: '?raw',
    import: 'default',
  }))
  .map(([path, module]) => {
    const name = path.split('/').pop()?.replace('.svg', '') || '';
    return [name, module as string] as [string, string];
  })
  .filter(([name]) => name !== ''),
);

/**
 * `name`으로 아이콘 리소스를 가져오는 함수입니다.
 *
 * 반환 계약 — 레지스트리가 결과를 (lib, name) 단위로 캐시하므로 리졸버는 순수 조회만 담당합니다:
 * - `string` 반환: 성공 — 세션 동안 캐시되어 재호출되지 않습니다.
 * - `undefined` 반환: **not-found 확정** — 네거티브 캐시되어 재호출되지 않습니다.
 *   (탈출구: `IconCache.clear()`)
 * - `throw`: **일시 오류**(네트워크 장애 등) — 캐시되지 않아 다음 조회 시 재시도됩니다.
 */
type IconResolver = (name: string) => string | undefined | Promise<string | undefined>;

/**
 * 아이콘 리소스 캐시입니다.
 * lib + name 조합으로 SVG 리소스를 저장/조회합니다.
 * `undefined` 값은 "not-found 확정"의 네거티브 캐시 항목을 의미합니다.
 */
class IconCache {
  private static cache = new Map<string, string | undefined>();

  /** 클래스 생성 방지 */
  private constructor() {}

  private static makeKey(lib: string, name: string): string {
    return `${lib}:${name}`;
  }

  /**
   * 지정된 lib, name 조합의 리소스(네거티브 항목 포함)가 존재하는지 확인합니다.
   */
  public static has(lib: string, name: string): boolean {
    return this.cache.has(this.makeKey(lib, name));
  }

  /**
   * 지정된 lib, name 조합의 리소스를 가져옵니다.
   */
  public static get(lib: string, name: string): string | undefined {
    return this.cache.get(this.makeKey(lib, name));
  }

  /**
   * 지정된 lib, name 조합의 리소스를 저장합니다.
   * `undefined`를 저장하면 not-found 확정(네거티브 캐시)으로 기록됩니다.
   */
  public static set(lib: string, name: string, resource: string | undefined): void {
    this.cache.set(this.makeKey(lib, name), resource);
  }

  /**
   * 캐시를 비웁니다.
   *
   * @param lib - 지정하면 해당 라이브러리의 항목만, 생략하면 전체를 비웁니다.
   */
  public static clear(lib?: string): void {
    if (lib === undefined) {
      this.cache.clear();
      return;
    }
    const prefix = `${lib}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) this.cache.delete(key);
    }
  }
}

/**
 * 아이콘 레지스트리입니다.
 * 아이콘 라이브러리를 등록하고, 아이콘을 조회하는 기능을 제공합니다.
 */
class IconRegistry {
  private static libs = new Map<string, IconResolver>();
  /** 동일 (lib, name)의 동시 리졸브를 하나의 요청으로 합치는 in-flight 맵입니다. */
  private static pending = new Map<string, Promise<string | undefined>>();

  /** 클래스 생성 방지 */
  private constructor() {}

  /**
   * 지정된 아이콘 라이브러리가 등록되었는지 확인합니다.
   */
  public static has(lib: string) {
    return this.libs.has(lib);
  }

  /**
   * 지정된 아이콘 라이브러리를 등록합니다.
   * 이미 등록된 라이브러리 이름인 경우, 기존 등록을 덮어쓰지 않고 무시합니다.
   */
  public static register(lib: string, resolver: IconResolver) {
    if (!this.libs.has(lib)) {
      this.libs.set(lib, resolver);
    }
  }

  /**
   * 지정된 아이콘 라이브러리를 등록 해제합니다.
   * 해당 라이브러리의 캐시 항목도 함께 비웁니다 —
   * `unregister` 후 다른 리졸버를 재등록할 때 이전 결과가 남지 않도록 하기 위함입니다.
   */
  public static unregister(lib: string) {
    this.libs.delete(lib);
    IconCache.clear(lib);
  }

  /**
   * 지정된 아이콘 라이브러리의 svg 아이콘 소스를 가져옵니다.
   *
   * 리졸브 결과는 (lib, name) 단위로 캐시됩니다 — 스트리밍 재렌더처럼 같은 아이콘이
   * 반복 재마운트되는 시나리오에서도 리졸버는 이름당 한 번만 호출됩니다.
   * 동시 요청은 in-flight Promise를 공유하고, `IconResolver` 계약에 따라
   * `undefined`(not-found 확정)는 네거티브 캐시, `throw`(일시 오류)는 캐시하지 않습니다.
   */
  public static async resolve(lib: string, name: string): Promise<string | undefined> {
    if (IconCache.has(lib, name)) {
      return IconCache.get(lib, name);
    }

    const resolver = this.libs.get(lib);
    if (!resolver) return undefined;

    return this.resolveCached(lib, name, () => resolver(name));
  }

  /**
   * URL에서 직접 svg 아이콘 소스를 가져옵니다.
   * `u-icon`의 `src` 경로와 무-lib 기본(baseUrl) 경로가 사용하는 저수준 진입점입니다.
   *
   * 결과는 예약 네임스페이스 `url`로 `IconCache`에 캐시되어 같은 URL은 세션당
   * 한 번만 fetch됩니다. HTTP 실패(404 등)는 not-found로 네거티브 캐시되고,
   * 네트워크 오류는 캐시하지 않아 다음 조회 시 재시도됩니다.
   */
  public static async resolveUrl(url: string): Promise<string | undefined> {
    if (IconCache.has('url', url)) {
      return IconCache.get('url', url);
    }

    return this.resolveCached('url', url, async () => {
      const response = await fetch(url);
      if (!response.ok) return undefined;
      return await response.text();
    });
  }

  /**
   * 캐시 기록 + in-flight dedupe + 실패 시멘틱을 공유하는 리졸브 코어입니다.
   * catch를 task 내부에 두어, in-flight를 공유한 모든 호출자가 rejection 대신
   * undefined를 받도록 한다 (렌더 경로로 rejection이 전파되면 안 됨).
   */
  private static resolveCached(
    lib: string,
    name: string,
    fn: () => string | undefined | Promise<string | undefined>,
  ): Promise<string | undefined> {
    const key = `${lib}:${name}`;
    const inflight = this.pending.get(key);
    if (inflight) return inflight;

    const task = (async () => {
      try {
        const svg = (await fn())?.trim();
        IconCache.set(lib, name, svg);
        return svg;
      } catch (error) {
        // 일시 오류 — 캐시하지 않고 undefined로 종결. 다음 조회 시 재시도된다.
        console.error(`[IconRegistry] '${key}' 아이콘 리졸브 실패 (재시도 가능):`, error);
        return undefined;
      }
    })();

    this.pending.set(key, task);
    void task.finally(() => this.pending.delete(key));
    return task;
  }
}

//#region 기본 아이콘 라이브러리 등록

// 기본 내장 아이콘 라이브러리 등록
// - 프로젝트 내부에서 직접 관리하는 아이콘 번들
// - 네트워크 요청 없이 빠르게 로드
IconRegistry.register("internal", (name: string) => {
  return InternalIconBundle.get(name);
});

// Tabler 아이콘 등록 (CDN 사용) - https://tabler.io/icons
// - 약 5000+ 이상의 매우 많은 아이콘 제공
// - 기본적으로 얇고 깔끔한 outline 스타일
// - 대시보드, 관리자 UI, SaaS UI에 많이 사용
// - outline / filled 스타일 제공
// 내장 CDN 리졸버는 순수 fetch만 담당한다 — 캐싱(성공/네거티브)과 in-flight dedupe는
// IconRegistry.resolve()가 소유한다. IconResolver 계약에 따라:
// - HTTP 실패(404 등) → undefined 반환 (not-found 확정, 네거티브 캐시 대상)
// - 네트워크 오류 → throw 전파 (일시 오류, 캐시하지 않고 재시도 허용)
IconRegistry.register("tabler", async (name: string) => {
  const [iconName, style = 'outline'] = name.split(':');
  const version = '3.40.0';
  const url = `https://cdn.jsdelivr.net/npm/@tabler/icons@${version}/icons/${style}/${iconName}.svg`;
  const response = await fetch(url);
  if (!response.ok) return undefined;
  return await response.text();
});

// Heroicons 아이콘 등록 (CDN 사용) - https://heroicons.com/
// - Tailwind Labs에서 만든 아이콘
// - Tailwind + modern UI 디자인과 매우 잘 어울림
// - outline / solid 스타일 제공
// - 아이콘 수는 비교적 적지만 디자인 완성도가 높음
IconRegistry.register("heroicons", async (name: string) => {
  const [iconName, style = 'outline', size = '24'] = name.split(':');
  const version = '2.2.0';
  const url = `https://cdn.jsdelivr.net/npm/heroicons@${version}/${size}/${style}/${iconName}.svg`;
  const response = await fetch(url);
  if (!response.ok) return undefined;
  return await response.text();
});

// Lucide 아이콘 등록 (CDN 사용) - https://lucide.dev/
// - Feather Icons의 현대적인 fork
// - 매우 미니멀하고 균형 잡힌 디자인
// - React/Vue/Svelte 등 다양한 생태계에서 인기
// - 일반적인 웹앱 UI에 무난하게 사용 가능
IconRegistry.register("lucide", async (name: string) => {
  const version = '0.577.0';
  const url = `https://cdn.jsdelivr.net/npm/lucide-static@${version}/icons/${name}.svg`;
  const response = await fetch(url);
  if (!response.ok) return undefined;
  return await response.text();
});

// Bootstrap 아이콘 등록 (CDN 사용) - https://icons.getbootstrap.com/
// - Bootstrap 디자인 시스템용 아이콘
// - 비교적 두꺼운 선 스타일
// - 일반적인 웹 UI, 관리자 페이지에서 많이 사용
// - Bootstrap 기반 프로젝트와 특히 잘 맞음
IconRegistry.register("bootstrap", async (name: string) => {
  const version = '1.13.1';
  const url = `https://cdn.jsdelivr.net/npm/bootstrap-icons@${version}/icons/${name}.svg`;
  const response = await fetch(url);
  if (!response.ok) return undefined;
  return await response.text();
});

//#endregion

export {
  getDefaultBaseUrl,
  setDefaultBaseUrl,
  IconCache,
  IconRegistry,
};