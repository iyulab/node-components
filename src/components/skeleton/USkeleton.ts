import { USkeleton } from './USkeleton.component.js';

USkeleton.define("u-skeleton");

declare global {
  interface HTMLElementTagNameMap {
    'u-skeleton': USkeleton;
  }
}

export { USkeleton };
export type { SkeletonShape, SkeletonEffect } from './USkeleton.component.js';
