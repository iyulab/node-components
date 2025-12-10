/**
 * 아이콘 리소스를 외부(정적 파일/네트워크 경로)에서 로드할 때 기준이 되는 URL입니다.
 *
 * 이 값은 모듈 내부에서만 직접 접근하며,
 * 외부에서는 항상 `getDefaultBaseUrl` / `setDefaultBaseUrl`을 통해 사용해야 합니다.
 */
let defaultIconBaseUrl = '/assets/icons/';

/**
 * 아이콘 캐시 맵입니다.
 * 한 번 로드된 아이콘은 이 맵에 저장되어 재사용됩니다.
 */
const defaultIconCache = new Map<string, string>();

/**
 * 아이콘 이름과 SVG 소스를 매핑하는 레지스트리입니다.
 *
 * Vite의 `import.meta.glob`을 사용하여
 * `../assets/icons/*.svg` 경로의 모든 SVG 파일을 빌드 시점에 한 번에 로드합니다.
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

type IconResolver = (name: string) => string | undefined | Promise<string | undefined>;

/**
 * 아이콘 레지스트리 클래스입니다.
 * 아이콘 라이브러리를 등록하고, 아이콘을 조회하는 기능을 제공합니다.
 */
class IconRegistry {
  private static _instance: IconRegistry;
  private libs = new Map<string, IconResolver>();

  private constructor() {}

  public static get instance(): IconRegistry {
    if (!this._instance) {
      this._instance = new IconRegistry();
    }
    return this._instance;
  }

  /**
   * 지정된 아이콘 라이브러리가 등록되었는지 확인합니다.
   */
  public has(lib: string) {
    return this.libs.has(lib);
  }

  /**
   * 지정된 아이콘 라이브러리를 등록합니다.
   * 이미 등록된 라이브러리 이름인 경우, 경고 메시지를 출력합니다.
   */
  public register(lib: string, resolver: IconResolver) {
    if (this.libs.has(lib)) {
      console.warn(`Icon library "${lib}" is already registered`); // eslint-disable-line no-console
    } else {
      this.libs.set(lib, resolver);
    }
  }

  /**
   * 지정된 아이콘 라이브러리를 등록 해제합니다.
   */
  public unregister(lib: string) {
    this.libs.delete(lib);
  }

  /**
   * 지정된 아이콘 라이브러리의 svg 아이콘 소스를 가져옵니다.
   */
  public async resolve(lib: string, name: string): Promise<string | undefined> {
    const resolver = this.libs.get(lib);
    if (!resolver) return undefined;

    const svg = await resolver(name);
    return svg?.trim();
  }
}

// 기본 내장 아이콘 라이브러리 등록
IconRegistry.instance.register("internal", (name: string) => {
  return internalIconBundle.get(name);
});
// 기본 원격 아이콘 라이브러리 등록
IconRegistry.instance.register("default", async (name: string) => {
  if (defaultIconCache.has(name)) {
    return defaultIconCache.get(name);
  }

  const baseUrl = getDefaultBaseUrl();
  const remoteUrl = baseUrl.endsWith('/')
    ? `${baseUrl}${name}.svg`
    : `${baseUrl}/${name}.svg`;
  
  try {
    const response = await fetch(remoteUrl);
    if (!response.ok) return undefined;
    const svg = await response.text();
    defaultIconCache.set(name, svg);
    return svg;
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
    return undefined;
  }
});

/**
 * 전역 아이콘 레지스트리 인스턴스에 접근합니다.
 * 기본 내장 아이콘 라이브러리가 포함되어 있습니다.
 */
export const icons = IconRegistry.instance;

/**
 * `default` 라이브러리에서 아이콘을 로드할 때 사용할 기본 URL을 반환합니다.
 */
export function getDefaultBaseUrl(): string {
  return defaultIconBaseUrl;
}

/**
 * `default` 라이브러리에서 아이콘을 로드할 때 사용할 기본 URL을 설정합니다.
 *
 * @example
 * - `/assets/icons/`
 * - `https://cdn.example.com/icons/`
 */
export function setDefaultBaseUrl(url: string): void {
  defaultIconBaseUrl = url;
}