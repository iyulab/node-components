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

**컴포넌트 29개 · 이벤트 45개**

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
| `onCopy` | `copy` | `unknown` | 클립보드에 실제로 쓰기 전에 발생하는 네이티브 ClipboardEvent. `preventDefault()`로 복사를 취소하거나, `clipboardData.setData('text/plain', ...)`로 복사될 값을 바꿀 수 있음 |

## `<u-date-picker>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | fires when the user clicks a date cell, confirms via keyboard, changes the time input (datetime mode, once a date is set), or clicks the clear button — with `confirm`, calendar picks fire it only when Apply commits a different value. Programmatic value assignment does not fire it (same contract as native form controls). |

## `<u-date-range-picker>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | fires when the user completes a range or clears it (with `confirm`, when Apply commits a different value). Programmatic value assignment does not fire it (same contract as native form controls). |

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

## `<u-file-input>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 선택된 파일이 바뀔 때 발생(선택·지우기 공통) |

## `<u-form>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 폼 컨트롤 값 변경 시 발생 |

## `<u-input>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onInput` | `input` | `unknown` | 입력값이 변경될 때 발생 |
| `onChange` | `change` | `unknown` | 값이 확정됐을 때 발생 — Enter 또는 blur 에서, 값이 바뀐 경우에만(네이티브 입력과 같다) |
| `onSearch` | `search` | `{ query: string }` | `type="search"` 에서 검색을 확정할 때(Enter · 지우기 버튼 · 값이 있는 Escape) — `detail.query` 는 앞뒤 공백을 걷은 값 |

## `<u-menu>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 선택된 아이템이 변경될 때 발생 |

## `<u-menu-item>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onPick` | `pick` | `PickEventDetail` | 아이템 선택 시 발생 (하위 메뉴가 없는 경우) |

## `<u-pagination>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onPageChange` | `page-change` | `PageChangeDetail` | `{ page, pageSize }` — 쪽을 옮기거나 페이지 크기를 바꿨다(크기를 바꾸면 첫 장). 취소하면 그대로다. |

## `<u-popover>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShow` | `show` | `ShowEventDetail` | 팝오버가 표시되기 직전 발생 (취소 가능) |
| `onHide` | `hide` | `HideEventDetail` | 팝오버가 닫히기 직전 발생 (취소 가능) |

## `<u-radio>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용(옵션 클릭·키보드)으로 선택 값이 변경될 때 발생. 네이티브 라디오와 동일하게 프로그램적 value 세팅·옵션 등록으로는 발화하지 않는다. |

## `<u-rating>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용(심볼 클릭·키보드)으로 레이팅 값이 변경될 때 발생. 프로그램적 value 세팅으로는 발화하지 않는다. |

## `<u-select>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용(옵션 클릭·칩 제거·지우기)으로 선택 값이 변경될 때 발생. 네이티브 select와 동일하게 프로그램적 value 세팅·옵션 등록으로는 발화하지 않는다. |
| `onSearch` | `search` | `{ query: string }` | `searchable`일 때 검색 입력이 바뀔 때마다 발생(`detail: { query: string }`). 로컬 필터링(이미 렌더된 `u-option`의 `hidden` 토글)과 별개로 발행되므로, 서버/원격 검색이 필요한 소비자는 이 이벤트를 구독해 자체적으로 옵션을 갱신할 수 있다. |

## `<u-slider>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onChange` | `change` | `unknown` | 사용자 상호작용으로 값이 확정됐을 때 발생 — 드래그는 완료(pointerup) 시, 키보드는 조작마다. 프로그램적 value 세팅으로는 발화하지 않는다. |

## `<u-split-panel>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShiftStart` | `shift-start` | `ShiftEventDetail` | 구분선 이동 시작 시 발생 |
| `onShift` | `shift` | `ShiftEventDetail` | 구분선 이동 중 발생 |
| `onShiftEnd` | `shift-end` | `ShiftEventDetail` | 구분선 이동 완료 시 발생 (포인터·키보드 공통) |

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
| `onChange` | `change` | `unknown` | 탭을 클릭하거나 키보드로 선택했을 때만 발생한다. 최초 마운트 시 첫 탭이 자동 선택되는 경우나 `value` 프로퍼티를 직접 대입하는 경우는 사용자 조작이 아니므로 발생시키지 않는다(네이티브 select가 프로그래밍적 대입에는 change를 내지 않는 것과 동일한 관례). |

## `<u-textarea>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onInput` | `input` | `unknown` | 입력값이 변경될 때 발생 |
| `onChange` | `change` | `unknown` | 값이 확정됐을 때 발생 |

## `<u-tooltip>`

| React prop | 이벤트 | detail | 설명 |
|---|---|---|---|
| `onShow` | `show` | `ShowEventDetail` | 툴팁을 표시하기 직전 발생 (취소 가능) |
| `onHide` | `hide` | `HideEventDetail` | 툴팁을 숨기기 직전 발생 (취소 가능) |

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
