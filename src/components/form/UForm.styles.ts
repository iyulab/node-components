import { css } from 'lit';

export const styles = css`
    :host {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      font-size: 14px;

      --header-padding: 10px;
      --form-padding: 10px;
      --footer-padding: 10px;

      --form-gap: 10px;
      --footer-gap: 10px;
    }
    :host([noHeader]) .header {
      display: none;
    }
    :host([noFooter]) .footer {
      display: none;
    }

    .header {
      width: 100%;
      font-size: 1.8em;
      line-height: 1.2;
      font-weight: 600;
      padding: var(--header-padding);
      box-sizing: border-box;
    }

    .form {
      width: 100%;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow-y: auto;
      gap: var(--form-gap);
      padding: var(--form-padding);
      box-sizing: border-box;

      .input {
        font-size: inherit;
      }
    }

    .footer {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--footer-gap);
      padding: var(--footer-padding);
      box-sizing: border-box;
    }

    .special-actions {
      margin-right: auto;
    }

    .actions {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: var(--footer-gap);
    }
  `;