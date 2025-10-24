import { css } from 'lit';

export const styles = css`
    :host {
      position: relative;
      width: 100%;

      font-size: 14px;
      --vertical-padding: 5px;
      --option-limit: 5;
    }
    :host slot::slotted(*) {
      font-size: inherit;
    }
    :host u-input-border {
      padding: var(--vertical-padding) 10px;
    }
    :host([open]) .popover {
      display: block;
    }
    :host([open]) u-input-border {
      border: 2px solid var(--sl-color-primary-500);
      padding: calc(var(--vertical-padding) - 1px) 10px;
      border-radius: 4px 4px 0 0;
      border-bottom: none;
    }
    :host([open]) .container u-icon {
      transform: rotate(-180deg);
    }
    :host([value=""]) .container .value,
    :host(:not([value])) .container .value {
      color: var(--sl-color-gray-600);
    }

    .container {
      position: relative;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-sizing: border-box;
      font-size: inherit;
      height: 1.5em;
      cursor: pointer;
      overflow: hidden;

      u-icon {
        font-size: inherit;
        transition: transform 0.2s ease;
      }
    }

    .popover {
      display: none;
      position: absolute;
      z-index: 100;
      overflow-y: auto;
      width: calc(100% + 3.5px);
      max-height: calc(var(--option-limit) * (1.5em + 5px));
      top: 100%;
      left: -2px;
      background: var(--sl-color-neutral-0);
      border: 2px solid var(--sl-color-primary-500);
      border-top: none;
      box-sizing: border-box;
      font-size: inherit;
      line-height: 1.5;

      .option {
        width: 100%;
        display: flex;
        flex-direction: row;
        align-items: center;
        outline: none;
        padding: 2px 10px;
        box-sizing: border-box;
        font-size: inherit;
        line-height: 1.5;
        cursor: pointer;

        u-icon {
          font-size: inherit;
        }
      }
      .option:hover {
        background: var(--sl-color-gray-100);
      }
      .option:focus {
        background: var(--sl-color-primary-600);
        color: var(--sl-color-neutral-0);
      }
    }
    .popover::-webkit-scrollbar {
      width: 5px;
    }
    .popover::-webkit-scrollbar-thumb {
      background: var(--sl-color-gray-200);
    }
    .popover::-webkit-scrollbar-track {
      background: transparent;
    }
  `;