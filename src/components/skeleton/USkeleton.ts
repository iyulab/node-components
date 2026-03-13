import { USkeleton } from './USkeleton.component.js';

USkeleton.define("u-skeleton");

declare global {
  interface HTMLElementTagNameMap {
    'u-skeleton': USkeleton;
  }
}

export * from './USkeleton.component.js';