import { UBreadcrumb } from "./UBreadcrumb.component.js";

UBreadcrumb.define("u-breadcrumb");

declare global {
  interface HTMLElementTagNameMap {
    "u-breadcrumb": UBreadcrumb;
  }
}

export * from "./UBreadcrumb.component.js";
