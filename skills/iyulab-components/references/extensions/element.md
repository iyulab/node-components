# UElement

```ts
import { UElement } from '@iyulab/components';
```

Root base class for all `@iyulab/components` components. Extends `LitElement` with event helpers and render utilities.

## When to extend

Extend `UElement` for any custom component that doesn't need form association or overlay/floating behavior.

```ts
import { UElement } from '@iyulab/components';
import { customElement, property } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('my-badge')
export class MyBadge extends UElement {
  @property() label = '';

  render() {
    return html`<span>${this.label}</span>`;
  }
}
```

## Protected API

| Method | Signature | Description |
|--------|-----------|-------------|
| `fire` | `fire<T>(name, options?): boolean` | Dispatch a `CustomEvent` on the host. `bubbles`, `composed`, `cancelable` are `true` by default. Returns `false` if the event was cancelled. |
| `relay` | `relay(event, options?): boolean` | Re-dispatch a DOM event from the host: stops the original and fires the same type with the same init — `bubbles`, `cancelable` and type-specific fields (`InputEvent.data`/`inputType`, `CustomEvent.detail`) — and `composed: true`, so listeners on the host's ancestors receive it. Use it to surface inner element events (a native `change` stays inside the shadow root otherwise). Returns `false` if the event was cancelled. |
| `replace` | `replace(value, options?): void` | Replace the entire shadow DOM render output with a new Lit `TemplateResult`. Preserves `<style>` tags. |

## Static members

| Member | Description |
|--------|-------------|
| `styles` | Base styles (`CSSResult`); combine with `[super.styles, myStyles]` |
| `define(name)` | Register this class as a custom element under a given tag name |
| `dependencies` | `Record<string, typeof UElement>` — declare sub-components to auto-define |

## Example: custom event

```ts
@customElement('my-input')
class MyInput extends UElement {
  private handleChange(e: Event) {
    // relay native input event from shadow DOM to host
    this.relay(e);

    // or fire a custom event
    this.fire('my-change', { detail: { value: (e.target as HTMLInputElement).value } });
  }
}
```
