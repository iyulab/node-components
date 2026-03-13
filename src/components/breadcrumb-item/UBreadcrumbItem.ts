import { UBreadcrumbItem } from "./UBreadcrumbItem.component.js";

UBreadcrumbItem.define("u-breadcrumb-item");

declare global {
  interface HTMLElementTagNameMap {
    "u-breadcrumb-item": UBreadcrumbItem;
  }
}

export * from "./UBreadcrumbItem.component.js";
