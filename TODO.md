### High Priority

## 컴포넌트 체크 리스트 (Web Awesome, Ant Design, PrimeReact, Chakra UI, Mantine, Material UI 참조)
[x] `alert` 컴포넌트
[x] `avatar` 컴포넌트
[x] `badge` 컴포넌트
[x] `breadcrumb` 컴포넌트
[x] `breadcrumb-item` 컴포넌트
[x] `button` 컴포넌트
[x] `button-group` 컴포넌트
[x] `card` 컴포넌트
[x] `carousel` 컴포넌트
[x] `checkbox` 컴포넌트
[x] `dialog` 컴포넌트
[x] `divider` 컴포넌트
[x] `drawer` 컴포넌트
[ ] `form` 컴포넌트
[x] `icon` 컴포넌트
[x] `icon-button` 컴포넌트
[ ] `input` 컴포넌트
[ ] `menu` 컴포넌트
[ ] `menu-item` 컴포넌트
[x] `progress-bar` 컴포넌트
[x] `progress-ring` 컴포넌트
[-] `radio` 컴포넌트
[-] `radio-group` 컴포넌트
[-] `rating` 컴포넌트
[x] `skeleton` 컴포넌트
[-] `slider` 컴포넌트
[x] `spinner` 컴포넌트
[ ] `split-panel` 컴포넌트
[-] `switch` 컴포넌트
[ ] `tab` 컴포넌트
[ ] `tab-group` 컴포넌트
[x] `tag` 컴포넌트
[ ] `textarea` 컴포넌트
[ ] `tooltip` 컴포넌트
[ ] `tree` 컴포넌트
[ ] `tree-item` 컴포넌트

## 프로젝트 체크 리스트
[ ] 전체 `event`를 활용하는 컴포넌트들 this.emit<T>()로 `import` 정리하기
[ ] `internal` 아이콘 에셋 전체 정리하기(외부에서 활용되는 아이콘들은 `bootstrap`으로 대체하기)
[ ] 전체 `export` 항목 재검토하기(component, utilities, assets), 각 컴포넌트별 `index.ts`파일활용 검토하기
[ ] 전체 컴포넌트 주석 정리하기(`@slot`, `@event`, `@csspart` jsdoc 활용)
[ ] 모두 완료 후 `llms.txt`, `SKILL.md`파일 생성, `README.md`파일 업데이트하기

## 세부 점검 항목
- this.emit()사용시 반환값을 활용하기
- show(), hide()사용시 반환 값 boolean로 통일
- 상태 네이밍 통일 open, variant로 통일
- inert 이용 함수 삭제

## 수정 사항 프롬프트
tag 컴포넌트를 다음과 같이 수정

- 

수정한 이후 tests/preview 및 samples/components의 스토리북에 반영

## 고려 사항
- form 엘리먼트 관리 통합: checkbox, form, input, radio, radio-group, rating, select, slider, switch, textarea 등
- panel 엘리먼트 관리 통합: split-panel, tab-group, tab

### Low Priority

## Additions

- Add `popover` component;
- Add `combobox`, `select`, `option` components;
- Add `color-picker` component;
- Add `date-picker` component;
- Add `time-picker` component;
- Add `pin-input(otp)` component;
- Add `qrcode` component;
- Add `steps` component;
- Add `timeline` component;
- Add `typography` component;
