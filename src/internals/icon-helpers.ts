/**
 * 아이콘 리소스를 외부(정적 파일/네트워크 경로)에서 로드할 때
 * 기준이 되는 루트 URL입니다.
 *
 * - 기본값: `/assets/icons/`
 * - 런타임에 `setBaseUrl`을 통해 변경할 수 있습니다.
 *
 * 이 값은 모듈 내부에서만 직접 접근하며,
 * 외부에서는 항상 `getBaseUrl` / `setBaseUrl`을 통해 사용해야 합니다.
 */
let iconBaseUrl = '/assets/icons/';

/**
 * 아이콘 이름과 SVG 소스를 매핑하는 레지스트리입니다.
 *
 * - 키: SVG 파일명에서 확장자를 제거한 문자열 (예: `close.svg` → `"close"`)
 * - 값: SVG 파일의 raw 문자열 (`?raw` 옵션으로 로드됨)
 *
 * Vite의 `import.meta.glob`을 사용하여
 * `../assets/icons/*.svg` 경로의 모든 SVG 파일을 빌드 시점에 한 번에 로드합니다.
 * 이 레지스트리는 런타임 동안 불변이며, 아이콘 조회 시 재사용됩니다.
 */
export const iconBundle = new Map<string, string>(
  Object.entries(
    import.meta.glob('../assets/icons/*.svg', {
      eager: true,
      query: '?raw',
    }),
  )
    .map(([path, module]) => {
      const name = path.split('/').pop()?.replace('.svg', '') || '';
      return [name, (module as any).default] as [string, string];
    })
    .filter(([name]) => name !== ''),
);

/**
 * 현재 설정된 아이콘 기본 URL을 반환합니다.
 *
 * 이 값은 아이콘을 정적 경로 또는 CDN 등에서 동적으로 로드할 때
 * prefix로 사용됩니다.
 *
 * @returns 아이콘 로딩에 사용되는 기본 URL (예: `/assets/icons/`)
 */
export function getBaseUrl(): string {
  return iconBaseUrl;
}

/**
 * 아이콘을 외부에서 로드할 때 사용할 기본 URL을 설정합니다.
 *
 * 예:
 * - `/assets/icons/`
 * - `https://cdn.example.com/icons/`
 *
 * 일반적으로 마지막에 슬래시(`/`)가 포함된 형태를 권장합니다.
 *
 * @param url 아이콘이 배포된 기본 경로
 */
export function setBaseUrl(url: string): void {
  iconBaseUrl = url;
}
