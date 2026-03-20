import { UPanel } from "./UPanel.component.js";

UPanel.define("u-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-panel': UPanel;
  }
}

export * from "./UPanel.component.js";
