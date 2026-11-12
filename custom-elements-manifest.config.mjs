/**
 * Custom Elements Manifest — 소스에서 요소의 속성 · 이벤트 · 슬롯 · CSS 변수 · 파트를 읽어
 * `dist/custom-elements.json` 으로 쓴다(`npm run analyze`, 빌드의 일부). 형제 패키지도 같은 몸을 쓴다
 * (`@iyulab/components/plugins/cem-config.js`) — 이쪽은 그 소스를 바로 읽는다.
 */
import { cemConfig } from './plugins/cem-config.js';

export default cemConfig();
