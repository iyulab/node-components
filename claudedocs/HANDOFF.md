# Handoff — @iyulab/components

> 세션 간 컨텍스트 인계. "지금 상태"와 "다음에 할 일" 중심. 과거 이력은 `cycle-logs/`·CHANGELOG에 위임.
> 각 항목은 `cycle-logs/ROADMAP.md`의 페이즈와 같은 용어로 앵커한다.

## 현재 상태 (2026-06-26 기준)

- 로컬 `main`에 **v1.1.1** 커밋 2개:
  - `bb97a80` — UAlert padding→.container, UDrawer `--drawer-size` 지원 (yesung 발견 결함)
  - (HEAD) — 백틱 빌드 차단 결함 수정 + `@cssproperty` 문서화 + CHANGELOG 백필 + audit/컨벤션
- **검증 완료**: `tsc --noEmit` 0 / `npm run build` 0 / `npm test` 17 passed.
- **origin 미push · 태그 없음 · npm 미배포** (= 게시 보류, 아래 참조).
- 모노레포 서브모듈 포인터는 아직 `2e42cae`(v1.1.0)를 가리킴.

## 다음 작업 — 선행 작업 (게시 前에 처리)

게시를 보류한 상태에서, 아래 두 작업을 **선행**으로 진행한 뒤 한꺼번에 게시한다.

### 1. Phase C — UDrawer `@media (max-width:640px)` breakpoint 정책 결정 (human decision)
- **쟁점**: `UDrawer.styles.ts`의 모바일 breakpoint 640px 하드코딩. 라이브러리에 앱 레벨
  breakpoint를 심는 것은 domain boundary 우려(consumer별 모바일 기준 상이).
- **선택지**:
  - (a) 현행 유지 — 운영자 요구("모바일 100%")를 라이브러리가 보장
  - (b) `@media` 제거, `max-width:100%` 자연 축소에 위임 — drawer-size > viewport일 때만 100%
  - (c) breakpoint를 `--drawer-mobile-breakpoint` CSS 변수로 노출 — consumer override 허용
- **결정 후**: 코드 반영 + CHANGELOG/`@cssproperty` 문서 갱신.

### 2. Phase B 후속 — `:host{padding}` 취약 후보 padding 이동 (개별 PR)
- **대상**: UButton(`.content`), UTag(`.content`), UDivider(`.line`, padding만), UBadge·UTooltip(wrapper 확인 필요)
- **방식**: `:host`의 padding을 Shadow DOM 내부 래퍼로 이동. **컴포넌트별 시각 회귀 검증 필수**
  (레이아웃 변동 위험) → 일괄 처리 금지, 컴포넌트 단위로 진행.
- **근거/분류**: `claudedocs/host-padding-audit.md`
- **컨벤션**: `docs/guidelines.md` 핵심 원칙에 이미 명문화됨(신규 컴포넌트 예방).

## 보류 — 게시 (human gate, 선행 작업 완료 후)
- v1.1.1: origin push + `v1.1.1` 태그 push(배포 트리거) + npm publish + yesung bump
- 모노레포 서브모듈 포인터 전진(`2e42cae` → 게시 시점 HEAD)
- ⚠️ 선행 작업(Phase C·취약 후보)에서 코드가 더 바뀌면 버전 재산정 후 게시.

## 기타 정리 대상 (낮은 우선순위)
- `pnpm-lock.yaml`이 untracked이나 `.gitignore` 미등재(lock gitignore 정책과 어긋남) → `.gitignore`에 lock류 추가 권장.
