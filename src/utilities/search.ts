/**
 * 검색 일치 — 사람이 «찾았다» 고 여기는 일치. 글자마다 거르는 칸(선택기의 검색 · 표의 필터)이 쓴다.
 *
 * 기본 규칙은 문자 체계에 매여 있어 어느 언어 화면에서나 같다:
 * - 대소문자와 발음 구별 기호를 접는다 — `Ä` · `ä` · `a` 가 같다. 한글 음절은 음절 그대로 견준다(`서` 는 `성` 이 아니다).
 * - 질의의 마지막 음절이 **아직 조합 중**이면(`composing`) 그 음절은 자판으로 친 순서의 자모로 앞부분 일치한다 — 치는
 *   도중의 `성` 이 `서울`(`ㅅㅓㅇ` ⊂ `ㅅㅓㅇㅜㄹ`)을, `서우` 가 `서울` 을 맞춘다. 겹모음 · 겹받침은 두 글쇠로 풀어 `고` 가
 *   `과` 의 앞부분이 된다. 유니코드 정규화(NFD)로는 안 된다 — 받침 `ᆼ` 과 초성 `ᄋ` 이 다른 글자다.
 * - 질의가 한글 자음만이면 초성끼리도 맞춘다 — `ㅅㅇ` 이 `서울` 을 맞춘다.
 *
 * 언어에 매인 규칙(터키어의 `İ`/`ı` 처럼)은 `Locale.registerSearch()` 로 그 언어에 등록한다.
 */

/** 검색 일치의 선택 — `composing`: 질의의 마지막 음절이 아직 IME 로 조합 중이다. */
export interface SearchMatchOptions {
  composing?: boolean;
}

const HANGUL_BASE = 0xac00;
const HANGUL_LAST = 0xd7a3;

/** 초성 19 — 호환 자모. */
const INITIALS = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
/** 중성 21 — 자판으로 친 순서(겹모음은 두 글쇠). */
const MEDIALS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅗㅏ', 'ㅗㅐ', 'ㅗㅣ', 'ㅛ', 'ㅜ', 'ㅜㅓ', 'ㅜㅔ', 'ㅜㅣ', 'ㅠ', 'ㅡ',
  'ㅡㅣ', 'ㅣ',
];
/** 종성 28(없음 포함) — 자판으로 친 순서(겹받침은 두 글쇠). */
const FINALS = [
  '', 'ㄱ', 'ㄲ', 'ㄱㅅ', 'ㄴ', 'ㄴㅈ', 'ㄴㅎ', 'ㄷ', 'ㄹ', 'ㄹㄱ', 'ㄹㅁ', 'ㄹㅂ', 'ㄹㅅ', 'ㄹㅌ', 'ㄹㅍ', 'ㄹㅎ', 'ㅁ', 'ㅂ',
  'ㅂㅅ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
];
/** 호환 자모 중 두 글쇠로 치는 것(겹모음 · 겹받침). */
const COMPOUND_JAMO: Record<string, string> = {
  'ㅘ': 'ㅗㅏ', 'ㅙ': 'ㅗㅐ', 'ㅚ': 'ㅗㅣ', 'ㅝ': 'ㅜㅓ', 'ㅞ': 'ㅜㅔ', 'ㅟ': 'ㅜㅣ', 'ㅢ': 'ㅡㅣ',
  'ㄳ': 'ㄱㅅ', 'ㄵ': 'ㄴㅈ', 'ㄶ': 'ㄴㅎ', 'ㄺ': 'ㄹㄱ', 'ㄻ': 'ㄹㅁ', 'ㄼ': 'ㄹㅂ', 'ㄽ': 'ㄹㅅ', 'ㄾ': 'ㄹㅌ', 'ㄿ': 'ㄹㅍ',
  'ㅀ': 'ㄹㅎ', 'ㅄ': 'ㅂㅅ',
};

function isSyllable(code: number): boolean {
  return code >= HANGUL_BASE && code <= HANGUL_LAST;
}

/** 호환 자모(ㄱ–ㅣ). */
function isCompatJamo(code: number): boolean {
  return code >= 0x3131 && code <= 0x3163;
}

function isHangulChar(ch: string): boolean {
  const code = ch.codePointAt(0)!;
  return isSyllable(code) || isCompatJamo(code);
}

/** 글자가 한글(음절 · 호환 자모)만으로 되어 있는가 — 빈 글자는 아니다. */
export function isHangul(text: string): boolean {
  if (!text) return false;
  for (const ch of text) if (!isHangulChar(ch)) return false;
  return true;
}

/** 대소문자 · 발음 구별 기호를 접는다 — 한글은 그대로(음절 그대로 견준다). */
export function foldForSearch(text: string): string {
  let out = '';
  for (const ch of text) out += isHangulChar(ch) ? ch : ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  return out;
}

/**
 * 한글을 자판으로 친 순서의 호환 자모로 푼다(`과` → `ㄱㅗㅏ` · `닭` → `ㄷㅏㄹㄱ`) — 그 밖의 글자는 `foldForSearch` 처럼 접는다.
 * 조합 중 음절의 풀이는 늘 최종 글자 풀이의 앞부분이다.
 */
export function hangulKeystrokes(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (isSyllable(code)) {
      const offset = code - HANGUL_BASE;
      out += INITIALS[Math.floor(offset / 588)] + MEDIALS[Math.floor((offset % 588) / 28)] + FINALS[offset % 28];
    } else if (isCompatJamo(code)) {
      out += COMPOUND_JAMO[ch] ?? ch;
    } else {
      out += foldForSearch(ch);
    }
  }
  return out;
}

/** 한글 음절의 초성들 — 음절이 아닌 글자는 그대로(`서울 2` → `ㅅㅇ 2`). */
export function initialsOf(text: string): string {
  let out = '';
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    out += isSyllable(code) ? INITIALS[Math.floor((code - HANGUL_BASE) / 588)] : ch;
  }
  return out;
}

/** 질의가 한글 자음(초성으로 쓰이는 것)만으로 되어 있는가. */
function isInitialsQuery(query: string): boolean {
  if (!query) return false;
  for (const ch of query) if (!INITIALS.includes(ch)) return false;
  return true;
}

/** 글자가 검색어를 담는가 — 기본 규칙(이 모듈 머리말). 빈 검색어는 모두를 담는다. */
export function defaultSearchMatch(text: string, query: string, options: SearchMatchOptions = {}): boolean {
  const q = query.trim();
  if (!q) return true;
  if (isInitialsQuery(q) && initialsOf(text).includes(q)) return true;

  const chars = [...q];
  const last = chars[chars.length - 1];
  const folded = foldForSearch(text);
  if (!options.composing || !isHangulChar(last)) return folded.includes(foldForSearch(q));

  // 조합 중인 마지막 음절 — 앞의 확정된 부분은 음절 그대로, 바로 뒤 글자들은 자모 앞부분으로.
  const head = foldForSearch(chars.slice(0, -1).join(''));
  const tail = hangulKeystrokes(last);
  for (let at = folded.indexOf(head); at !== -1 && at < folded.length; at = folded.indexOf(head, at + 1)) {
    if (hangulKeystrokes(folded.slice(at + head.length)).startsWith(tail)) return true;
  }
  return false;
}
