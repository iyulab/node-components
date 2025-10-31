/**
 * 내부적으로 사용되는 아이콘 레지스트리입니다.
 * SVG 아이콘 파일을 이름과 매핑하여 저장합니다.
 * 아이콘 파일은 '../assets/icons/' 경로에서 자동으로 로드됩니다.
 */
export const icons = new Map<string, string>(
  Object.entries(import.meta.glob('../assets/icons/*.svg', { 
    eager: true,
    query: '?raw'
  })).map(([path, module]) => {
    const name = path.split('/').pop()?.replace('.svg', '') || '';
    return [name, (module as any).default] as [string, string];
  }).filter(([name]) => name !== '')
);