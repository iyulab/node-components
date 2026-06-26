# Audit: `:host{padding}` 외부 reset 취약 패턴 (Phase B)

작성: 2026-06-26 (run-cycle Cycle 3) · 트리거: UAlert 토스트 여백 0 결함(v1.1.1)의 일반화

## 배경

Light-DOM에 직접 배치되는 web component의 호스트 엘리먼트는 **외부 페이지 노드**다.
소비앱의 전역 reset(예: Tailwind v4 preflight `*{padding:0; margin:0}`)이 호스트를 직접
겨냥하면, scoping 규칙상 outer-tree 선언이 컴포넌트 내부의 `:host{padding}`을 **덮는다**.
→ `:host`에 둔 의미 있는 여백이 소비앱에서 0이 될 수 있다(UAlert에서 실제 발생).

**견고한 패턴**: 여백을 Shadow DOM 내부 wrapper(`.container` 등)에 둔다. Shadow 내부
엘리먼트는 외부 `*` reset의 영향을 받지 않는다. (UAlert v1.1.1이 이 방식으로 수정됨)

## 전수 audit 결과

`:host` 블록에 직접 `padding`/`margin`을 선언한 컴포넌트 분류:

### 🟢 무해 — `padding: 0` 류 (외부 reset이 0으로 만들어도 동일)
- UInput, URadio, USelect, UTextarea, UMenu(0), UBadge(`:host([variant])` 0)
- 조치 불요.

### 🟡 내부 전용 사용 (호스트가 부모의 Shadow 안 → 외부 reset 노출 낮음)
- UOption (select/menu 내부), UTabPanel·UTab (tab 컨테이너 내부)
- 우선순위 낮음. 단 독립 사용 시 동일 취약 — 컨벤션 적용 대상.

### 🟠 취약 후보 — light-DOM 직접 배치 + 0이 아닌 의미 있는 여백
| 컴포넌트 | `:host` 선언 | Shadow wrapper | 권장 |
|----------|-------------|----------------|------|
| UButton | `padding: 0.5em` | `.content` 있음 | padding → `.content` 이동 가능 |
| UDivider | `margin/padding` (spacing) | `.line` 있음 | margin은 호스트 외부 간격이라 이동 불가, padding만 `.line` 검토 |
| UTag | `padding: 0.25em 0.5em` | `.content` 있음 | padding → `.content` 이동 가능 |
| UBadge | `padding: 0.2em 0.5em` | 확인 필요 | wrapper 유무 확인 후 이동 |
| UTooltip | `padding: 6px 8px` | 확인 필요 | floating, wrapper 확인 후 이동 |

> 주의 — `margin`은 호스트 **바깥** 간격이라 본질적으로 외부에 노출되는 게 정상이며
> Shadow 내부로 옮길 수 없다(UDivider의 `margin`). reset 취약 논의는 `padding` 중심.

## 권장 조치 (human decision)

1. **컨벤션 명문화** — "light-DOM 직접 배치 컴포넌트는 내부 여백(padding)을 `:host`가 아닌
   Shadow 내부 wrapper에 둔다"를 컴포넌트 작성 가이드/CLAUDE.md에 추가. (신규 컴포넌트 예방)
2. **취약 후보 수정** — 🟠 항목을 컴포넌트별로 `.container`/wrapper 이동. 단 각각 **시각 회귀
   위험**(레이아웃 변동)이 있어 컴포넌트별 렌더 검증 필요 → 일괄 silent 수정 금지, 개별 PR 권장.

## 상태
- 분석 완료(autonomous). 수정은 trade-off(시각 회귀) 존재 → **proposal**로 보류, human이 우선순위 결정.
