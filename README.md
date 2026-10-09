# @iyulab/components

Lit 기반 웹 컴포넌트 라이브러리.

[데모 사이트](https://components.iyulab.com)에서 모든 컴포넌트를 직접 확인할 수 있습니다.

## Installation

```bash
npm install @iyulab/components
```

## Quick Start

아래 파일 하나가 그대로 돌아가는 첫 페이지입니다(Vite 기준 — `index.html` 이 `src/main.ts` 를 모듈로 싣는다).

```ts
// src/main.ts
import '@iyulab/components/styles/tokens.css';
import { Toast } from '@iyulab/components';

document.body.innerHTML = `
  <form id="signup" style="display: grid; gap: 12px; max-width: 320px; margin: 32px">
    <u-input name="email" type="email" label="Email" required></u-input>
    <u-button type="submit" color="primary">Sign up</u-button>
  </form>
`;

const form = document.querySelector<HTMLFormElement>('#signup')!;
form.addEventListener('submit', (event) => {
  event.preventDefault();
  Toast.success(`Welcome, ${new FormData(form).get('email')}`);
});
```

`u-input` 과 `u-button` 은 네이티브 폼에 참여하므로 `FormData`·`required` 검증·Enter 제출이 그대로 동작합니다.

## Usage

```ts
// 디자인 토큰 (필수 — 없으면 테두리·배경이 조용히 사라진다)
import '@iyulab/components/styles/tokens.css';

// 전체 import
import '@iyulab/components';

// 개별 import (등록 부수효과만 — 쓰는 컴포넌트만 번들에 들어간다)
import '@iyulab/components/dist/components/button/UButton.js';
import '@iyulab/components/dist/components/input/UInput.js';

// 유틸리티도 개별로 — 배럴('@iyulab/components')은 값 하나만 가져와도 컴포넌트를 전부 등록한다
import { Theme } from '@iyulab/components/dist/utilities/Theme.js';
```

> **배럴은 «전체 등록» 이다.** `import { Theme } from '@iyulab/components'` 한 줄이 모든 컴포넌트를 등록하고 번들에
> 싣는다(실측: `Theme` 하나에 gzip 158KB ↔ 개별 경로 19KB). 컴포넌트를 개별로 가져오는 앱은 유틸리티도
> `@iyulab/components/dist/utilities/<이름>.js` 에서 가져온다. 아래 절의 예시는 이 경로를 쓴다.

> **토큰 시트는 선택이 아니다.** 컴포넌트의 모든 색·테두리·배경은 `var(--u-…)` 로 해석되며,
> 미정의 커스텀 프로퍼티는 선언 전체를 무효로 만든다 — 에러도 경고도 없이 컨트롤이
> 무스타일로 렌더된다. 정적 CSS 대신 런타임 `Theme.init()` 을 써도 되지만, **둘 중 하나는
> 반드시 필요하다.** 자세한 내용은 [docs/theming.md](docs/theming.md) 참조.


## 반드시 한 벌이어야 한다 (single instance)

이 패키지는 **프로세스 전역 자원**을 소유합니다 — custom element 레지스트리
(`customElements.define`)와 모듈 싱글턴(`Theme` · `Toast` · `OverlayManager`)입니다. 설치
트리에 사본이 둘 이상 들어오면 **에러 없이** 다음이 일어납니다.

- 같은 태그를 두 번 등록하려다 두 번째가 무시되어, **어느 사본의 구현이 뜨는지 정해지지 않는다**
- 싱글턴 상태가 갈라져, 한 사본에 등록한 오버레이를 다른 사본의 토스트가 보지 못한다
  (모달 위에 떠야 할 알림이 뒤로 숨는 형태로 나타난다)

그래서 이 패키지에 의존하는 라이브러리는 이것을 `dependencies` 가 아니라
**`peerDependencies`** 로 선언합니다 — 소비 앱이 설치한 한 벌을 그대로 쓰기 위해서입니다.
직접·간접으로 이 패키지를 쓰는 라이브러리를 여럿 함께 쓴다면, 설치 후 사본이 하나인지
확인하십시오.

```bash
npm ls @iyulab/components   # 트리 전체에서 몇 벌인지 — 하나여야 한다
```

> 번들러로 겹쳐 쓸 수도 있습니다(Vite `resolve.dedupe`, webpack `resolve.alias`). 다만 그것은
> 증상을 덮는 것이지 원인을 없애지 않으므로, 사본이 둘로 보이면 먼저 **어느 의존이 이 패키지를
> `dependencies` 로 선언했는지** 확인하는 편이 낫습니다.

## React

React 프로젝트에서는 `@iyulab/components/react` 서브패스가 모든 컴포넌트를 `forwardRef` 래퍼로 제공합니다. Web Component를 직접 다루지 않고도 JSX props(`color`, `size`, 이벤트 `onXxx` 등)로 사용할 수 있습니다.

`@lit/react`·`react`는 peerDependency이므로 소비 앱에 함께 설치해야 합니다.

```bash
npm install @iyulab/components @lit/react react
```

```tsx
import { UButton, UInput } from '@iyulab/components/react';

function Form() {
  return (
    <>
      <UInput label="Name" />
      <UButton appearance="solid" color="primary" size="sm">Submit</UButton>
    </>
  );
}
```

## Skills Usage

LLM 코딩 에이전트(Claude Code, GitHub Copilot, Cursor 등)를 위한 스킬을 제공합니다.

```bash
# GitHub에서 설치
npx skills add iyulab/node-components

# 패키지 설치 후 로컬에서 참조
npx skills add ./node_modules/@iyulab/components
```

## Components

**Feedback** — `u-alert`, `u-badge`, `u-spinner`, `u-skeleton`, `u-progress-bar`, `u-progress-ring`

**Buttons & Actions** — `u-button`, `u-button-group`, `u-icon-button`, `u-copy-button`, `u-chip`

**Form Controls** — `u-input`, `u-textarea`, `u-select`, `u-date-picker`, `u-date-range-picker`, `u-file-input`, `u-checkbox`, `u-radio`, `u-switch`, `u-slider`, `u-rating`, `u-field`, `u-form`, `u-option`

**Overlay & Floating** — `u-dialog`, `u-drawer`, `u-popover`, `u-tooltip`

**Navigation** — `u-menu`, `u-menu-item`, `u-tab-panel`, `u-breadcrumb`, `u-breadcrumb-item`, `u-pagination`, `u-tree`, `u-tree-item`

**Layout & Display** — `u-avatar`, `u-card`, `u-carousel`, `u-divider`, `u-expander`, `u-icon`, `u-panel`, `u-split-panel`, `u-tag`, `u-text`

## Theming

```ts
import { Theme } from '@iyulab/components/dist/utilities/Theme.js';

await Theme.init({
  default: 'system',       // 'light' | 'dark' | 'system'
  useBuiltIn: true,        // 내장 light/dark CSS 사용
  store: { type: 'localStorage', prefix: 'my-app' },
});

Theme.set('dark');
Theme.set('system');
```

모든 CSS 변수는 `--u-` 접두사를 사용하며 `:root`에서 재정의할 수 있습니다.

```css
:root {
  --u-blue-600: #3B82F6;
  --u-font-base: 'Pretendard', sans-serif;
}
```

자세한 내용은 [docs/theming.md](./docs/theming.md)를 참고하세요.

## Accessibility

기준판은 **WCAG 2.2** 입니다. 아래는 이 패키지가 **테스트로 재서 보장하는 것**이고, 그 밖의
성공 기준까지 포함한 전체 준수 선언이 아닙니다.

| 성공 기준 | 보장 | 어디서 재는가 |
|---|---|---|
| SC 1.4.3 · 1.4.11 명암비 | 역할 토큰의 `-color`·`-color-strong`·`-bg-color` 단계가 텍스트 4.5 / 비텍스트 3.0 을 라이트·다크 양쪽에서 충족 | `tests/build/token-contrast.test.ts` |
| SC 2.5.8 타깃 크기(최소) | 등록된 모든 컴포넌트의 포인터 타깃이 24×24 CSS px 이상이거나 간격 예외(중심 간 24px)를 충족하고, 그 좌표에서 실제로 눌린다 | `tests/browser/target-size.browser.test.ts`(실제 크로미움) |
| SC 2.1.1 키보드(포인터 커서 검사) | 픽스처가 그리는 어떤 요소도 포인터 커서를 보이면서 상호작용 요소가 아닌 채로 있지 않다 — 클릭만 받는 `div` 가 들어오지 못한다(키 처리 자체는 컴포넌트 테스트가 잰다) | 같은 파일 |
| SC 1.3.1 정보와 관계 · SC 4.1.2 이름·역할·값 | `u-field` 의 `label`/`description` 이 슬롯된 컨트롤의 접근성 이름·설명으로 실제로 도달한다(네이티브 엘리먼트 · `u-*` 폼 컨트롤 양쪽) | `tests/browser/field-label-association.browser.test.ts` |

🔴**폼 컨트롤의 접근성 이름은 «한 곳에서만» 준다.** `u-field` 는 자기 `label` 을 슬롯된 컨트롤에
`aria-label` 로 얹고(섀도우 경계를 넘지 못하는 `aria-labelledby` 대신 문자열 복사다), 폼 컨트롤은
호스트의 `aria-label` 을 내부 네이티브 컨트롤로 내려보낸다. **컨트롤이 자기 `label`·`aria-label`·
`aria-labelledby` 를 이미 가지면 `u-field` 는 덮지 않는다** — 덮으면 눈에 보이는 라벨과 접근성
이름이 어긋난다(SC 2.5.3 Label in Name). 양쪽에 `label` 을 주면 라벨이 **두 번 그려지고**, 개발
모드 콘솔이 그 자리를 지목한다.

```html
<!-- ✅ 라벨은 한 곳 -->
<u-field label="Keyword"><u-input></u-input></u-field>
<u-input label="Keyword"></u-input>

<!-- ❌ 두 번 그려진다 -->
<u-field label="Keyword"><u-input label="Keyword"></u-input></u-field>
```

⚠ 타깃 크기 보장은 `--u-density` **`14px` 이상**에서 성립합니다 — 컨트롤 패딩이 `em` 이라 그보다
낮추면 타깃이 함께 줄어듭니다([docs/theming.md](./docs/theming.md)의 밀도 절 참고).
터치·장갑 환경처럼 더 큰 타깃이 필요하면 글자 크기와 따로 `--u-target-size`(예: `44px`)로 하한을 올립니다
([docs/theming.md](./docs/theming.md)의 «Target size» 절).

### KWCAG 2.2 대응표

국내 품질인증이 쓰는 **KWCAG 2.2**(한국형 웹 콘텐츠 접근성 지침)의 검사항목 33개를, 이 패키지와
그 위에 쌓는 형제 패키지(`@iyulab/modern-app` · `@iyulab/data-components` · `@iyulab/chat-components` ·
`@iyulab/flex-table` · `@iyulab/u-widgets` · `@iyulab/router`)가 무엇을 맡는지로 나눈 표입니다.
**준수 선언이 아닙니다** — 인증은 완성된 앱을 대상으로 하고, 앱이 직접 그린 것은 언제나 앱의
몫입니다.

- **게이트 보장** — 이 생태계가 그리는 것에 대해 시험이 잰다. 기본 사용이면 앱이 따로 할 일이 없다.
- **공동 책임** — 이 생태계는 수단을 주고 일부를 잰다. 충족 여부는 앱이 넣는 내용·설정에 달렸다.
- **비대상** — 이 생태계가 그런 콘텐츠나 입력을 만들지 않는다.

재는 곳의 경로는 각 패키지 리포 기준입니다(접두어가 없으면 이 패키지).

| 검사항목 | 구분 | 이 생태계가 하는 것 · 앱이 할 것 | 재는 곳 |
|---|---|---|---|
| 5.1.1 적절한 대체 텍스트 | 공동 책임 | 아이콘만 있는 내장 컨트롤은 로케일을 따르는 접근성 이름을 갖는다. 이미지·아이콘 콘텐츠의 대체 텍스트는 앱이 준다 | `tests/browser/carousel-accessible-name` · `copy-button-label` · `dialog-default-labels` · chat-components `icon-only-button-accessible-name` |
| 5.2.1 자막 제공 | 공동 책임 | u-widgets `video` 는 `data.tracks`, chat-components `u-video-block` 은 `tracks` 로 자막·캡션 트랙(WebVTT)을 받는다 — 영상이 섀도 안에 있어 앱이 `<track>` 을 넣을 수 없기 때문이다. 자막 내용은 앱이 준다 | u-widgets `video-tracks` · chat-components `video-block-tracks` |
| 5.3.1 표의 구성 | 공동 책임 | `u-flex-table` 은 가상 스크롤에서도 행·열 순번(`aria-rowindex`·`aria-colindex`)과 전체 크기를 알린다. 표 제목·머리글 문구는 앱이 준다 | flex-table `tests/browser/aria-grid-index` |
| 5.3.2 콘텐츠의 선형구조 | 공동 책임 | 컴포넌트의 DOM 순서가 표시 순서다. 화면 배치 순서는 앱이 정한다 | — |
| 5.3.3 명확한 지시사항 제공 | 공동 책임 | 내장 문구(검증 메시지 등)는 모양·위치에 기대지 않는다. 앱의 안내 문구는 앱이 쓴다 | — |
| 5.4.1 색에 무관한 콘텐츠 인식 | 공동 책임 | `u-alert` 는 상태를 색과 함께 제목(로케일)으로도 알린다. 앱은 색만으로 뜻을 전하지 않는다 | `tests/browser/alert-default-title` · `alert-aria` |
| 5.4.2 자동 재생 금지 | 공동 책임 | u-widgets `video` 의 자동 재생은 스펙이 켤 때만이고 언제나 소리 없이 시작한다. chat-components 파일 미리보기의 영상은 사용자가 미리보기를 연 뒤에만 재생된다. 앱이 넣는 영상·음성은 앱의 몫 | — |
| 5.4.3 텍스트 콘텐츠의 명도 대비 | 게이트 보장 | 역할 토큰이 텍스트 4.5 / 비텍스트 3.0 을 라이트·다크 양쪽에서 충족한다. 토큰을 덮어쓴 색은 앱의 몫 | `tests/build/token-contrast` |
| 5.4.4 콘텐츠 간의 구분 | 공동 책임 | 테두리·간격 토큰을 준다. 콘텐츠 사이 구분은 앱 배치가 정한다 | — |
| 6.1.1 키보드 사용 보장 | 공동 책임 | 포인터 커서를 보이는 것은 모두 상호작용 요소다(클릭만 받는 `div` 없음). 컴포넌트별 키 조작은 각 시험이 잰다. 앱이 그린 조작 요소는 앱의 몫 | `tests/browser/target-size`(각 패키지) · `tab-panel-keyboard-navigation` · `date-picker-keyboard` · data-components `u-simple-sheet-keyboard-select` |
| 6.1.2 초점 이동과 표시 | 공동 책임 | 오버레이는 열릴 때 초점을 안으로(`[autofocus]` → 첫 입력) 옮긴다. 셸은 라우트가 끝나면 본문(또는 화면의 `[autofocus]`)으로 초점을 옮긴다. 화면 안 초점 순서는 앱 배치가 정한다 | `tests/browser/overlay-initial-focus` · `focus-delegation` · modern-app `sidebar-layout-route-focus` |
| 6.1.3 조작 가능 | 게이트 보장 | 포인터 타깃이 24×24 CSS px 이상이거나 간격 예외를 충족하고, 그 자리에서 실제로 눌린다(`--u-density` 14px 이상) | `tests/browser/target-size`(각 패키지) |
| 6.1.4 문자 단축키 | 공동 책임 | 내장 컴포넌트의 문자 키는 초점을 가진 동안에만 동작한다. 앱 전역 단축키는 앱의 몫 | — |
| 6.2.1 응답시간 조절 | 공동 책임 | 토스트의 표시 시간·세션 만료 같은 시간 제한은 앱이 정한다 | — |
| 6.2.2 정지 기능 제공 | 공동 책임 | `u-carousel[autoplay]` 는 정지/시작 버튼·호버 일시정지·키보드 초점 정지를 갖는다. u-widgets `video` 의 자동 재생은 네이티브 컨트롤로 멈춘다 — 스펙이 `controls: false` 로 끄면 앱의 몫 | `tests/browser/carousel-rotation-control` |
| 6.3.1 깜빡임과 번쩍임 사용 제한 | 공동 책임 | 초당 3회 넘게 번쩍이는 효과를 두지 않고, 장식 애니메이션은 `prefers-reduced-motion` 을 따른다. 앱 콘텐츠는 앱의 몫 | `tests/browser/reduced-motion-decoration` |
| 6.4.1 반복 영역 건너뛰기 | 게이트 보장 | modern-app 사이드바 셸의 첫 탭 정지점이 «본문으로 건너뛰기» 링크이고 본문은 페이지의 단일 `<main>` 이다. 셸을 쓰지 않는 앱은 앱의 몫 | modern-app `sidebar-layout-skip-link` |
| 6.4.2 제목 제공 | 공동 책임 | router 는 라우트의 `title` 을 문서 제목으로 쓴다. 섹션 제목 단계는 `u-group-box` 가 조정할 수 있다. 제목 문구는 앱이 준다 | modern-app `lob-primitives` |
| 6.4.3 적절한 링크 텍스트 | 공동 책임 | 새 창으로 여는 내장 링크는 이름에 그 사실을 붙인다. 링크 문구는 앱이 준다 | chat-components `new-tab-link-name` · modern-app `sidebar-link-new-tab-name` · u-widgets `new-tab-link-name` |
| 6.4.4 고정된 참조 위치 정보 | 비대상 | 쪽 번호를 가진 전자 출판물을 만들지 않는다 | — |
| 6.5.1 단일 포인터 입력 지원 | 공동 책임 | `u-flex-table` 의 열 너비는 끌지 않고 메뉴로도 바꾼다. `u-carousel[draggable]` 은 `navigation`·`pagination` 을 함께 켜야 끌기 없이 넘긴다 | flex-table `column-menu` |
| 6.5.2 포인터 입력 취소 | 공동 책임 | 내장 컨트롤은 네이티브 `click`(누름을 뗄 때)으로 동작한다 | — |
| 6.5.3 레이블과 네임 | 공동 책임 | `u-field` 는 컨트롤이 이미 가진 이름을 덮지 않아 보이는 라벨과 접근성 이름이 어긋나지 않는다 | `tests/browser/field-label-association` |
| 6.5.4 동작기반 작동 | 비대상 | 기기 움직임(흔들기·기울이기) 입력을 쓰지 않는다 | — |
| 7.1.1 기본 언어 표시 | 공동 책임 | 앱이 `<html lang>` 을 정하고, 내장 문구는 그 언어를 따른다 | `tests/browser/locale-detection` |
| 7.2.1 사용자 요구에 따른 실행 | 공동 책임 | 새 창으로 여는 내장 링크는 미리 알린다. 영상 미리보기는 사용자가 연 뒤에만 재생된다 | chat-components · modern-app · u-widgets `new-tab-link-name` 계열 |
| 7.2.2 찾기 쉬운 도움 정보 | 공동 책임 | 셸은 모든 화면에 같은 자리의 메뉴를 준다. 도움 정보를 어디 둘지는 앱이 정한다 | — |
| 7.3.1 오류 정정 | 공동 책임 | 폼 컨트롤은 네이티브 검증 메시지를 로케일로 내고, u-widgets 폼은 오류를 필드에 연결한다(`aria-invalid`·`aria-describedby`). 오류 문구·정정 흐름은 앱의 몫 | u-widgets `tests/elements/uw-form` |
| 7.3.2 레이블 제공 | 공동 책임 | `u-field` 의 `label`·`description` 이 컨트롤의 이름·설명으로 도달한다 | `tests/browser/field-label-association` · `field-accessible-name` · `field-name-reach-census` |
| 7.3.3 접근 가능한 인증 | 공동 책임 | 로그인 화면은 앱이 그린다. `u-input[type=password]` 는 비밀번호 보기 토글을 갖는다 | — |
| 7.3.4 반복 입력 정보 | 공동 책임 | `u-input`·`u-textarea` 는 `autocomplete` 를 내부 컨트롤로 넘긴다. 채울 값은 앱이 정한다 | — |
| 8.1.1 마크업 오류 방지 | 공동 책임 | 컴포넌트는 템플릿이 만든 DOM 을 그린다. 앱 마크업은 앱의 몫 | — |
| 8.2.1 웹 애플리케이션 접근성 준수 | 공동 책임 | 커스텀 컨트롤은 이름·역할·값을 내부 네이티브 요소까지 전달한다. 앱이 만든 컴포넌트는 앱의 몫 | `tests/browser/button-aria-label-shadow-forwarding` · data-components `rich-table-row-checkbox-name` · flex-table `aria-grid-index` |

재는 곳이 «—» 인 행은 아직 시험이 없는 항목입니다. 표시한 파일명은 `.browser.test.ts`·`.test.ts`
확장자를 생략했습니다.

## Localization

라이브러리가 **스스로 생성하는 문자열**(검증 메시지)은 내장 로케일 14종을 갖고 있으며,
활성 로케일 하나로 전부 따라옵니다.

```ts
import { Locale } from '@iyulab/components/dist/utilities/Locale.js';

Locale.set('ko');                                   // 활성 로케일
Locale.register('nl', { valueMissing: '…' });       // 검증 메시지 override
```

### 네임스페이스 — 상위 패키지·앱의 문자열 (1.23.0~)

검증 메시지 키셋은 **닫혀 있습니다**(9키). 그 위에 자기 문자열을 담으려면 네임스페이스를
씁니다 — 키 유니온은 **쓰는 쪽이** 정하므로 라이브러리 키셋은 커지지 않습니다.

```ts
const t = Locale.namespace<'empty' | 'loading'>('u-data-view');

t.register('en', { empty: 'No data', loading: 'Loading…' });   // 기본은 영어
t.register('ko', { empty: '데이터가 없습니다' });               // 필요한 언어만 추가

t.text('empty');                        // 활성 로케일 기준
t.text('greet', { who: 'Ann' });        // {name} 치환
```

- 조회 사슬은 검증 메시지와 같습니다: **정확 일치 → 접두(`zh-Hant-HK` → `zh-Hant` → `zh`) → 그 언어의 기본 지역형(`zh` → `zh-CN` · `zh-Hant`/`zh-HK` → `zh-TW` · `pt` → `pt-BR`) → `en`**.
- 같은 이름의 네임스페이스는 **같은 저장소**를 가리킵니다(모듈 어디서 만들어도 됩니다).
- 요소 하나가 문서와 다른 언어를 쓴다면(인스턴스별 `locale` 속성) `t.textIn(locale, 'empty')` 로 찾습니다 — 사슬은 같고 활성 로케일은 바꾸지 않습니다. `locale` 이 비어 있으면 활성 로케일입니다.
- 사슬에 없는 키는 **키 자체**를 돌려줍니다 — 조용히 빈 문자열이 되지 않습니다.
- `Locale.set()` 하나로 검증 메시지와 네임스페이스가 함께 전환됩니다.

## Documentation

| 문서 | 내용 |
|------|------|
| [docs/architecture.md](./docs/architecture.md) | 패키지 구조 및 클래스 계층 |
| [docs/guidelines.md](./docs/guidelines.md) | 컴포넌트 개발 가이드라인 |
| [docs/events.md](./docs/events.md) | 이벤트 시스템 카탈로그 |
| [docs/theming.md](./docs/theming.md) | 테마 · 역할 토큰 · 브랜딩 |
| [docs/design-tokens.md](./docs/design-tokens.md) | 전역 토큰 전체 목록 (생성) |
| [docs/css-custom-properties.md](./docs/css-custom-properties.md) | 컴포넌트별 CSS 훅 (생성) |
| [docs/form-controls.md](./docs/form-controls.md) | 폼 연동 및 검증 API |
| [docs/icons.md](./docs/icons.md) | 아이콘 등록 및 사용 |
| [docs/native-event.md](./docs/native-event.md) | 컴포넌트가 다루는 네이티브 DOM 이벤트 목록 |

## License

MIT © [iyulab](https://www.iyulab.com)
