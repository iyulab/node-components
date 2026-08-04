# React Events

> 자동 생성 문서 — 직접 편집하지 마세요. 컴포넌트 JSDoc 의 `@event` 와 `this.fire()` 가 원본입니다.
> 갱신: `npm run docs:react-events`

`@iyulab/components/react` 래퍼가 노출하는 이벤트 prop 목록입니다.

```tsx
import { UDialog } from '@iyulab/components/react';

<UDialog onShow={e => console.log(e.detail)} onHide={() => …} />
```

## 네이티브 이벤트는 매핑이 필요 없다

`onClick`·`onFocus`·`onKeyDown` 같은 **표준 DOM 이벤트는 아래 표에 없어도 그대로 동작한다.**
래퍼가 알지 못하는 prop 은 React 로 그대로 전달되고, React 합성 이벤트가 처리한다.
수동으로 `ref` + `addEventListener` 를 붙일 필요가 없다.

아래 표는 **커스텀 이벤트**(래퍼가 명시적으로 매핑하는 것)만 담는다.

`detail` 열이 `unknown` 이면 `CustomEvent`(detail 타입 미지정)로 노출된다.

**컴포넌트 25개 · 이벤트 39개**

## `<u-alert>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShow` | `show` | `ShowEventDetail` | Alert가 표시되기 직전 발생 (취소 가능) |
| `onHide` | `hide` | `HideEventDetail` | Alert가 닫히기 직전 발생 (취소 가능) |

## `<u-breadcrumb-item>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onNavigate` | `navigate` | `NavigateEventDetail` | 링크 클릭 시 발생 (취소 가능) |

## `<u-checkbox>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 체크 상태 변경 시 발생 |

## `<u-chip>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onPick` | `pick` | `PickEventDetail` | 선택 시 발생 |
| `onRemove` | `remove` | `RemoveEventDetail` | 삭제 버튼 클릭 시 발생 |

## `<u-copy-button>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onCopy` | `copy` | `unknown` | 클립보드에 실제로 쓰기 전에 발생하는 네이티브 ClipboardEvent. |

## `<u-dialog>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShow` | `show` | `ShowEventDetail` | 오버레이가 표시되기 직전 발생합니다. 핸들러에서 취소하면 표시되지 않습니다. |
| `onHide` | `hide` | `HideEventDetail` | 오버레이가 숨겨지기 직전 발생합니다. 핸들러에서 취소하면 닫히지 않습니다. |

## `<u-drawer>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShow` | `show` | `ShowEventDetail` | 오버레이가 표시되기 직전 발생합니다. 핸들러에서 취소하면 표시되지 않습니다. |
| `onHide` | `hide` | `HideEventDetail` | 오버레이가 숨겨지기 직전 발생합니다. 핸들러에서 취소하면 닫히지 않습니다. |

## `<u-expander>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onExpand` | `expand` | `ExpandEventDetail` | 펼쳐질 때 발생 (취소 가능) |
| `onCollapse` | `collapse` | `CollapseEventDetail` | 접힐 때 발생 (취소 가능) |

## `<u-form>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 폼 컨트롤 값 변경 시 발생 |

## `<u-input>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onInput` | `input` | `unknown` | 입력값이 변경될 때 발생 |
| `onChange` | `change` | `unknown` | 값이 확정됐을 때 발생 |

## `<u-menu>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 선택된 아이템이 변경될 때 발생 |

## `<u-menu-item>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onPick` | `pick` | `PickEventDetail` | 아이템 선택 시 발생 (하위 메뉴가 없는 경우) |

## `<u-popover>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShow` | `show` | `ShowEventDetail` | 엘리먼트가 표시되기 전에 발생합니다. 이벤트 핸들러에서 false를 반환하면 표시가 취소됩니다. |
| `onHide` | `hide` | `HideEventDetail` | 엘리먼트가 숨겨지기 전에 발생합니다. 이벤트 핸들러에서 false를 반환하면 숨김이 취소됩니다. |

## `<u-radio>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용(옵션 클릭·키보드)으로 선택 값이 변경될 때 발생. |

## `<u-rating>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용(심볼 클릭·키보드)으로 레이팅 값이 변경될 때 발생. |

## `<u-select>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용(옵션 클릭·칩 제거·지우기)으로 선택 값이 변경될 때 발생. |

## `<u-slider>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용으로 값이 확정됐을 때 발생 — 드래그는 완료(pointerup) 시, |

## `<u-split-panel>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShiftStart` | `shift-start` | `ShiftEventDetail` | 구분선 이동 시작 시 발생 |
| `onShift` | `shift` | `ShiftEventDetail` | 구분선 이동 중 발생 |
| `onShiftEnd` | `shift-end` | `ShiftEventDetail` | 구분선 이동 완료 시 발생 |

## `<u-switch>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 스위치 상태 변경 시 발생 |

## `<u-tab>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onRemove` | `remove` | `RemoveEventDetail` | 탭이 닫힐 때 발생. 이벤트 리스너에서 preventDefault()를 호출하면 탭이 닫히지 않습니다. |

## `<u-tab-panel>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 탭을 클릭하거나 키보드로 선택했을 때만 발생한다. 최초 마운트 시 첫 탭이 |

## `<u-textarea>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onInput` | `input` | `unknown` | 입력값이 변경될 때 발생 |
| `onChange` | `change` | `unknown` | 값이 확정됐을 때 발생 |

## `<u-tooltip>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShow` | `show` | `ShowEventDetail` | 엘리먼트가 표시되기 전에 발생합니다. 이벤트 핸들러에서 false를 반환하면 표시가 취소됩니다. |
| `onHide` | `hide` | `HideEventDetail` | 엘리먼트가 숨겨지기 전에 발생합니다. 이벤트 핸들러에서 false를 반환하면 숨김이 취소됩니다. |

## `<u-tree>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 선택된 아이템이 변경될 때 발생 |

## `<u-tree-item>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onExpand` | `expand` | `ExpandEventDetail` | 노드 펼침 시 발생 |
| `onCollapse` | `collapse` | `CollapseEventDetail` | 노드 접힐 시 발생 |
| `onPick` | `pick` | `PickEventDetail` | 선택 시 발생 |
| `onCheck` | `check` | `CheckEventDetail` | 체크 시 발생 |
