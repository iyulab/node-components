# tsv

```ts
import { encodeTsv, decodeTsv } from '@iyulab/components';
// or: import { encodeTsv, decodeTsv } from '@iyulab/components/dist/utilities/tsv.js';
```

The clipboard format spreadsheets use for copy and paste (Excel, Google Sheets, LibreOffice): cells
separated by tabs, rows separated by line breaks, and RFC 4180 quoting.

## `encodeTsv(rows: readonly (readonly string[])[]): string`

Writes a table that pastes into a spreadsheet cell for cell. A cell containing a tab, a line break, or a
double quote is wrapped in double quotes, with inner quotes doubled — without that, a cell with a line
break is split into several rows by the application you paste into. Rows are joined with `\n` and no line
break follows the last one, so a single copied cell pastes into a text field as just its text. (A last
row made of one empty cell is closed with `\n` so that it survives the round trip.)

## `decodeTsv(text: string): string[][]`

Reads what a spreadsheet put on the clipboard. Accepts `\r\n`, `\r` and `\n`; quoting starts only when a
cell's first character is a double quote (`5" bolt` is plain text); one trailing line break does not open
a new row, so a row of empty cells is kept. `decodeTsv(encodeTsv(rows))` returns `rows`.

```ts
onCopy(e: ClipboardEvent) {
  e.clipboardData?.setData('text/plain', encodeTsv(selectedCells));
  e.preventDefault();
}
onPaste(e: ClipboardEvent) {
  const rows = decodeTsv(e.clipboardData?.getData('text/plain') ?? '');
  // rows[r][c] are strings — convert per column
}
```

`@iyulab/flex-table` and the `u-simple-sheet` / `u-rich-table` of `@iyulab/data-components` use it for
their clipboard.
