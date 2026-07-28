/**
 * React strict 소비 타입 스모크 — **컴파일되는 것 자체가 테스트**다(런타임 assertion 없음).
 *
 * 배경: 소비자(U-CMMS)가 React 19 + TS strict 에서 래퍼를 쓰지 못했던 결함 2건
 * (ISSUE-20260722-react-wrapper-typing)은 순수 **타입** 실패였다 —
 *   1. `Partial<Element>` 의 DOM `children: HTMLCollection` 이 JSX children 을 가려
 *      `<UButton>text</UButton>` 이 TS2747 로 실패.
 *   2. `React.HTMLAttributes` 의 `onChange` 와 래퍼의 CustomEvent 시그니처가 교집합되어
 *      어떤 핸들러도 대입 불가.
 * 둘 다 런타임에는 드러나지 않으므로 vitest 로는 잡을 수 없다. 타입 픽스처가 유일한 감시망이다.
 *
 * **왜 메인 tsconfig 가 아니라 별도 프로젝트인가**: 검증 대상이 `dist/react/*.d.ts` — 즉
 * `vite-plugin-react-wrapper` 가 **빌드 시점에 생성하는** 산출물이다. `dist` 는 gitignore
 * 대상이라 fresh clone 에는 없다. 메인 `tsconfig` 에 넣으면 빌드 전 `tsc --noEmit` 이 거짓
 * 실패하고 doctor 의 타입 스윕까지 오염된다. 그래서 `tsconfig.react-smoke.json` 으로 분리하고
 * `build` 파이프라인 **끝**(dist 가 반드시 존재하는 시점)에 건다.
 *
 * 진입점은 상대경로가 아니라 `@iyulab/components/react` — 소비자가 실제로 쓰는 경로를 그대로
 * 통과시켜야 `exports` 맵과 생성된 `.d.ts` 가 함께 검증된다.
 */
import * as React from 'react';
import {
  UButton,
  USelect,
  UOption,
  type USelectProps,
} from '@iyulab/components/react';
// 래퍼와 이름이 같으므로 엘리먼트 클래스는 별칭으로 가져온다
import type { UButton as UButtonElement } from '@iyulab/components';

/** 회귀 1 — JSX children (TS2747) */
export const Children = (): React.JSX.Element => <UButton>확인</UButton>;

/** 회귀 2 — CustomEvent 핸들러 대입 */
export const Events = (): React.JSX.Element => (
  <USelect label="자원 구분" onChange={(e: CustomEvent) => void e.target}>
    <UOption value="materials">자재</UOption>
  </USelect>
);

/** 컴포넌트 고유 prop 이 광역 `Omit` 에 쓸려나가지 않았는지 */
export const OwnProps: USelectProps = {
  multiple: true,
  searchable: true,
  placeholder: '선택하세요',
};

/** 표준 HTML 속성·핸들러가 여전히 통과하는지 (HTMLAttributes 쪽을 과하게 제거하지 않았는지) */
export const StandardAttributes = (): React.JSX.Element => (
  <UButton id="submit" className="primary" title="제출" onClick={() => undefined} />
);

/**
 * ref 전달 — `ForwardRefExoticComponent<P>` 는 P 에 ref 를 자동으로 더해 주지 않으므로
 * 생성기가 `React.RefAttributes` 를 명시해야 한다. 이 스모크가 첫 실행에서 그 누락을 잡았다
 * (런타임은 @lit/react 가 ref 를 전달하는데 타입만 거부하던 상태).
 * 또한 ref 는 `HTMLElement` 가 아니라 **엘리먼트 클래스**로 좁혀져야 한다.
 */
export const WithRef = (): React.JSX.Element => {
  const ref = React.useRef<UButtonElement>(null);
  return <UButton ref={ref}>ref</UButton>;
};
