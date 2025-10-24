import { css } from 'lit';

export const styles = css`
    :host {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
    }
    :host([state="init"]) .footer {
      justify-content: flex-end;
      u-button[theme="default"], u-button[theme="success"] { display: none; }
    }
    :host([state="inProgress"]) .footer u-button[theme="success"] {
      display: none;
    }
    :host([state="completed"]) .footer u-button[theme="primary"] {
      display: none;
    }

    .header {
      width: 100%;
    }

    .content {
      width: 100%;
    }

    .footer {
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  `;