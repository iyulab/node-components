# converters

```ts
import { arrayAttrConverter, jsonAttrConverter, booleanAttrConverter, dateAttrConverter, urlAttrConverter } from '@iyulab/components';
```

Lit `@property` attribute converter factory functions. Pass these to the `converter` option to handle non-primitive attribute types automatically.

## Usage

```ts
import { property } from 'lit/decorators.js';
import { arrayAttrConverter, jsonAttrConverter } from '@iyulab/components';

class MyElement extends LitElement {
  @property({ converter: arrayAttrConverter() })
  tags: string[] = [];

  @property({ converter: jsonAttrConverter<{ x: number }>() })
  config?: { x: number };
}
```

```html
<!-- Array: comma-separated string ↔ string[] -->
<my-element tags="a,b,c"></my-element>

<!-- JSON: JSON string ↔ object -->
<my-element config='{"x":42}'></my-element>
```

## API

| Function | Converts | Description |
|----------|----------|-------------|
| `arrayAttrConverter(parser?, separator?)` | `string ↔ T[]` | Comma-separated (or custom separator) string to array |
| `jsonAttrConverter(parser?)` | `string ↔ T` | JSON string to object |
| `booleanAttrConverter()` | `string ↔ boolean` | Empty string / null to boolean |
| `dateAttrConverter(parser?)` | `string ↔ Date` | ISO 8601 string to `Date` |
| `urlAttrConverter(parser?)` | `string ↔ URL` | URL string to `URL` object |

All converters accept an optional `parser` function for custom transformation logic.
