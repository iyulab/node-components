---
name: iyulab-components-usage
description: >
  @iyulab/components 웹 컴포넌트 라이브러리 사용 가이드.
  Lit 기반 UI 컴포넌트(버튼, 인풋, 다이얼로그, 메뉴, 트리 등 41종)의 설치, 임포트, 속성, 이벤트, 테마, 스타일링 방법을 안내합니다.
  Use when the user asks how to use @iyulab/components, wants to know available components,
  or needs help with component properties, events, theming, or styling.
license: MIT
compatibility: Requires npm and a modern browser supporting Web Components
metadata:
  author: iyulab
  version: "0.4.0"
---

# @iyulab/components 사용 가이드

## 설치 및 임포트

```bash
npm install @iyulab/components
```

```typescript
// 전체 임포트 (모든 컴포넌트 등록)
import "@iyulab/components";

// 개별 컴포넌트 임포트 (트리셰이킹)
import "@iyulab/components/dist/u-button";
import "@iyulab/components/dist/u-input";
```

## 컴포넌트 목록

### 기본 인터랙티브

| 태그 | 클래스 | 설명 |
|------|--------|------|
| `u-button` | UButton | 버튼 (solid, surface, filled, outlined, ghost, link 변형) |
| `u-button-group` | UButtonGroup | 버튼 그룹 컨테이너 |
| `u-icon-button` | UIconButton | 아이콘 전용 버튼 |
| `u-chip` | UChip | 태그/칩 (제거 가능) |
| `u-rating` | URating | 별점 평가 |

### 폼 컨트롤 (UFormControlElement 확장)

| 태그 | 클래스 | 설명 |
|------|--------|------|
| `u-input` | UInput | 텍스트 입력 (text, password, email, number, date 등) |
| `u-textarea` | UTextarea | 멀티라인 텍스트 입력 |
| `u-select` | USelect | 드롭다운 셀렉트 |
| `u-checkbox` | UCheckbox | 체크박스 (indeterminate 지원) |
| `u-radio` | URadio | 라디오 버튼 |
| `u-switch` | USwitch | 토글 스위치 |
| `u-field` | UField | 폼 필드 래퍼 (label, description 포함) |
| `u-form` | UForm | 폼 컨테이너 (유효성 검사) |
| `u-option` | UOption | 콤보박스/셀렉트 옵션 |

### 내비게이션

| 태그 | 클래스 | 설명 |
|------|--------|------|
| `u-tab` | UTab | 탭 아이템 |
| `u-tab-panel` | UTabPanel | 탭 콘텐츠 패널 |
| `u-breadcrumb` | UBreadcrumb | 브레드크럼 컨테이너 |
| `u-breadcrumb-item` | UBreadcrumbItem | 브레드크럼 아이템 |
| `u-tree` | UTree | 트리뷰 컨테이너 |
| `u-tree-item` | UTreeItem | 트리뷰 아이템 |
| `u-menu` | UMenu | 메뉴 컨테이너 |
| `u-menu-item` | UMenuItem | 메뉴 아이템 |

### 레이아웃 & 컨테이너

| 태그 | 클래스 | 설명 |
|------|--------|------|
| `u-card` | UCard | 카드 컨테이너 |
| `u-panel` | UPanel | 접이식 패널 |
| `u-split-panel` | USplitPanel | 리사이즈 가능한 분할 패널 |
| `u-divider` | UDivider | 구분선 |
| `u-carousel` | UCarousel | 캐러셀/슬라이더 |

### 오버레이 (UOverlayElement 확장)

| 태그 | 클래스 | 설명 |
|------|--------|------|
| `u-dialog` | UDialog | 모달 다이얼로그 |
| `u-drawer` | UDrawer | 슬라이드인 드로어 패널 |

### 플로팅 (UFloatingElement 확장)

| 태그 | 클래스 | 설명 |
|------|--------|------|
| `u-tooltip` | UTooltip | 툴팁 |
| `u-popover` | UPopover | 팝오버 |

### 시각 요소

| 태그 | 클래스 | 설명 |
|------|--------|------|
| `u-icon` | UIcon | 아이콘 표시 |
| `u-avatar` | UAvatar | 아바타 |
| `u-badge` | UBadge | 배지/레이블 |
| `u-tag` | UTag | 태그 |
| `u-alert` | UAlert | 알림 메시지 |
| `u-progress-bar` | UProgressBar | 선형 프로그래스바 |
| `u-progress-ring` | UProgressRing | 원형 프로그래스 |
| `u-skeleton` | USkeleton | 로딩 플레이스홀더 |
| `u-spinner` | USpinner | 로딩 스피너 |

## 기본 사용 패턴

### HTML에서 사용

```html
<!-- 버튼 -->
<u-button variant="solid" @click=${handleClick}>확인</u-button>
<u-button variant="outlined" disabled>비활성</u-button>

<!-- 인풋 -->
<u-input label="이름" placeholder="이름을 입력하세요" required></u-input>
<u-input type="password" label="비밀번호"></u-input>
<u-input type="number" label="수량" min="0" max="100"></u-input>

<!-- 체크박스 / 스위치 -->
<u-checkbox label="동의합니다" @u-change=${handleChange}></u-checkbox>
<u-switch label="알림 켜기"></u-switch>

<!-- 셀렉트 -->
<u-select label="국가">
  <u-option value="kr">한국</u-option>
  <u-option value="us">미국</u-option>
</u-select>

<!-- 다이얼로그 -->
<u-dialog id="myDialog">
  <div slot="header">제목</div>
  <div>본문 내용</div>
  <div slot="footer">
    <u-button @click=${() => myDialog.hide()}>닫기</u-button>
  </div>
</u-dialog>

<!-- 툴팁 -->
<u-tooltip content="설명 텍스트">
  <u-button>hover me</u-button>
</u-tooltip>

<!-- 트리뷰 -->
<u-tree>
  <u-tree-item label="폴더 1">
    <u-tree-item label="파일 1.1"></u-tree-item>
    <u-tree-item label="파일 1.2"></u-tree-item>
  </u-tree-item>
</u-tree>

<!-- 탭 -->
<u-tab label="Tab 1">
  <u-tab-panel>내용 1</u-tab-panel>
</u-tab>
```

## 이벤트 시스템

모든 커스텀 이벤트는 `bubble: true`, `composed: true`로 Shadow DOM을 관통합니다.

| 이벤트 | 발생 시점 | 발생 컴포넌트 |
|--------|----------|-------------|
| `u-input` | 키 입력 시 (실시간) | u-input, u-textarea |
| `u-change` | blur/enter (값 확정) | 폼 컨트롤 |
| `u-select` | 항목 선택 | u-tree-item, u-menu-item |
| `u-show` | 표시될 때 | u-dialog, u-drawer, u-tooltip, u-popover |
| `u-hide` | 숨겨질 때 | u-dialog, u-drawer, u-tooltip, u-popover |
| `u-resize` | 크기 변경 | u-split-panel |

```typescript
// 이벤트 리스닝
import type { UInputEvent } from '@iyulab/components';

element.addEventListener('u-input', (e: UInputEvent) => {
  console.log(e.target.value);
});

// Lit 템플릿에서
html`<u-input @u-change=${this.handleChange}></u-input>`
```

## 테마 시스템

### 테마 초기화

```typescript
import { Theme } from '@iyulab/components';

Theme.init({
  default: 'system',    // 'light' | 'dark' | 'system'
  useBuiltIn: true,     // 내장 라이트/다크 스타일 사용
  store: {
    type: 'localStorage',
    prefix: 'my-app'
  }
});

// 테마 전환
Theme.set('dark');
const current = Theme.get(); // 'light' | 'dark' | 'system'
```

### CSS 변수 커스터마이징

```css
:root {
  /* 색상 팔레트 (0~1000 범위) */
  --u-blue-500: #3B82F6;
  --u-neutral-100: #F3F4F6;

  /* 텍스트 */
  --u-txt-color: #1F2937;
  --u-txt-color-weak: #6B7280;

  /* 배경 */
  --u-bg-color: #FFFFFF;
  --u-input-bg-color: #F9FAFB;

  /* 보더 */
  --u-border-color: #E5E7EB;
  --u-input-border-color-focus: var(--u-blue-500);

  /* 폰트 */
  --u-font-base: 'Pretendard', system-ui, sans-serif;
  --u-font-mono: 'JetBrains Mono', monospace;

  /* 그림자 */
  --u-shadow-color-normal: rgba(0, 0, 0, 0.1);

  /* 스크롤바 */
  --u-scrollbar-color: #CBD5E1;
}
```

### 주요 CSS 변수 카테고리

- **텍스트**: `--u-txt-color`, `--u-txt-color-inverse`, `--u-txt-color-hover`, `--u-txt-color-disabled`, `--u-txt-color-weak`, `--u-txt-color-strong`
- **아이콘**: `--u-icon-color`, `--u-icon-color-hover`, `--u-icon-color-disabled`
- **배경**: `--u-bg-color`, `--u-bg-color-hover`, `--u-bg-color-active`, `--u-bg-color-disabled`, `--u-panel-bg-color`, `--u-overlay-bg-color`
- **보더**: `--u-border-color`, `--u-input-border-color`, `--u-input-border-color-focus`, `--u-input-border-color-invalid`
- **그림자**: `--u-shadow-color-weaker` ~ `--u-shadow-color-stronger`
- **색상**: `--u-neutral-{0~1000}`, `--u-blue-{0~1000}`, `--u-green-{0~1000}`, `--u-yellow-{0~1000}`, `--u-red-{0~1000}`
- **폰트**: `--u-font-base`, `--u-font-mono`, `--u-font-serif`, `--u-font-display`, `--u-font-modern`, `--u-font-rounded`

## 아이콘 시스템

```typescript
import { Icons } from '@iyulab/components';

// 커스텀 아이콘 라이브러리 등록
Icons.define('my-icons', {
  'home': '<svg>...</svg>',
  'settings': '<svg>...</svg>',
});

// 아이콘 사용
Icons.get('my-icons', 'home'); // SVG 문자열 반환
```

```html
<u-icon lib="my-icons" name="home"></u-icon>
```

## 유틸리티

### Dialog 유틸리티

```typescript
import { Dialog } from '@iyulab/components';

// 프로그래밍 방식으로 다이얼로그 열기
await Dialog.alert('알림 메시지');
const confirmed = await Dialog.confirm('정말 삭제하시겠습니까?');
const value = await Dialog.prompt('이름을 입력하세요');
```

### Toast 유틸리티

```typescript
import { Toast } from '@iyulab/components';

Toast.success('저장되었습니다');
Toast.error('오류가 발생했습니다');
Toast.info('참고 정보');
Toast.warning('주의하세요');
```

## 폼 컨트롤 공통 속성

`UFormControlElement`를 확장하는 모든 폼 컴포넌트(u-input, u-select, u-checkbox 등)는 다음 속성을 공유합니다:

| 속성 | 타입 | 설명 |
|------|------|------|
| `disabled` | boolean | 비활성 |
| `readonly` | boolean | 읽기 전용 |
| `required` | boolean | 필수 입력 |
| `invalid` | boolean | 유효성 실패 상태 |
| `novalidate` | boolean | 유효성 검사 비활성화 |
| `label` | string | 라벨 텍스트 |
| `description` | string | 설명 텍스트 |
| `validationMessage` | string | 커스텀 유효성 메시지 |
| `name` | string | 폼 필드 이름 |
| `value` | T | 값 (제네릭) |

### 유효성 검사

```typescript
const input = document.querySelector('u-input');
const isValid = input.validate(); // true/false
input.reset(); // 초기 상태로 복원
```

## 오버레이 공통 속성

`UOverlayElement`를 확장하는 컴포넌트(u-dialog, u-drawer)의 공통 속성:

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | false | 표시 여부 |
| `contained` | boolean | false | absolute 포지셔닝 (부모 내) |
| `mode` | 'modal' \| 'non-modal' | 'modal' | 모달 모드 |
| `close-on` | string[] | ['escape','backdrop','button'] | 닫기 정책 |

```typescript
const dialog = document.querySelector('u-dialog');
dialog.show();  // 열기 (u-show 이벤트 발생)
dialog.hide();  // 닫기 (u-hide 이벤트 발생)
```

## 플로팅 공통 속성

`UFloatingElement`를 확장하는 컴포넌트(u-tooltip, u-popover)의 공통 속성:

| 속성 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `open` | boolean | false | 표시 여부 |
| `disabled` | boolean | false | 비활성 |
| `placement` | Placement | auto | 위치 (top, bottom, left, right 등) |
| `offset` | number | 0 | 앵커로부터의 거리 |
| `shift` | boolean | false | 뷰포트 내 자동 이동 |
| `arrow` | boolean | false | 화살표 표시 |
| `show-delay` | number | 0 | 표시 지연(ms) |
| `hide-delay` | number | 0 | 숨김 지연(ms) |

## TypeScript 타입

```typescript
// 주요 타입 임포트
import type {
  UButton,
  UInput,
  UDialog,
  UInputEvent,
  UChangeEvent,
  USelectEvent,
  UShowEvent,
  UHideEvent,
} from '@iyulab/components';

// 변형 타입
type ButtonVariant = "solid" | "surface" | "filled" | "outlined" | "ghost" | "link";
type InputType = 'text' | 'password' | 'email' | 'tel' | 'url' | 'search' | 'number' | 'date' | 'time' | 'datetime-local' | 'month' | 'week';
type InputVariant = 'outlined' | 'filled' | 'underlined' | 'borderless';
type DialogPlacement = 'top-start' | 'top' | 'top-end' | 'start' | 'center' | 'end' | 'bottom-start' | 'bottom' | 'bottom-end';
type OverlayMode = 'modal' | 'non-modal';
type CloseOnPolicy = 'escape' | 'backdrop' | 'button';
type MenuSelection = 'none' | 'single' | 'multiple';
```
