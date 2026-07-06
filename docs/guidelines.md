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

`UFormControlElement<T>`를 상속할 때는 `setValidity()`와 `reset()`을 반드시 구현한다. `validate()`는 기반 클래스가 공통 제공하므로 override하지 않는다.

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

  protected setValidity(): void {
    const missing = this.required && !this.value;
    this.commit(
      missing ? { valueMissing: true } : {},
      missing ? Locale.getValue('valueMissing') : '',
      this.containerEl ?? undefined, // @query로 얻은 앵커. null일 수 있으니 항상 `?? undefined`로 넘긴다.
    );
  }

  reset(): void {
    this.value = undefined;
    this.invalid = false;
  }
}
```

- `setValidity()`는 지금 상태를 검증해 `this.commit(flags, message, anchor)`를 호출한다. `flags`는 네이티브 `ValidityStateFlags`를 그대로 쓰고, `message`는 `Locale.getValue(key, params)`로 조회한다(항상 전역 활성 로케일 기준). `internals.setValidity()`를 직접 부르지 않는다 — `commit()`이 `setCustomValidity()`로 주입된 커스텀 메시지가 있는지 먼저 확인하고 있으면 그걸 최우선으로 반영한다.
- `UFormControlElement.validationMessage`는 **읽기 전용 getter**로, `internals.validationMessage`(즉 `setValidity()`가 마지막으로 넘긴 문자열)를 그대로 반환한다. 별도로 저장하는 상태가 없다 — `render()`에서 `<u-field .validationMessage=${this.validationMessage}>`처럼 바로 바인딩하면 된다.
  - 이 getter는 Lit 리액티브 속성이 아니므로, `internals.validationMessage`만 바뀌고 `invalid`가 `true→true`로 그대로면(예: `invalid`는 유지된 채 로케일만 바뀌어 문구가 달라지는 경우) 재렌더가 안 일어나 화면이 갱신되지 않는다. 그래서 기반 클래스의 `updated()`/`validate()`는 `setValidity()` 직후 `this.requestUpdate()`를 호출해 강제로 재렌더한다 — 새 필드를 추가하는 대신 이미 있는 Lit API로 리액티브 갭을 메운 것.
- **anchor 인자는 항상 `?? undefined`로 넘긴다.** Lit `@query`의 TS 타입은 `T | undefined`라고 선언돼 있지만 실제로 못 찾으면 `null`을 반환한다. `internals.setValidity(flags, message, null)`은 `HTMLElement`가 아니라며 런타임에 `TypeError`를 던진다 — 컴파일은 통과하니 놓치기 쉽다.
- `value`가 바뀌면 기반 클래스의 `updated()`가 자동으로 `setValidity()`를 호출한다 — 컴포넌트가 change/blur 핸들러에서 직접 호출할 필요는 없다.
- `checked`처럼 `value` 외의 속성으로 상태를 표현하는 컴포넌트는 `protected shouldValidate(changed)`를 override한다: `return super.shouldValidate(changed) || changed.has('checked');`
- `novalidate`가 `false`일 때 값이 변경되면 자동으로 `validate()`가 호출되어 `invalid`를 갱신한다. `validate()`는 내부적으로 `setValidity()`를 먼저 호출해 최신 상태를 반영한 뒤 `internals.checkValidity()`로 판정한다.
- `validate(report = true)`: `report`가 `false`면 반환값(유효 여부)만 조용히 확인하고 `invalid`/화면 표시는 건드리지 않는다 — 네이티브 `checkValidity()`(조용히 확인) vs `reportValidity()`(UI 갱신)와 같은 관계. 예: 제출 버튼 활성화 여부를 매 입력마다 확인하되, 에러 표시는 실제 제출 시도 시에만 하고 싶을 때 `field.validate(false)`로 미리 확인한다.

### 커스텀 메시지 주입 — `setCustomValidity()`

네이티브 `HTMLInputElement.setCustomValidity()`와 동일한 계약이다.

```ts
const input = document.querySelector('u-input')!;
input.setCustomValidity('이미 사용 중인 아이디입니다.');
input.validate(); // 이 시점에 비로소 invalid=true + 화면에 메시지가 표시된다
```

- `setCustomValidity(message)`는 **상태(`internals`)만 갱신**하고 화면에는 아무 영향을 주지 않는다. 빈 문자열이 아니면 저장해두고, 다음 `setValidity()` 호출(자동이든 `validate()`를 통해서든) 때부터 `commit()`이 이 메시지를 다른 모든 검증 결과보다 우선해 반영한다.
- `invalid`를 화면에 반영하는 건 언제나 `validate()`의 몫이다 — `setCustomValidity()`를 부르는 것만으로는 아무것도 안 보인다. 스스로 화면에 드러내고 싶으면 이어서 `validate()`를 호출한다.
- 빈 문자열(`''`)을 넘기면 커스텀 메시지가 해제되어 원래 자동 계산된 메시지(네이티브 제약 또는 `Locale`)로 돌아간다.

### 검증 메시지 로케일

검증 메시지는 하드코딩하지 않고 **`Locale`** 유틸리티(`src/utilities/Locale.ts`)를 경유한다.

- `en`/`ko`/`ja`/`zh-CN`/`zh-TW`/`es`/`fr`/`de`/`pt-BR`/`vi`/`th`/`id`/`ru`/`ar` 14개 로케일은 `src/assets/locales/*.json`으로 빌드 시점에 내장된다. 새 메시지 키는 `LocaleMessageKey`에 추가하고 모든 JSON 파일에 반영한다.
- 활성 로케일은 초기에 `navigator.language`/`document.lang`으로 자동 추측되고(브라우저 환경), 실패 시 영어로 폴백한다. `Locale.set()`으로 언제든 명시적으로 바꿀 수 있다.
- 메시지 조회 순서: `Locale.getValue()`가 찾는 값(활성 로케일 → base 언어 → 영어).
- 그 외 언어나 문구 오버라이드는 `Locale.register()`로 등록한다. 이미 있는 값(내장 포함) 위에 병합되므로 일부 키만 넘겨도 나머지 키는 그대로 유지된다.

```ts
import { Locale } from '@iyulab/components';

Locale.register('de', { valueMissing: 'Pflichtfeld' }); // 미내장 언어 등록 (부분 등록 가능)
Locale.set('ko');                                        // 앱 전역 활성 로케일 지정
```

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
- 여백(margin)·테두리(border)·색상(color)·글자 크기(font-size)·배경(background)등을 `:host`에 위치시켜 소비앱이 `u-button { padding: 8px; color: red; }`처럼 커스텀 엘리먼트 태그를 직접 셀렉터로 잡아 손쉽게 커스터마이징할 수 있게 의도 한다.
- 슬롯 이름은 `prefix` / `suffix` / `footer` 등 역할 기반으로 통일한다.
- CSS part 이름은 내부 구조를 반영하되 구현 세부사항을 노출하지 않는다.
- 다른 컴포넌트를 내부에서 사용할 때는 파일 상단에 사이드이펙트 import를 추가한다.
```ts
import '../spinner/USpinner.js';
```
