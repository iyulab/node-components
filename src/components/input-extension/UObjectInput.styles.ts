import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;
    }

    .properties {
      width: 100%;
      display: flex;
      flex-direction: column;
      gap: 3px;

      .property {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: flex-start;
        justify-content: space-between;
        gap: 5px;

        u-text-input {
          font-size: inherit;
        }

        .delete {
          font-size: calc(1.5em + 10px);
          color: var(--sl-color-gray-300);
          cursor: pointer;
        }
        .delete:hover {
          color: var(--sl-color-gray-600);
        }
      }
    }

    .create {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      margin-top: 5px;
      padding: 5px 0px;
      border: 1px dashed var(--sl-color-gray-300);
      box-sizing: border-box;
      cursor: pointer;

      u-icon {
        font-size: inherit;
        color: var(--sl-color-gray-300);
      }
      label {
        font-size: inherit;
        color: var(--sl-color-gray-300);
        cursor: pointer;
      }
    }
    .create:hover {
      border-color: var(--sl-color-gray-600);
      background-color: var(--sl-color-gray-100);

      u-icon {
        color: var(--sl-color-gray-600);
      }
      label {
        color: var(--sl-color-gray-600);
      }
    }
  `;