# @iyulab/components

Lit 기반 웹 컴포넌트 라이브러리.

[데모 사이트](https://components.iyulab.com)에서 모든 컴포넌트를 직접 확인할 수 있습니다.

## Installation

```bash
npm install @iyulab/components
```

## Usage

```ts
// 전체 import
import '@iyulab/components';

// 개별 import
import '@iyulab/components/u-button';
import '@iyulab/components/u-input';
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

**Buttons & Actions** — `u-button`, `u-button-group`, `u-icon-button`, `u-chip`

**Form Controls** — `u-input`, `u-textarea`, `u-select`, `u-checkbox`, `u-radio`, `u-switch`, `u-slider`, `u-rating`, `u-field`, `u-form`, `u-option`

**Overlay & Floating** — `u-dialog`, `u-drawer`, `u-popover`, `u-tooltip`

**Navigation** — `u-menu`, `u-menu-item`, `u-tab-panel`, `u-breadcrumb`, `u-breadcrumb-item`, `u-tree`, `u-tree-item`

**Layout & Display** — `u-avatar`, `u-card`, `u-carousel`, `u-divider`, `u-icon`, `u-panel`, `u-split-panel`, `u-tag`

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

## Documentation

| 문서 | 내용 |
|------|------|
| [docs/architecture.md](./docs/architecture.md) | 패키지 구조 및 클래스 계층 |
| [docs/guidelines.md](./docs/guidelines.md) | 컴포넌트 개발 가이드라인 |
| [docs/events.md](./docs/events.md) | 이벤트 시스템 카탈로그 |
| [docs/theming.md](./docs/theming.md) | 테마 및 CSS 변수 |
| [docs/form-controls.md](./docs/form-controls.md) | 폼 연동 및 검증 API |
| [docs/icons.md](./docs/icons.md) | 아이콘 등록 및 사용 |

## License

MIT © [iyulab](https://www.iyulab.com)
