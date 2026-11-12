/**
 * 글자 비교 — 표 · 목록이 «글자 열» 을 줄 세울 때 쓰는 하나의 순서.
 *
 * 규칙은 둘이다:
 * - **숫자는 숫자로 견준다**(`numeric`) — 품번 `A-2` 가 `A-10` 앞이다. 사전순(`A-10` < `A-2`)은 품번 · 전표번호에서 바로 틀려 보인다.
 * - **로캘은 앱이 정한 `Locale.get()`** 이다(`<html lang>` → 브라우저 언어 → `en`). 브라우저 기본이 아니다 — 같은 앱이
 *   브라우저 언어가 다른 두 사람에게 다른 순서(한글이 라틴 앞 / 뒤)를 내지 않게 한다.
 *
 * 대소문자와 악센트는 같은 글자로 본다(`sensitivity: 'base'`) — 같은 줄은 입력 순서(안정 정렬)를 그대로 둔다.
 * `Intl.Collator` 는 만드는 값이 비싸므로 로캘별로 한 번만 만들어 둔다.
 */
import { Locale, type LocaleTag } from './Locale.js';

const collators = new Map<string, Intl.Collator>();

/** 마지막으로 쓴 로캘의 collator — 정렬 한 번에 수만 번 부르므로 `Map` 조회도 아낀다. */
let lastTag: string | undefined;
let lastCollator: Intl.Collator | undefined;

function createCollator(tag: string): Intl.Collator {
  const options: Intl.CollatorOptions = { numeric: true, sensitivity: 'base' };
  try {
    return new Intl.Collator(tag, options);
  } catch {
    // 잘못된 BCP 47 꼬리표(`ko_KR` 같은 밑줄 표기 등) — 던지지 않고 영어로 견준다. 정렬이 깨지는 것보다 낫다.
    return new Intl.Collator('en', options);
  }
}

/**
 * 로캘의 글자 비교기. `locale` 을 주지 않으면 앱의 활성 로캘(`Locale.get()`)이다.
 * `Intl.Collator#compare` 는 바인딩돼 있어 `array.sort(collator.compare)` 로 바로 쓸 수 있다.
 */
export function getCollator(locale?: LocaleTag): Intl.Collator {
  const tag = locale ?? Locale.get();
  if (tag === lastTag && lastCollator) return lastCollator;
  let collator = collators.get(tag);
  if (!collator) {
    collator = createCollator(tag);
    collators.set(tag, collator);
  }
  lastTag = tag;
  lastCollator = collator;
  return collator;
}

/**
 * 두 글자를 앱의 순서로 견준다 — 음수 · 0 · 양수. 숫자는 숫자로, 한글 · 라틴의 앞뒤는 `Locale.get()` 이 정한다.
 * 호출마다 `Locale.get()` 을 읽으므로 로캘이 바뀐 뒤의 정렬은 바뀐 순서를 낸다.
 */
export function compareText(a: string, b: string, locale?: LocaleTag): number {
  return getCollator(locale).compare(a, b);
}
