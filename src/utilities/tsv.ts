/**
 * 스프레드시트 클립보드 형식(TSV)의 인코더·디코더 — Excel·Google Sheets 와 복사·붙여넣기로 오가는 표.
 *
 * 규칙은 RFC 4180 의 인용 규칙을 탭 구분자에 적용한 것이다(Excel 이 클립보드에 쓰는 형식):
 * - 셀에 탭·줄바꿈·큰따옴표가 있으면 셀 전체를 큰따옴표로 감싸고 안의 큰따옴표는 둘로 적는다.
 *   감싸지 않으면 줄바꿈이 든 셀 하나가 붙여넣는 쪽에서 여러 행으로 쪼개진다.
 * - 인용은 **셀의 첫 글자**가 큰따옴표일 때만 시작한다 — `5" 나사` 처럼 셀 중간의 따옴표는 글자다.
 * - 행은 LF 로 잇고 끝에는 붙이지 않는다(한 셀을 복사해 입력란에 붙여넣을 때 줄바꿈이 따라오지 않게).
 *   읽을 때는 CRLF·CR·LF 를 모두 받고, 스프레드시트가 붙이는 끝의 줄바꿈 **하나**는 새 행으로 세지 않는다.
 *   마지막 행이 빈 셀 하나면 그 행을 잃지 않도록 줄바꿈으로 닫는다 — 그래서
 *   `decodeTsv(encodeTsv(rows))` 는 `rows` 와 같다.
 */

/** 이 셀은 인용해야 하는가 */
const NEEDS_QUOTE = /[\t\n\r"]/;

/**
 * 2차원 셀 배열을 스프레드시트에 붙여넣을 수 있는 TSV 로 씁니다.
 *
 * @example
 * encodeTsv([['이름', '비고'], ['가', '첫 줄\n둘째 줄']]);
 * // '이름\t비고\n가\t"첫 줄\n둘째 줄"'
 */
export function encodeTsv(rows: readonly (readonly string[])[]): string {
  const lines = rows.map((row) =>
    row.map((cell) => (NEEDS_QUOTE.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell)).join('\t'),
  );
  const text = lines.join('\n');
  // 마지막 행이 빈 줄이면(빈 셀 하나) 줄바꿈으로 닫아야 읽는 쪽이 그 행을 잃지 않는다.
  return lines.length > 0 && lines[lines.length - 1] === '' ? `${text}\n` : text;
}

/**
 * 스프레드시트에서 복사한 TSV 를 2차원 셀 배열로 읽습니다. `encodeTsv` 의 역입니다.
 *
 * @example
 * decodeTsv('가\t"첫 줄\r\n둘째 줄"\r\n');
 * // [['가', '첫 줄\r\n둘째 줄']]
 */
export function decodeTsv(text: string): string[][] {
  const rows: string[][] = [];
  if (text === '') return rows;

  let row: string[] = [];
  let cell = '';
  let i = 0;
  const len = text.length;
  // 셀의 첫 글자인가 — 인용은 여기서만 시작한다. 닫는 따옴표 뒤의 글자는 (관대하게) 같은 셀에 붙인다.
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
