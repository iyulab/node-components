import { UTabPanel } from "./UTabPanel.component.js";

UTabPanel.define("u-tab-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-tab-panel': UTabPanel;
  }
}

export * from "./UTabPanel.component.js";
