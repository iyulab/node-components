import { css } from "lit";

export const styles = css`
  :host {
    /* 폼/그리드 셀에서 컨테이너 폭을 채우려면 소비자가 --u-textarea-display: block 을 준다.
       flex 컨테이너처럼 block 만으로 늘어나지 않는 맥락을 위해 width 경로도 함께 연다. */
    display: var(--u-textarea-display, inline-block);
    width: var(--u-textarea-width, auto);
    color: var(--u-txt-color, #212121);
    font-family: var(--u-font-base);
  }

  /* ===== 컨테이너 (outlined 기본) ===== */
  .container {
    display: flex;
    padding: var(--u-field-padding-block, 0.3em) var(--u-field-padding-inline, 0.6em);
    /* 호스트 하한(--u-target-size, 미설정 = 0) — 글자와 독립된 터치 하한. */
    box-sizing: border-box;
    min-height: var(--u-target-size, 0px);
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: var(--u-field-radius, 0.25em);
    background-color: var(--u-input-bg-color, #FFFFFF);
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), background-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  :host([readonly]) .container,
  :host(:disabled) .container {
    border-color: var(--u-border-color-weak, #EEEEEE);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
  }
  :host(:not([readonly]):not(:disabled)) .container:hover {
    box-shadow: 0 0 0 1px var(--u-input-border-color-hover, #BDBDBD);
  }
  :host(:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }
  :host([invalid]:not([readonly]):not(:disabled)) .container {
    box-shadow: 0 0 0 1px var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Appearance: soft (중립 틴트 면) ===== */
  :host([appearance="soft"]) .container {
    border-color: transparent;
    background-color: var(--u-neutral-200, #EEEEEE);
    border-radius: var(--u-field-radius, 0.25em) var(--u-field-radius, 0.25em) 0 0;
    border-bottom: 2px solid var(--u-input-border-color, #E0E0E0);
  }
  :host([appearance="soft"][readonly]) .container,
  :host([appearance="soft"]:disabled) .container {
    background-color: var(--u-bg-color-disabled, #FAFAFA);
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([appearance="soft"]:not([readonly]):not(:disabled)) .container:hover {
    box-shadow: none;
    background-color: var(--u-neutral-300, #E0E0E0);
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([appearance="soft"]:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
  }
  :host([appearance="soft"][invalid]:not([readonly]):not(:disabled)) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Appearance: underlined ===== */
  :host([appearance="underlined"]) .container {
    border: none;
    border-radius: var(--u-radius-none, 0);
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid var(--u-input-border-color, #E0E0E0);
  }
  :host([appearance="underlined"][readonly]) .container,
  :host([appearance="underlined"]:disabled) .container {
    background-color: transparent;
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([appearance="underlined"]:not([readonly]):not(:disabled)) .container:hover {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([appearance="underlined"]:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
    border-bottom-width: 2px;
  }
  :host([appearance="underlined"][invalid]:not([readonly]):not(:disabled)) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Appearance: plain (외형 없음) ===== */
  :host([appearance="plain"]) .container {
    border: none;
    border-radius: var(--u-radius-none, 0);
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }
  :host([appearance="plain"]:not([readonly]):not(:disabled)) .container:hover,
  :host([appearance="plain"]:not([readonly]):not(:disabled)) .container:focus-within {
    box-shadow: none;
  }
  /* 외형이 없어도 포커스는 보여야 한다(WCAG 2.4.7) — 쉬는 동안은 아무것도 그리지 않고, 포커스가
     들어오면 링을 그린다. 깜박이는 캐럿만으로는 «어디에 포커스가 있는가» 를 알리기 어렵다. */
  :host([appearance="plain"]:not(:disabled)) .container:focus-within {
    outline: 2px solid var(--u-focus-ring-color, #1565C0);
    outline-offset: 2px;
  }

  /* ===== Textarea 요소 ===== */
  textarea {
    display: block;
    border: none;
    background: none;
    outline: none;
    padding: 0;
    margin: 0;
    color: inherit;
    font: inherit;
    flex: 1;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  textarea::placeholder {
    color: var(--u-txt-color-weak, #616161);
  }
  textarea:disabled {
    cursor: not-allowed;
  }
  textarea:read-only {
    cursor: default;
  }
  textarea:focus,
  textarea:focus-visible {
    outline: none;
  }

  :host([resize="none"]) textarea { 
    resize: none; 
  }
  :host([resize="vertical"]) textarea { 
    resize: vertical; 
  }
  :host([resize="horizontal"]) textarea { 
    resize: horizontal; 
  }
  :host([resize="both"]) textarea { 
    resize: both; 
  }
  :host([resize="auto"]) textarea {
    resize: none;
    overflow: hidden;
  }
  :host(:disabled) textarea,
  :host([readonly]) textarea {
    resize: none;
  }

  /* ===== 카운터 ===== */
  .counter {
    margin-top: 0.25em;
    text-align: right;
    color: var(--u-txt-color-weak, #616161);
    font-size: 0.75em;
    line-height: 1.2;
  }

  /* === Size — 버튼과 같은 세 단. md 는 주변 글자 크기를 상속하지 않는다(버튼과 높이가 갈렸다). === */
  :host {
    font-size: var(--u-density, 14px);
  }
  :host([size="sm"]) {
    font-size: 12px;
  }
  :host([size="lg"]) {
    font-size: 16px;
  }
`;
