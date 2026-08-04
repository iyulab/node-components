import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  :host([disabled]) {
    opacity: 0.5;
  }

  /* ⚠테두리·면은 :host 가 아니라 내부 래퍼가 그린다 — :host 에 두면 소비 앱의 CSS
     리셋(* { border: 0 })이 «에러 없이» 지운다(Tailwind preflight 가 가장 흔한 경우다).
     이 리포는 그 결함을 9개 컴포넌트에서 이미 걷어냈고 회귀 테스트가 목록을 0 으로 잠근다
     — tests/build/host-layout-reset.test.ts */
  .frame {
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-md, 4px);
    background-color: var(--u-bg-color, #FFFFFF);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    box-sizing: border-box;
    padding: var(--u-space-sm, 8px) var(--u-space-md, 12px);
    border: none;
    border-radius: inherit;
    background: none;
    color: var(--u-txt-color, #212121);
    font: inherit;
    font-size: var(--u-text-body-size, 14px);
    font-weight: var(--u-text-subtitle-weight, 600);
    text-align: start;
    cursor: pointer;
  }
  .header:disabled {
    cursor: default;
  }
  .header:focus-visible {
    outline: 2px solid var(--u-primary-color-strong, #1565C0);
    outline-offset: -2px;
  }

  .icon {
    flex: none;
    color: var(--u-txt-color-weak, #757575);
    transition: transform var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  :host([open]) .icon {
    transform: rotate(90deg);
  }

  .label {
    flex: 1 1 auto;
    min-width: 0;
  }

  /* 높이 애니메이션은 grid 트랙(0fr ↔ 1fr)으로 한다 — 콘텐츠 높이를 JS 로 재지 않는다.
     ⚠전환을 지원하지 않는 엔진에서는 «즉시» 열리고 닫힐 뿐 접힘 자체는 성립한다
     (0fr 은 그 엔진에서도 유효한 트랙 크기다).
     ★visibility 를 함께 옮기는 것이 요점이다 — overflow: hidden 만으로는 접힌 콘텐츠가
     여전히 접근성 트리와 탭 순서에 남는다. */
  .content {
    display: grid;
    grid-template-rows: 0fr;
    visibility: hidden;
    transition:
      grid-template-rows var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      visibility var(--u-duration-normal, 220ms);
  }
  :host([open]) .content {
    grid-template-rows: 1fr;
    visibility: visible;
  }
  .inner {
    overflow: hidden;
  }
  .body {
    padding: 0 var(--u-space-md, 12px) var(--u-space-md, 12px);
  }

  /* 이 전환은 «장식»이다 — 접힘/펼침의 결과는 정지 상태에서도 그대로 읽힌다.
     ⚠시트의 reduce 규칙(지속시간 축 0)에 기대지 않고 여기서도 누른다: 소비자가 토큰
     시트를 로드하지 않으면 use-site 폴백 리터럴이 살아남아 그 규칙이 닿지 못한다. */
  @media (prefers-reduced-motion: reduce) {
    .icon,
    .content {
      transition-duration: 0s;
    }
  }
`;
