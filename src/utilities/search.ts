/**
 * 검색 일치 — 사람이 «찾았다» 고 여기는 일치. 글자마다 거르는 칸(선택기의 검색 · 표의 빠른 필터)이 쓴다.
 *
 * 기본 규칙은 문자 체계에 매여 있어 어느 언어 화면에서나 같다:
 * - 대소문자와 발음 구별 기호를 접는다 — `Ä` · `ä` · `a` 가 같다.
 * - 한글은 **자판으로 친 순서의 자모**로 푼다(`과` → `ㄱㅗㅏ` · `닭` → `ㄷㅏㄹㄱ`). 조합 중인 음절의 자모는 늘 최종
 *   글자 자모의 앞부분이라, 치는 도중의 `성` 이 `서울`(`ㅅㅓㅇㅜㄹ`)을 맞춘다. 유니코드 정규화(NFD)로는 안 된다 — 받침
 *   `ᆼ` 과 초성 `ᄋ` 이 다른 글자다.
 * - 질의가 한글 자음만이면 초성끼리도 맞춘다 — `ㅅㅇ` 이 `서울` 을 맞춘다.
 *
 * 언어에 매인 규칙(터키어의 `İ`/`ı` 처럼)은 `Locale.registerSearch()` 로 그 언어에 등록한다.
 */

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

/** 글자가 한글(음절 · 호환 자모)만으로 되어 있는가 — 빈 글자는 아니다. */
export function isHangul(text: string): boolean {
  if (!text) return false;
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    if (!isSyllable(code) && !isCompatJamo(code)) return false;
  }
  return true;
}

/** 한 글자를 검색용으로 접는다. */
function foldChar(ch: string): string {
  const code = ch.codePointAt(0)!;
  if (isSyllable(code)) {
    const offset = code - HANGUL_BASE;
    return INITIALS[Math.floor(offset / 588)] + MEDIALS[Math.floor((offset % 588) / 28)] + FINALS[offset % 28];
  }
  if (isCompatJamo(code)) return COMPOUND_JAMO[ch] ?? ch;
  return ch.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
}

/**
 * 검색용으로 접은 글자 — 대소문자 · 발음 구별 기호를 접고, 한글은 자판으로 친 순서의 자모로 푼다.
 * 두 글자의 접은 꼴을 `includes` 로 견주면 기본 일치가 된다.
 */
export function foldForSearch(text: string): string {
  let out = '';
  for (const ch of text) out += foldChar(ch);
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

/** 글자가 검색어를 담는가 — 기본 규칙(이 모듈 머리말). */
export function defaultSearchMatch(text: string, query: string): boolean {
  const q = query.trim();
  if (!q) return true;
  if (foldForSearch(text).includes(foldForSearch(q))) return true;
  return isInitialsQuery(q) && initialsOf(text).includes(q);
}
