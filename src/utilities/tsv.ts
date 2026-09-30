/**
 * 스프레드시트 클립보드 형식(TSV)의 인코더·디코더 — Excel·Google Sheets 와 복사·붙여넣기로 오가는 표.
 *
 * 규칙은 RFC 4180 의 인용 규칙을 탭 구분자에 적용한 것이다(Excel 이 클립보드에 쓰는 형식):
 * - 셀에 탭·줄바꿈·큰따옴표가 있으면 셀 전체를 큰따옴표로 감싸고 안의 큰따옴표는 둘로 적는다.
 *   감싸지 않으면 줄바꿈이 든 셀 하나가 붙여넣는 쪽에서 여러 행으로 쪼개진다.
 * - 인용은 **셀의 첫 글자**가 큰따옴표일 때만 시작한다 — `5" 나사` 처럼 셀 중간의 따옴표는 글자다.
 * - 행마다 줄바꿈(`\n`)으로 끝난다 — 스프레드시트도 마지막 행 뒤에 줄바꿈을 붙인다. 읽을 때는
 *   `\r\n`·`\r`·`\n` 을 모두 받고, 끝의 줄바꿈 **하나**는 새 행으로 세지 않는다. 그래서 빈 셀로 끝나는
 *   행도 지워지지 않고 `decodeTsv(encodeTsv(rows))` 는 `rows` 와 같다.
 */

/** 이 셀은 인용해야 하는가 */
const NEEDS_QUOTE = /[\t\n\r"]/;

/**
 * 2차원 셀 배열을 스프레드시트에 붙여넣을 수 있는 TSV 로 씁니다.
 *
 * @example
 * encodeTsv([['이름', '비고'], ['가', '첫 줄\n둘째 줄']]);
 * // '이름\t비고\n가\t"첫 줄\n둘째 줄"\n'
 */
export function encodeTsv(rows: readonly (readonly string[])[]): string {
  return rows
    .map((row) => row.map((cell) => (NEEDS_QUOTE.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join('\t') + '\n')
    .join('');
}

/**
 * 스프레드시트에서 복사한 TSV 를 2차원 셀 배열로 읽습니다. `encodeTsv` 의 역입니다.
 *
 * @example
 * decodeTsv('가\t"첫 줄\r\n둘째 줄"\r\n');
 * // [['가', '첫 줄\n둘째 줄']]
 */
export function decodeTsv(text: string): string[][] {
  const rows: string[][] = [];
  if (text === '') return rows;

  let row: string[] = [];
  let cell = '';
  let i = 0;
  const len = text.length;
  // 이 셀이 인용으로 시작했는가 — 닫는 따옴표 뒤의 글자는 (관대하게) 같은 셀에 붙인다.
  let atCellStart = true;

  const endCell = () => {
    row.push(cell);
    cell = '';
    atCellStart = true;
  };
  const endRow = () => {
    endCell();
    rows.push(row);
    row = [];
  };

  while (i < len) {
    const ch = text[i];

    if (atCellStart && ch === '"') {
      atCellStart = false;
      i++;
      while (i < len) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') {
            cell += '"';
            i += 2;
          } else {
            i++;
            break;
          }
        } else {
          cell += text[i++];
        }
      }
      continue;
    }

    atCellStart = false;
    if (ch === '\t') {
      endCell();
      i++;
    } else if (ch === '\r' || ch === '\n') {
      endRow();
      i += ch === '\r' && text[i + 1] === '\n' ? 2 : 1;
      // 끝의 줄바꿈 하나는 새 행을 열지 않는다.
      if (i === len) return rows;
    } else {
      cell += ch;
      i++;
    }
  }

  endRow();
  return rows;
}
