import { css } from "lit";

export const styles = css`
  :host {
    --tag-color: var(--u-neutral-800);
    --tag-bg-color: var(--u-neutral-100);
    --tag-border-color: transparent;
  }

  /* Variant: solid (강한 채움) */
  :host([variant="solid"]) {
    --tag-color: var(--u-neutral-0);
    --tag-bg-color: var(--u-neutral-600);
    --tag-border-color: var(--u-neutral-600);
  }
  :host([variant="solid"][color="blue"]) {
    --tag-bg-color: var(--u-blue-500);
    --tag-border-color: var(--u-blue-500);
  }
  :host([variant="solid"][color="green"]) {
    --tag-bg-color: var(--u-green-500);
    --tag-border-color: var(--u-green-500);
  }
  :host([variant="solid"][color="yellow"]) {
    --tag-bg-color: var(--u-yellow-600);
    --tag-border-color: var(--u-yellow-600);
  }
  :host([variant="solid"][color="red"]) {
    --tag-bg-color: var(--u-red-500);
    --tag-border-color: var(--u-red-500);
  }
  :host([variant="solid"][color="orange"]) {
    --tag-bg-color: var(--u-orange-500);
    --tag-border-color: var(--u-orange-500);
  }
  :host([variant="solid"][color="teal"]) {
    --tag-bg-color: var(--u-teal-500);
    --tag-border-color: var(--u-teal-500);
  }
  :host([variant="solid"][color="cyan"]) {
    --tag-bg-color: var(--u-cyan-500);
    --tag-border-color: var(--u-cyan-500);
  }
  :host([variant="solid"][color="purple"]) {
    --tag-bg-color: var(--u-purple-500);
    --tag-border-color: var(--u-purple-500);
  }
  :host([variant="solid"][color="pink"]) {
    --tag-bg-color: var(--u-pink-500);
    --tag-border-color: var(--u-pink-500);
  }

  /* Variant: surface (채우기 + 테두리) */
  :host([variant="surface"]) {
    --tag-color: var(--u-neutral-800);
    --tag-bg-color: var(--u-neutral-100);
    --tag-border-color: var(--u-neutral-300);
  }
  :host([variant="surface"][color="blue"]) {
    --tag-color: var(--u-blue-800);
    --tag-bg-color: var(--u-blue-100);
    --tag-border-color: var(--u-blue-300);
  }
  :host([variant="surface"][color="green"]) {
    --tag-color: var(--u-green-800);
    --tag-bg-color: var(--u-green-100);
    --tag-border-color: var(--u-green-300);
  }
  :host([variant="surface"][color="yellow"]) {
    --tag-color: var(--u-yellow-800);
    --tag-bg-color: var(--u-yellow-100);
    --tag-border-color: var(--u-yellow-300);
  }
  :host([variant="surface"][color="red"]) {
    --tag-color: var(--u-red-800);
    --tag-bg-color: var(--u-red-100);
    --tag-border-color: var(--u-red-300);
  }
  :host([variant="surface"][color="orange"]) {
    --tag-color: var(--u-orange-800);
    --tag-bg-color: var(--u-orange-100);
    --tag-border-color: var(--u-orange-300);
  }
  :host([variant="surface"][color="teal"]) {
    --tag-color: var(--u-teal-800);
    --tag-bg-color: var(--u-teal-100);
    --tag-border-color: var(--u-teal-300);
  }
  :host([variant="surface"][color="cyan"]) {
    --tag-color: var(--u-cyan-800);
    --tag-bg-color: var(--u-cyan-100);
    --tag-border-color: var(--u-cyan-300);
  }
  :host([variant="surface"][color="purple"]) {
    --tag-color: var(--u-purple-800);
    --tag-bg-color: var(--u-purple-100);
    --tag-border-color: var(--u-purple-300);
  }
  :host([variant="surface"][color="pink"]) {
    --tag-color: var(--u-pink-800);
    --tag-bg-color: var(--u-pink-100);
    --tag-border-color: var(--u-pink-300);
  }

  /* Variant: filled (채우기만, 테두리 없음) */
  :host([variant="filled"]) {
    --tag-color: var(--u-neutral-800);
    --tag-bg-color: var(--u-neutral-100);
    --tag-border-color: transparent;
  }
  :host([variant="filled"][color="blue"]) {
    --tag-color: var(--u-blue-800);
    --tag-bg-color: var(--u-blue-100);
  }
  :host([variant="filled"][color="green"]) {
    --tag-color: var(--u-green-800);
    --tag-bg-color: var(--u-green-100);
  }
  :host([variant="filled"][color="yellow"]) {
    --tag-color: var(--u-yellow-800);
    --tag-bg-color: var(--u-yellow-100);
  }
  :host([variant="filled"][color="red"]) {
    --tag-color: var(--u-red-800);
    --tag-bg-color: var(--u-red-100);
  }
  :host([variant="filled"][color="orange"]) {
    --tag-color: var(--u-orange-800);
    --tag-bg-color: var(--u-orange-100);
  }
  :host([variant="filled"][color="teal"]) {
    --tag-color: var(--u-teal-800);
    --tag-bg-color: var(--u-teal-100);
  }
  :host([variant="filled"][color="cyan"]) {
    --tag-color: var(--u-cyan-800);
    --tag-bg-color: var(--u-cyan-100);
  }
  :host([variant="filled"][color="purple"]) {
    --tag-color: var(--u-purple-800);
    --tag-bg-color: var(--u-purple-100);
  }
  :host([variant="filled"][color="pink"]) {
    --tag-color: var(--u-pink-800);
    --tag-bg-color: var(--u-pink-100);
  }

  /* Variant: outlined (테두리만) */
  :host([variant="outlined"]) {
    --tag-color: var(--u-neutral-700);
    --tag-bg-color: transparent;
    --tag-border-color: var(--u-neutral-300);
  }
  :host([variant="outlined"][color="blue"]) {
    --tag-color: var(--u-blue-600);
    --tag-border-color: var(--u-blue-300);
  }
  :host([variant="outlined"][color="green"]) {
    --tag-color: var(--u-green-600);
    --tag-border-color: var(--u-green-300);
  }
  :host([variant="outlined"][color="yellow"]) {
    --tag-color: var(--u-yellow-700);
    --tag-border-color: var(--u-yellow-300);
  }
  :host([variant="outlined"][color="red"]) {
    --tag-color: var(--u-red-600);
    --tag-border-color: var(--u-red-300);
  }
  :host([variant="outlined"][color="orange"]) {
    --tag-color: var(--u-orange-600);
    --tag-border-color: var(--u-orange-300);
  }
  :host([variant="outlined"][color="teal"]) {
    --tag-color: var(--u-teal-600);
    --tag-border-color: var(--u-teal-300);
  }
  :host([variant="outlined"][color="cyan"]) {
    --tag-color: var(--u-cyan-600);
    --tag-border-color: var(--u-cyan-300);
  }
  :host([variant="outlined"][color="purple"]) {
    --tag-color: var(--u-purple-600);
    --tag-border-color: var(--u-purple-300);
  }
  :host([variant="outlined"][color="pink"]) {
    --tag-color: var(--u-pink-600);
    --tag-border-color: var(--u-pink-300);
  }

  :host {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 500;
    padding: 0.25em 0.5em;
    border: 1px solid var(--tag-border-color);
    border-radius: 4px;
    color: var(--tag-color);
    background-color: var(--tag-bg-color);
    line-height: 1.5em;
    white-space: nowrap;
    user-select: none;
    box-sizing: border-box;
  }
  :host([rounded]) {
    border-radius: 999px;
  }

  /* === Slots === */
  ::slotted([slot="prefix"]) {
    margin-right: 0.15em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.15em;
  }

  /* === Content === */
  .content {
    display: inline-block;
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
