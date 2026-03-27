---
name: iyulab-components-extend
description: >
  @iyulab/components 라이브러리를 확장하여 새로운 커스텀 컴포넌트를 만드는 가이드.
  UElement, UFormControlElement, UFloatingElement, UOverlayElement, UDataElement 등 기반 클래스를
  활용한 컴포넌트 개발 패턴, 파일 구조, 스타일링, 이벤트, 의존성 선언 방법을 안내합니다.
  Use when the user wants to create new components extending @iyulab/components,
  or needs to understand component architecture, base classes, and development patterns.
license: MIT
compatibility: Requires npm, TypeScript, Vite, and Lit
metadata:
  author: iyulab
  version: "0.4.0"
---

# @iyulab/components 확장 가이드

## 컴포넌트 개발 환경

```bash
npm install @iyulab/components lit
npm install -D typescript vite vite-plugin-dts eslint-plugin-lit
```

**tsconfig.json 필수 설정:**
```json
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "experimentalDecorators": true,
    "useDefineForClassFields": false
  }
}
```

## 클래스 상속 계층

```
LitElement (from lit)
└── UElement — 모든 컴포넌트의 기반
    ├── UFormControlElement — 폼 입력 컴포넌트 (name, value, validate, reset)
    ├── UDataElement — JSON 데이터 로딩 컴포넌트 (<script type="application/json">)
    ├── UFloatingElement — 플로팅 UI (@floating-ui/dom 통합)
    └── UOverlayElement — 오버레이/모달 (focus-trap, 스크롤 잠금)
```

**어떤 기반 클래스를 선택할지:**

| 만들려는 컴포넌트 | 기반 클래스 | 예시 |
|------------------|-----------|------|
| 일반 UI 컴포넌트 | `UElement` | 카드, 배지, 버튼 |
| 사용자 입력/폼 연동 | `UFormControlElement` | 날짜 피커, 컬러 피커, 태그 입력 |
| 외부 JSON 데이터 표시 | `UDataElement` | 차트, 데이터 테이블 |
| 앵커에 붙는 떠다니는 UI | `UFloatingElement` | 드롭다운, 컨텍스트 메뉴, 컬러 피커 팝업 |
| 전체 화면 오버레이 | `UOverlayElement` | 커스텀 모달, 사이드시트 |

## 파일 구조 컨벤션

각 컴포넌트는 반드시 3개의 파일로 구성합니다:

```
src/components/u-my-component/
├── UMyComponent.component.ts   # 컴포넌트 로직 (클래스 정의)
├── UMyComponent.styles.ts      # 스타일 (css 템플릿)
└── UMyComponent.ts             # 진입점 (define 호출 + 타입 선언 + re-export)
```

## 기본 컴포넌트 만들기 (UElement 확장)

### 1. 스타일 파일: `UMyComponent.styles.ts`

```typescript
import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    padding: 1rem;
    border: 1px solid var(--u-border-color, #e5e7eb);
    border-radius: 0.5rem;
    background: var(--u-bg-color, #fff);
  }

  :host([variant="primary"]) {
    border-color: var(--u-blue-500);
    background: var(--u-blue-50);
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  .header {
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: var(--u-txt-color-strong);
  }

  .content {
    color: var(--u-txt-color);
  }
`;
```

### 2. 컴포넌트 파일: `UMyComponent.component.ts`

```typescript
import { html, type CSSResultGroup, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { UElement } from "@iyulab/components";
import { UIcon } from "@iyulab/components";
import { UButton } from "@iyulab/components";
import { styles } from "./UMyComponent.styles.js";

export class UMyComponent extends UElement {

  // 1) 스타일: 부모 스타일 + 로컬 스타일
  static styles: CSSResultGroup = [super.styles, styles];

  // 2) 의존성: 이 컴포넌트가 사용하는 자식 컴포넌트 선언
  //    → 생성자에서 자동으로 customElements.define() 호출됨
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
    'u-button': UButton,
  };

  // 3) 속성: @property()로 외부에서 설정 가능한 속성 선언
  //    reflect: true → HTML 속성에 반영 (CSS 셀렉터 사용 가능)
  @property({ type: String, reflect: true })
  variant: 'default' | 'primary' | 'warning' = 'default';

  @property({ type: String })
  header?: string;

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  // 4) 렌더링
  protected render(): TemplateResult {
    return html`
      ${this.header ? html`
        <div class="header">
          <u-icon name="info"></u-icon>
          ${this.header}
        </div>
      ` : ''}
      <div class="content">
        <slot></slot>
      </div>
      <div class="actions">
        <slot name="actions"></slot>
      </div>
    `;
  }

  // 5) 이벤트 발생: this.emit()
  private handleAction() {
    // emit(이벤트명, detail값, 옵션)
    // 기본: bubbles: true, composed: true, cancelable: true
    const notPrevented = this.emit('u-action', { variant: this.variant });
    if (notPrevented) {
      // 이벤트가 preventDefault()되지 않았을 때의 로직
    }
  }
}
```

### 3. 진입점 파일: `UMyComponent.ts`

```typescript
import { UMyComponent } from "./UMyComponent.component.js";

// 커스텀 엘리먼트 등록
UMyComponent.define("u-my-component");

// TypeScript 타입 선언 (IDE 자동완성 지원)
declare global {
  interface HTMLElementTagNameMap {
    "u-my-component": UMyComponent;
  }
}

// re-export
export * from "./UMyComponent.component.js";
```

## 폼 컨트롤 만들기 (UFormControlElement 확장)

폼과 연동되는 입력 컴포넌트를 만들 때 사용합니다.

```typescript
import { html, type CSSResultGroup, type TemplateResult } from "lit";
import { property, query } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { UFormControlElement } from "@iyulab/components";
import { styles } from "./UColorPicker.styles.js";

export class UColorPicker extends UFormControlElement<string> {

  static styles: CSSResultGroup = [super.styles, styles];

  // formAssociated를 위해 필요
  static formAssociated = true;

  @property({ type: String })
  value: string = '#000000';

  @property({ type: Array })
  presets: string[] = [];

  @query('input[type="color"]')
  private colorInput!: HTMLInputElement;

  // [필수] 유효성 검사 구현
  validate(): boolean {
    if (this.required && !this.value) {
      this.invalid = true;
      this.validationMessage = '색상을 선택해주세요';
      return false;
    }
    // 추가 검증 로직...
    this.invalid = false;
    this.validationMessage = undefined;
    return true;
  }

  // [필수] 초기화 구현
  reset(): void {
    this.value = '#000000';
    this.invalid = false;
    this.validationMessage = undefined;
  }

  protected render(): TemplateResult {
    return html`
      <input
        type="color"
        .value=${live(this.value)}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @input=${this.handleInput}
        @change=${this.handleChange}
      />
      ${this.presets.length ? html`
        <div class="presets">
          ${this.presets.map(color => html`
            <button
              class="preset"
              style="background:${color}"
              @click=${() => this.selectColor(color)}
            ></button>
          `)}
        </div>
      ` : ''}
    `;
  }

  private handleInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.value = input.value;
    this.emit('u-input', this.value);  // 실시간 이벤트
  }

  private handleChange() {
    this.emit('u-change', this.value);  // 확정 이벤트
    this.validate();
  }

  private selectColor(color: string) {
    this.value = color;
    this.emit('u-change', this.value);
  }
}
```

**상속받는 공통 속성:**
- `disabled`, `readonly`, `required`, `invalid`, `novalidate`
- `label`, `description`, `validationMessage`
- `name`, `value`
- `form` (getter → 연결된 HTMLFormElement)
- `validity` (getter → ValidityState)

## 데이터 컴포넌트 만들기 (UDataElement 확장)

JSON 데이터를 Light DOM의 `<script>` 태그에서 로드하는 패턴입니다.

```typescript
import { html, type CSSResultGroup, type TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";
import { UDataElement } from "@iyulab/components";
import { styles } from "./UDataChart.styles.js";

interface ChartData {
  labels: string[];
  values: number[];
  type: 'bar' | 'line' | 'pie';
}

export class UDataChart extends UDataElement {

  static styles: CSSResultGroup = [super.styles, styles];

  @property({ type: String })
  type: 'bar' | 'line' | 'pie' = 'bar';

  @state()
  private labels: string[] = [];

  @state()
  private values: number[] = [];

  // load()가 호출되면 JSON 키가 자동으로 프로퍼티에 매핑됨
  // 추가 처리가 필요하면 오버라이드:
  protected async load(data?: ChartData): Promise<void> {
    await super.load(data);
    // data의 키가 자동으로 this에 할당된 후 추가 로직
    this.requestUpdate();
  }

  protected render(): TemplateResult {
    return html`<canvas id="chart"></canvas>`;
  }
}
```

**HTML에서 사용:**
```html
<u-data-chart type="bar">
  <script type="application/json">
    {
      "labels": ["1월", "2월", "3월"],
      "values": [100, 200, 150]
    }
  </script>
</u-data-chart>
```

**정적 HTML 생성:**
```typescript
const html = UDataChart.buildHTML(
  { labels: ['A', 'B'], values: [10, 20] },
  { type: 'bar' }
);
// → <u-data-chart type="bar"><script type="application/json">...</script></u-data-chart>
```

## 플로팅 컴포넌트 만들기 (UFloatingElement 확장)

앵커 엘리먼트에 붙는 떠다니는 UI를 만들 때 사용합니다.

```typescript
import { html, type CSSResultGroup, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { UFloatingElement } from "@iyulab/components";
import { styles } from "./UContextMenu.styles.js";

export class UContextMenu extends UFloatingElement {

  static styles: CSSResultGroup = [super.styles, styles];

  @property({ type: Array })
  items: { label: string; value: string; icon?: string }[] = [];

  // 커스텀 트리거: 우클릭으로 가상 앵커에 표시
  handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    const virtualTarget = this.createVirtualTarget(e);
    this.show(virtualTarget);
  };

  protected render(): TemplateResult {
    return html`
      <div class="menu-list" role="menu">
        ${this.items.map(item => html`
          <div class="menu-item" role="menuitem"
            @click=${() => this.selectItem(item)}>
            ${item.icon ? html`<u-icon name=${item.icon}></u-icon>` : ''}
            ${item.label}
          </div>
        `)}
      </div>
    `;
  }

  private selectItem(item: { label: string; value: string }) {
    this.emit('u-select', item);
    this.hide();
  }
}
```

**상속받는 기능:**
- `show(target)` / `hide()` 메서드
- `placement`, `offset`, `shift`, `arrow` 속성
- `@floating-ui/dom` 자동 포지셔닝
- `createVirtualTarget(event)` 마우스 좌표 기반 가상 앵커

## 오버레이 컴포넌트 만들기 (UOverlayElement 확장)

```typescript
import { html, type CSSResultGroup, type TemplateResult } from "lit";
import { property } from "lit/decorators.js";
import { UOverlayElement } from "@iyulab/components";
import { styles } from "./USideSheet.styles.js";

export class USideSheet extends UOverlayElement {

  static styles: CSSResultGroup = [super.styles, styles];

  @property({ type: String, reflect: true })
  side: 'left' | 'right' = 'right';

  @property({ type: String })
  width: string = '400px';

  protected render(): TemplateResult {
    return html`
      <div class="backdrop" @click=${() => this.requestClose('backdrop')}></div>
      <div class="sheet" style="width:${this.width}">
        <div class="sheet-header">
          <slot name="header"></slot>
          <u-icon-button
            name="close"
            @click=${() => this.requestClose('button')}
          ></u-icon-button>
        </div>
        <div class="sheet-body">
          <slot></slot>
        </div>
      </div>
    `;
  }
}
```

**상속받는 기능:**
- `show()` / `hide()` 메서드
- `open`, `contained`, `mode` 속성
- `close-on` 정책 (escape, backdrop, button)
- `requestClose(source)` 정책 검사 후 닫기
- focus-trap 자동 관리
- body 스크롤 잠금
- 오버레이 z-index 스택 관리

## 핵심 패턴 요약

### 속성 반영 (Attribute Reflection)

```typescript
// reflect: true → CSS에서 :host([속성]) 셀렉터 사용 가능
@property({ type: Boolean, reflect: true }) disabled = false;
@property({ type: String, reflect: true }) variant = 'default';
```

### 슬롯 변경 감지

```html
<slot @slotchange=${this.handleSlotChange}></slot>
```
```typescript
private handleSlotChange(e: Event) {
  const slot = e.target as HTMLSlotElement;
  const hasContent = slot.assignedNodes().length > 0;
  this.toggleAttribute('has-content', hasContent);
}
```

### 양방향 바인딩 (live 디렉티브)

```typescript
import { live } from 'lit/directives/live.js';
html`<input .value=${live(this.value)} />`
```

### 조건부 속성 (ifDefined)

```typescript
import { ifDefined } from 'lit/directives/if-defined.js';
html`<a href=${ifDefined(this.href)}></a>`
```

### 라이프사이클

```typescript
connectedCallback() {
  super.connectedCallback();
  // DOM에 연결됨 → 이벤트 리스너 등록
}

willUpdate(changed: PropertyValues) {
  // 렌더링 전 → 속성 기반 계산
}

render(): TemplateResult {
  // 템플릿 반환
}

updated(changed: PropertyValues) {
  // 렌더링 후 → DOM 조작
  if (changed.has('open')) {
    this.style.setProperty('--height', `${this.offsetHeight}px`);
  }
}

disconnectedCallback() {
  super.disconnectedCallback();
  // DOM에서 분리됨 → 클린업
}
```

### 네이밍 컨벤션

| 대상 | 규칙 | 예시 |
|------|------|------|
| 클래스명 | PascalCase, `U` 접두사 | `UColorPicker` |
| 태그명 | kebab-case, `u-` 접두사 | `u-color-picker` |
| 디렉토리명 | 태그명과 동일 | `u-color-picker/` |
| 파일명 | 클래스명 기반 | `UColorPicker.component.ts` |
| CSS 변수 | `--u-` 접두사 | `--u-picker-size` |
| 이벤트명 | `u-` 접두사 | `u-change`, `u-select` |
| 미사용 변수 | `_` 접두사 | `_unused` |

### 컴포넌트를 패키지 index에 등록

```typescript
// src/index.ts에 추가
export * from "./components/u-my-component/UMyComponent.js";
```

## 주의사항

- ESM only (`"type": "module"`)
- 임포트 경로에 `.js` 확장자 필수 (TypeScript에서도)
- `useDefineForClassFields: false` 필수 (Lit 데코레이터 호환성)
- Shadow DOM 내에서는 외부 CSS가 적용되지 않음 → CSS 변수(`--u-*`) 사용
- `static styles`에서 반드시 `super.styles`를 포함하여 기반 클래스 스타일 상속
- `static dependencies`에 선언된 컴포넌트는 자동 등록되므로 별도 import 필요 없음
