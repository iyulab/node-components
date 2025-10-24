import { css } from 'lit';

export const styles = css`
    :host {
      --color: var(--sl-panel-border-color);
      --width: var(--sl-panel-border-width);
      --spacing: var(--sl-spacing-medium);
      box-sizing: border-box;
    }

    :host([vertical]) {
      display: inline-block;
      height: 100%;
      border-left: solid var(--width) var(--color);
      margin: 0 var(--spacing);
    }

    :host(:not([vertical])) {
      display: block;
      width: 100%;
      border-top: solid var(--width) var(--color);
      margin: var(--spacing) 0;
    }
  
  `;