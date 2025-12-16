import { Skeleton } from './Skeleton.js';

Skeleton.define("u-skeleton");

declare global {
  interface HTMLElementTagNameMap {
    'u-skeleton': Skeleton;
  }
}

export { Skeleton };
