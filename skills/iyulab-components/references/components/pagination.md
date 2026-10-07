# u-pagination

```ts
import '@iyulab/components/dist/components/pagination/UPagination.js';
```

**Tag:** `u-pagination`

Page navigation for a paged list: the range and total ("101–120 of 345"), previous / next, page numbers with gaps,
and optionally a rows-per-page select. `page` is **zero-based** — the same axis as the data sources
(`createODataSource`, `createArraySource` in `@iyulab/flex-table`) and both tables (`flex-table`, `u-rich-table`).
The numbers on screen start at 1.

```html
<u-pagination page="0" page-size="20" total-count="345" page-sizes="20,50,100"></u-pagination>
```

It works on its own: choosing a page fires `page-change` and, unless the event is cancelled, the element updates its
own `page` / `page-size`. Bound to a source, the source is the truth — pass its state in and call the source from the
event:

```ts
pager.addEventListener('page-change', (e) => {
  const { page, pageSize } = e.detail;
  if (pageSize !== source.getState().pageSize) source.setPageSize(pageSize); // goes back to page 0
  else source.setPage(page);
});
```

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `page` | `number` | `0` | ✓ | Current page, zero-based. Out of range shows the first or last page |
| `pageSize` | `number` | `20` | | Rows per page (attribute `page-size`) |
| `totalCount` | `number` | `0` | | All rows, before paging (attribute `total-count`) |
| `pageSizes` | `number[]` | `[]` | | Choices for rows per page (attribute `page-sizes`, a comma list). Empty — no select |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | ✓ | Size step of the buttons and the select, as the other controls |
| `siblings` | `number` | `1` | | Page numbers shown on each side of the current one |

`pageCount` (read-only) is the number of pages — 1 when there are no rows.

## Events

| Event | Detail | Description |
|-------|--------|-------------|
| `page-change` | `{ page, pageSize }` | A page was chosen, or the page size changed (then `page` is `0`). Cancelable — cancel it to keep the current page |

## CSS Parts

| Part | Description |
|------|-------------|
| `nav` | `<nav>` wrapper (named "Pagination", localized) |
| `range` | The range-and-total text |
| `page` | A page-number button; the current one has `aria-current="page"` |
| `prev` / `next` | Previous / next buttons |
| `page-size` | The rows-per-page `u-select` |

## CSS Custom Properties

| Property | Default | Description |
|----------|---------|-------------|
| `--pagination-gap` | `var(--u-space-sm)` | Row gap when the bar wraps |

## Accessibility

A `<nav>` landmark named by the locale's "Pagination". Each page button is named "Page n" and the current one carries
`aria-current="page"` on the element that takes focus; previous / next are disabled at the ends. The texts follow
`Locale` (`pagination`, `previousPage`, `nextPage`, `pageN`, `rowsPerPage`, `rangeOfTotal`).
