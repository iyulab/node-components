import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;
    }
    :host([dragover]) .overlay {
      display: flex;
    }
    input[type="file"] {
      display: none;
    }

    .dropbox {
      position: relative;
      width: 100%;
      height: 200px;
      display: flex;
      flex-direction: column;
      align-items: center;
      overflow-y: auto;
      gap: 10px;
      cursor: default;

      u-file-item {
        width: 100%;
      }
      
      .placeholder {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;

        u-icon {
          font-size: 2em;
        }

        .text {
          font-size: 14px;
          font-weight: 500;
          line-height: 20px;
        }
        .text.button {
          color: var(--sl-color-primary-500);
          cursor: pointer;
        }
        .text.button:hover {
          color: var(--sl-color-primary-600);
          text-decoration: underline;
        }
      }
    }
    .dropbox::-webkit-scrollbar {
      width: 5px;
    }
    .dropbox::-webkit-scrollbar-thumb {
      background-color: var(--sl-color-gray-200);
    }
    .dropbox::-webkit-scrollbar-track {
      background-color: transparent;
    }

    .overlay {
      position: absolute;
      z-index: 2;
      width: 100%;
      height: 100%;
      display: none;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      top: 0;
      left: 0;
      background-color: var(--sl-color-gray-200);

      svg {
        fill: currentColor;
        width: 2em;
        height: 2em;
        margin-bottom: 10px;
      }

      .text {
        font-size: 14px;
        font-weight: 500;
        line-height: 20px;
      }
    }
  `;