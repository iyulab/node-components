# UDataElement

```ts
import { UDataElement } from '@iyulab/components';
```

Base class for data-driven components that load their initial data from an inline `<script type="application/json">` tag in the light DOM.

## When to extend

Use when you want to declare component data directly in HTML without JavaScript, or when server-rendering initial state into the page.

```ts
import { UDataElement } from '@iyulab/components';
import { customElement } from 'lit/decorators.js';
import { html } from 'lit';

@customElement('my-list')
export class MyList extends UDataElement {
  private items: string[] = [];

  protected override async load(data?: unknown) {
    if (Array.isArray(data)) {
      this.items = data as string[];
    }
  }

  render() {
    return html`
      <ul>${this.items.map(i => html`<li>${i}</li>`)}</ul>
    `;
  }
}
```

```html
<my-list>
  <script type="application/json">
    ["Item A", "Item B", "Item C"]
  </script>
</my-list>
```

## Static Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `buildHTML(json, attrs?)` | `string` | Build a safe inline HTML string with JSON data embedded in a `<script type="application/json">` child |

```ts
const html = MyList.buildHTML(['Item A', 'Item B'], { class: 'my-list' });
// → '<my-list class="my-list"><script type="application/json">["Item A","Item B"]</script></my-list>'
```

## Protected Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `load(data?)` | `Promise<void>` | Called with the parsed JSON data after the element connects; override to handle data |
| `error(error)` | `Promise<void>` | Called when JSON parsing fails; override to handle errors |
