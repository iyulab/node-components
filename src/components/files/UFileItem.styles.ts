import { css } from 'lit';

export const styles = css`
    :host {
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: 10px;
      padding: 5px;
      border: 1px solid var(--sl-color-gray-300);
      box-sizing: border-box;
      font-size: 14px;
    }

    .prefix {
      width: 2em;
      height: 2em;
    }

    .main {
      position: relative;
      flex: 1;
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto;

      .name {
        grid-column: 1 / 2;
        grid-row: 1 / 2;
        line-height: 1.5;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .size {
        grid-column: 2 / 3;
        grid-row: 1 / 2;
        line-height: 1.5;
        color: var(--sl-color-gray-700);
      }
      .progress {
        grid-column: 1 / 3;
        grid-row: 2 / 3;

        progress {
          width: 100%;
        }
      }
    }

    .suffix {
      font-size: 1.5em;
      cursor: pointer;
    }
    .suffix:hover {
      opacity: 0.4;
    }
  `;