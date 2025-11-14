import { css } from 'lit';

export const styles = css`
  :host {
    display: block;
    width: 100%;
    height: 4px;
    background-color: var(--u-blue-600);
    transform-origin: left;
    transition: all 0.3s ease-out;
    box-shadow: 0 2px 4px var(--u-shadow-weak);
  }
  :host([indeterminate]) {
    animation: indeterminate 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
  }

  @keyframes indeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;