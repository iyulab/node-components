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
[-] `checkbox` 컴포넌트
[x] `chip` 컴포넌트
[x] `dialog` 컴포넌트
[x] `divider` 컴포넌트
[x] `drawer` 컴포넌트
[ ] `form` 컴포넌트
[x] `icon` 컴포넌트
[x] `icon-button` 컴포넌트
[ ] `input` 컴포넌트
[ ] `menu` 컴포넌트
[ ] `menu-item` 컴포넌트
[ ] `option` 컴포넌트
[x] `panel` 컴포넌트
[x] `popover` 컴포넌트
[x] `progress-bar` 컴포넌트
[x] `progress-ring` 컴포넌트
[-] `radio` 컴포넌트
[-] `rating` 컴포넌트
[ ] `select` 컴포넌트
[x] `skeleton` 컴포넌트
[-] `slider` 컴포넌트
[x] `spinner` 컴포넌트
[x] `split-panel` 컴포넌트
[-] `switch` 컴포넌트
[x] `tab` 컴포넌트
[ ] `tab-panel` 컴포넌트
[x] `tag` 컴포넌트
[-] `textarea` 컴포넌트
[x] `tooltip` 컴포넌트
[ ] `tree` 컴포넌트
[ ] `tree-item` 컴포넌트

## 프로젝트 체크 리스트
[ ] 전체 `event`를 활용하는 컴포넌트들 this.emit<T>()로 `import` 정리하기
[ ] 전체 컴포넌트 주석 정리하기(`@slot`, `@event`, `@csspart` jsdoc 활용)
[ ] 전체 완료 후 `llms.txt`, `SKILL.md`파일 생성, `README.md`파일 업데이트하기

## 세부 점검 항목
- `popover`를 이용가능한 컴포넌트들에 적용하기
  - `input`, `menu`, `select`,
- `field` 컴포넌트 추가하기
- `prefix`, `suffix` slot 조합의 경우 기본 slot을 `content`로 감싸기
  - `menu-item`, `option`, `tree-item`, `button` 판단

- this.emit()사용시 반환값을 활용하기
- show(), hide()사용시 반환 값 boolean로 통일하기
- cloneNode()는 가급적 사용 지양하기

## 고려 사항
- Form 엘리먼트 관리 통합: checkbox, input, radio, rating, select, slider, switch, textarea 등
- panel 엘리먼트 관리 통합: split-panel, tab-panel, panel 등

### Low Priority

## Additions

- Add `color-picker` form-component;
- Add `date-picker` form-component;
- Add `time-picker` form-component;
- Add `pin-input(otp)` form-component;
- Add `qrcode` component;
- Add `u-step-panel` component;
- Add `timeline` component;
- Add `typography` component;
