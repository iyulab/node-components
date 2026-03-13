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
const internalIconBundle = new Map<string, string>(
  Object.entries(import.meta.glob('../assets/icons/*.svg', {
    eager: true,
    query: '?raw',
  }))
  .map(([path, module]) => {
    const name = path.split('/').pop()?.replace('.svg', '') || '';
    return [name, (module as any).default] as [string, string];
  })
  .filter(([name]) => name !== ''),
);

/**
 * `name`으로 아이콘 리소스를 가져오는 함수입니다.
 */
type IconResolver = (name: string) => string | undefined | Promise<string | undefined>;

/**
 * 아이콘 리소스 캐시입니다.
 * lib + name 조합으로 SVG 리소스를 저장/조회합니다.
 */
class IconCache {
  private static cache = new Map<string, string>();

  /** 클래스 생성 방지 */
  private constructor() {}

  private static makeKey(lib: string, name: string): string {
    return `${lib}:${name}`;
  }

  /**
   * 지정된 lib, name 조합의 리소스가 존재하는지 확인합니다.
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
   */
  public static set(lib: string, name: string, resource: string): void {
    this.cache.set(this.makeKey(lib, name), resource);
  }

  /**
   * 전체 캐시를 비웁니다.
   */
  public static clear(): void {
    this.cache.clear();
  }
}

/**
 * 아이콘 레지스트리입니다.
 * 아이콘 라이브러리를 등록하고, 아이콘을 조회하는 기능을 제공합니다.
 */
class IconRegistry {
  private static libs = new Map<string, IconResolver>();

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
   * 이미 등록된 라이브러리 이름인 경우, 경고 메시지를 출력합니다.
   */
  public static register(lib: string, resolver: IconResolver) {
    if (this.libs.has(lib)) {
      console.warn(`Icon library "${lib}" is already registered`); // eslint-disable-line no-console
    } else {
      this.libs.set(lib, resolver);
    }
  }

  /**
   * 지정된 아이콘 라이브러리를 등록 해제합니다.
   */
  public static unregister(lib: string) {
    this.libs.delete(lib);
  }

  /**
   * 지정된 아이콘 라이브러리의 svg 아이콘 소스를 가져옵니다.
   */
  public static async resolve(lib: string, name: string): Promise<string | undefined> {
    const resolver = this.libs.get(lib);
    if (!resolver) return undefined;

    const svg = await resolver(name);
    return svg?.trim();
  }
}

//#region 기본 아이콘 라이브러리 등록

// 기본 내장 아이콘 라이브러리 등록
// - 프로젝트 내부에서 직접 관리하는 아이콘 번들
// - 네트워크 요청 없이 빠르게 로드
IconRegistry.register("internal", (name: string) => {
  return internalIconBundle.get(name);
});

// Tabler 아이콘 등록 (CDN 사용) - https://tabler.io/icons
// - 약 5000+ 이상의 매우 많은 아이콘 제공
// - 기본적으로 얇고 깔끔한 outline 스타일
// - 대시보드, 관리자 UI, SaaS UI에 많이 사용
// - outline / filled 스타일 제공
IconRegistry.register("tabler", async (name: string) => {
  if (IconCache.has("tabler", name)) {
    return IconCache.get("tabler", name);
  }
  
  try {
    const [iconName, style = 'outline'] = name.split(':');
    const version = '3.40.0';
    const url = `https://cdn.jsdelivr.net/npm/@tabler/icons@${version}/icons/${style}/${iconName}.svg`;
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const svg = await response.text();
    IconCache.set("tabler", name, svg);
    return svg;
  } catch {
    return undefined;
  }
});

// Heroicons 아이콘 등록 (CDN 사용) - https://heroicons.com/
// - Tailwind Labs에서 만든 아이콘
// - Tailwind + modern UI 디자인과 매우 잘 어울림
// - outline / solid 스타일 제공
// - 아이콘 수는 비교적 적지만 디자인 완성도가 높음
IconRegistry.register("heroicons", async (name: string) => {
  if (IconCache.has("heroicons", name)) {
    return IconCache.get("heroicons", name);
  }
  
  try {
    const [iconName, style = 'outline', size = '24'] = name.split(':');
    const version = '2.2.0';
    const url = `https://cdn.jsdelivr.net/npm/heroicons@${version}/${size}/${style}/${iconName}.svg`;
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const svg = await response.text();
    IconCache.set("heroicons", name, svg);
    return svg;
  } catch {
    return undefined;
  }
});

// Lucide 아이콘 등록 (CDN 사용) - https://lucide.dev/
// - Feather Icons의 현대적인 fork
// - 매우 미니멀하고 균형 잡힌 디자인
// - React/Vue/Svelte 등 다양한 생태계에서 인기
// - 일반적인 웹앱 UI에 무난하게 사용 가능
IconRegistry.register("lucide", async (name: string) => {
  if (IconCache.has("lucide", name)) {
    return IconCache.get("lucide", name);
  }

  try {
    const version = '0.577.0';
    const url = `https://cdn.jsdelivr.net/npm/lucide-static@${version}/icons/${name}.svg`;
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const svg = await response.text();
    IconCache.set("lucide", name, svg);
    return svg;
  } catch {
    return undefined;
  }
});

// Bootstrap 아이콘 등록 (CDN 사용) - https://icons.getbootstrap.com/
// - Bootstrap 디자인 시스템용 아이콘
// - 비교적 두꺼운 선 스타일
// - 일반적인 웹 UI, 관리자 페이지에서 많이 사용
// - Bootstrap 기반 프로젝트와 특히 잘 맞음
IconRegistry.register("bootstrap", async (name: string) => {
  if (IconCache.has("bootstrap", name)) {
    return IconCache.get("bootstrap", name);
  }

  try {
    const version = '1.13.1';
    const url = `https://cdn.jsdelivr.net/npm/bootstrap-icons@${version}/icons/${name}.svg`;
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const svg = await response.text();
    IconCache.set("bootstrap", name, svg);
    return svg;
  }
  catch (error) {
    return undefined;
  }
});

//#endregion

export {
  getDefaultBaseUrl,
  setDefaultBaseUrl,
  IconCache,
  IconRegistry,
};