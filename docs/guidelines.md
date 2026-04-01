# 컴포넌트 개발 가이드라인

`@iyulab/components` 패키지에 컴포넌트를 추가하거나 수정할 때 따라야 하는 규칙과 패턴입니다.

---

## 파일 구조

```
src/components/<name>/
├── U<Name>.ts          # 컴포넌트 클래스
└── U<Name>.styles.ts   # 스타일 전용
```

- 디렉터리 이름: `kebab-case` (예: `button-group`, `tree-item`)
- 파일 이름: `PascalCase` + `U` 접두사 (예: `UButtonGroup.ts`)
- 스타일 파일은 CSS 리터럴만 포함하고 로직을 넣지 않는다.
- `index.ts`는 사용하지 않는다. `src/index.ts`에서 직접 export.

---

## 기반 클래스 선택

| 상황 | 상속 클래스 |
|------|------------|
| 일반 UI 요소 | `UElement` |
| 사용자 입력 / 폼 필드 | `UFormControlElement<T>` |
| 앵커 기반 플로팅 패널 | `UFloatingElement` |
| 모달 오버레이 | `UOverlayElement` |
| JSON 데이터 기반 | `UDataElement` |

스타일 상속은 반드시 `static styles = [super.styles, styles]` 형태로 작성한다.

---

## 컴포넌트 클래스 규칙

### JSDoc

클래스 JSDoc은 한국어로 작성하며, 다음 태그를 명시한다.

```ts
/**
 * 컴포넌트 한 줄 설명.
 *
 * @slot - 기본 슬롯
 * @slot prefix - 앞쪽 슬롯
 *
 * @csspart container - 외부 래퍼
 *
 * @cssprop --my-widget-color - 텍스트 색상
 *
 * @event pick - 항목이 선택됐을 때 발생
 * @event change - 값이 확정됐을 때 발생
 */
```

### 프로퍼티

```ts
/** 버튼 스타일 변형 */
@property({ type: String, reflect: true }) variant: ButtonVariant = 'solid';
/** 비활성 상태 */
@property({ type: Boolean, reflect: true }) disabled = false;
/** 링크 URL */
@property({ type: String }) href?: string;
```

- 각 프로퍼티 위에 한 줄 JSDoc 주석 작성.
- `variant`, `disabled`, `open`, `loading` 등 HTML 속성으로 관찰 가능해야 하는 값에는 `reflect: true` 사용.
- 내부 상태만 반영하는 서술형 값(`href`, `label` 등)에는 `reflect` 생략.
- 타입 유니언은 파일 상단에 `export type`으로 분리해 선언.

### 파일 하단 선언

파일 끝에 반드시 `HTMLElementTagNameMap` 선언을 추가한다.

```ts
declare global {
  interface HTMLElementTagNameMap {
    'u-my-widget': UMyWidget;
  }
}
```

### Import 경로

내부 모듈 import 시 `.js` 확장자를 명시한다.

```ts
import { UElement } from '../UElement.js';
import { styles } from './UMyWidget.styles.js';
```

---

## 이벤트

### 기존 이벤트 재사용

`src/events/`에 정의된 이벤트를 우선 사용한다.

| 이벤트 | 상황 |
|--------|------|
| `show` / `hide` | 표시/숨김 전환 |
| `pick` | 항목 선택 (선택 상태 포함) |
| `change` | 값 확정 (blur, enter) |
| `input` | 실시간 입력값 변경 |
| `navigate` | 라우팅 이동 |
| `remove` | 항목 삭제 |
| `check` | 체크 상태 변경 |
| `expand` / `collapse` | 트리/아코디언 열기/닫기 |
| `shift` | 드래그/정렬 이동 |

### 커스텀 이벤트 추가

기존 이벤트 타입으로 표현하기 어려울 때만 `src/events/`에 새 파일을 추가한다.

```ts
// src/events/MyEvent.ts
export interface MyEventDetail {
  value: string;
}

export type MyEvent = CustomEvent<MyEventDetail>;

declare global {
  interface GlobalEventHandlersEventMap {
    'my-event': MyEvent;
  }
}
```

### 이벤트 발행

커스텀 이벤트는 `fire()` 메서드를 사용한다.  
네이티브 이벤트 전달은 `relay()`를 사용한다.

```ts
// 커스텀 이벤트
this.fire<ShowEventDetail>('show');

// detail 포함
this.fire<PickEventDetail>('pick', {
  detail: { value: this.value, selected: true, shiftKey: false, metaKey: false, ctrlKey: false }
});

// 네이티브 이벤트 전달
this.relay(event);
```

`dispatchEvent(new CustomEvent(...))` 를 직접 호출하지 않는다.

---

## 폼 컨트롤 구현

`UFormControlElement<T>`를 상속할 때는 `validate()`와 `reset()`을 반드시 구현한다.

```ts
@customElement('u-my-input')
export class UMyInput extends UFormControlElement<string> {
  static styles = [super.styles, styles];

  render() {
    return html`
      <input
        .value=${this.value ?? ''}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @input=${(e: Event) => {
          this.value = (e.target as HTMLInputElement).value;
          this.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
        }}
        @change=${(e: Event) => {
          this.value = (e.target as HTMLInputElement).value;
          this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
        }}
      />
    `;
  }

  validate(): boolean {
    if (this.required && !this.value) {
      this.invalid = true;
      this.internals?.setValidity({ valueMissing: true }, '필수 항목입니다.');
      return false;
    }
    this.invalid = false;
    this.internals?.setValidity({});
    return true;
  }

  reset(): void {
    this.value = undefined;
    this.invalid = false;
  }
}
```

- `novalidate`가 `false`일 때 값이 변경되면 자동으로 `validate()`가 호출된다.
- `internals.setValidity()`로 네이티브 폼 유효성 상태를 갱신한다.

---

## index.ts 등록

`src/index.ts`에 컴포넌트와 이벤트를 추가한다.

```ts
// Components 섹션 (알파벳 순서 유지)
export * from './components/my-widget/UMyWidget.js';

// Events 섹션 (신규 이벤트 추가 시)
export * from './events/MyEvent';
```

---

## 문서화

컴포넌트 추가 후 다음 파일을 함께 업데이트한다.

1. `skills/iyulab-components/references/components/my-widget.md` — 컴포넌트 레퍼런스 파일 추가
2. `skills/iyulab-components/SKILL.md` — 컴포넌트 목록에 항목 추가

---

## 핵심 원칙

- Shadow DOM을 유지한다. `createRenderRoot()`로 Shadow DOM을 우회하지 않는다.
- 슬롯 이름은 `prefix` / `suffix` / `footer` 등 역할 기반으로 통일한다.
- CSS part 이름은 내부 구조를 반영하되 구현 세부사항을 노출하지 않는다.
- 다른 컴포넌트를 내부에서 사용할 때는 파일 상단에 사이드이펙트 import를 추가한다.

  ```ts
  import '../spinner/USpinner.js';
  ```
