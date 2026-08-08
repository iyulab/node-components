# @iyulab/components

Lit 기반 웹 컴포넌트 라이브러리.

[데모 사이트](https://components.iyulab.com)에서 모든 컴포넌트를 직접 확인할 수 있습니다.

## Installation

```bash
npm install @iyulab/components
```

## Usage

```ts
// 디자인 토큰 (필수 — 없으면 테두리·배경이 조용히 사라진다)
import '@iyulab/components/styles/tokens.css';

// 전체 import
import '@iyulab/components';

// 개별 import
import '@iyulab/components/u-button';
import '@iyulab/components/u-input';
```

> **토큰 시트는 선택이 아니다.** 컴포넌트의 모든 색·테두리·배경은 `var(--u-…)` 로 해석되며,
> 미정의 커스텀 프로퍼티는 선언 전체를 무효로 만든다 — 에러도 경고도 없이 컨트롤이
> 무스타일로 렌더된다. 정적 CSS 대신 런타임 `Theme.init()` 을 써도 되지만, **둘 중 하나는
> 반드시 필요하다.** 자세한 내용은 [docs/theming.md](docs/theming.md) 참조.

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
      <UButton variant="solid" color="primary" size="sm">Submit</UButton>
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

**Form Controls** — `u-input`, `u-textarea`, `u-select`, `u-date-picker`, `u-checkbox`, `u-radio`, `u-switch`, `u-slider`, `u-rating`, `u-field`, `u-form`, `u-option`

**Overlay & Floating** — `u-dialog`, `u-drawer`, `u-popover`, `u-tooltip`

**Navigation** — `u-menu`, `u-menu-item`, `u-tab-panel`, `u-breadcrumb`, `u-breadcrumb-item`, `u-tree`, `u-tree-item`

**Layout & Display** — `u-avatar`, `u-card`, `u-carousel`, `u-divider`, `u-icon`, `u-panel`, `u-split-panel`, `u-tag`, `u-text`

## Theming

```ts
import { Theme } from '@iyulab/components';

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

## Localization

라이브러리가 **스스로 생성하는 문자열**(검증 메시지)은 내장 로케일 14종을 갖고 있으며,
활성 로케일 하나로 전부 따라옵니다.

```ts
import { Locale } from '@iyulab/components';

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

- 조회 사슬은 검증 메시지와 같습니다: **정확 일치 → base 언어(`ko-KR` → `ko`) → `en`**.
- 같은 이름의 네임스페이스는 **같은 저장소**를 가리킵니다(모듈 어디서 만들어도 됩니다).
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
