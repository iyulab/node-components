# @iyulab/components — Phase Backlog

> 이 문서는 **페이즈 수준 방향**만 담는다. 사이클 번호별 스코프 표를 만들지 않는다.
> 구체 스코프는 한 번에 한 사이클만, 직전 사이클의 STEP 5가 다음 사이클을 정한다.

## 현재 컨텍스트 (2026-06-26 트라이지 기점)

yesung-oms(대표 소비앱)에서 발견된 두 결함이 로컬 main(`bb97a80`, v1.1.1)에 이미
커밋되어 있으나 **origin 미푸시 · 태그 없음 · npm 미배포**(전부 human gate).

- UAlert: light-DOM 리셋(`*{padding:0}`)이 `:host` padding을 덮어 토스트 여백 0
  → 패딩을 Shadow DOM 내부 `.container`로 이동 (반영됨, 트라이지 권장과 일치)
- UDrawer: `.panel`이 `--drawer-size` 미참조 → 폭 조정 불가
  → `width:var(--drawer-size,28rem)` 등 반영됨. 단 보강 필요점 잔존.

## 완료 (2026-06-26 run-cycle, cycle-01~03)
- **Phase A** ✅ v1.1.1 결함 검증 + 보강. UAlert 백틱 빌드 차단 결함 발견·수정,
  UDrawer `@cssproperty` 문서화, 이슈 closed 이동. (게시만 human gate 잔존)
- **Phase B** ✅ `:host{padding}` 취약 패턴 전수 audit + `docs/guidelines.md` 컨벤션 명문화.
  (취약 후보 실제 수정은 시각 회귀 trade-off → 개별 PR 제안)
- **Phase D** ✅ CHANGELOG 1.0.7~1.1.1 백필.

## 남은 작업

> 진행 순서: **선행 작업(Phase C + Phase B 후속)을 먼저 처리 → 그 후 게시**. (게시 보류 결정 2026-06-26)
> 다음 세션 인계는 `claudedocs/HANDOFF.md` 참조.

### 선행 작업 1 — Phase C: UDrawer 모바일 breakpoint 정책 (human decision)
- `@media (max-width:640px)` 하드코딩 — 라이브러리에 앱 breakpoint 심는 domain boundary 우려.
  선택지: (a) 현행 유지 / (b) `@media` 제거 + max-width:100% 위임 / (c) `--drawer-mobile-breakpoint` 변수 노출.
  운영자 요구("모바일 100%")와 균형. 결정 후 코드 + 문서 반영.

### 선행 작업 2 — Phase B 후속: 취약 후보 padding 이동 (개별 PR)
- UButton/UTag/UDivider(padding만)/UBadge/UTooltip. 컴포넌트별 시각 회귀 검증 필요. `host-padding-audit.md` 참조.

### 게시 (보류 — 선행 작업 완료 후, human gate)
- v1.1.1: origin push + `v1.1.1` 태그 push(배포 트리거) + npm publish + yesung bump
- 모노레포 서브모듈 포인터 전진(`2e42cae` → 게시 시점 HEAD)
- 선행 작업에서 코드가 더 바뀌면 버전 재산정 후 게시.
