// @ts-check
/**
 * Custom Elements Manifest 분석기 플러그인 — 요소가 내는 이벤트를 코드에서 빠짐없이, 거짓 없이 읽는다.
 *
 * 분석기는 **메서드** 안의 `this.dispatchEvent(new X('이름'))` 만 이벤트로 읽는다. 이 리포는 세 가지가 어긋난다:
 *
 *  1. 기반 클래스의 `fire()`(또는 같은 일을 하는 `emit()`)로 내는 이벤트(`this.fire<Detail>('이름', …)`)는 분석기가 모른다 → 매니페스트에서 빠진다.
 *     여기서 소스의 호출을 읽어 `CustomEvent<Detail>` 로 더한다(JSDoc `@fires` 로 적힌 설명과 타입은 덮지 않는다).
 *  1b. 화살표 함수 필드(`private onClick = () => { this.dispatchEvent(…) }`) 안의 발화도 분석기는 놓친다 — 같은 규칙으로 더한다.
 *  2. `fire()` 자신의 `this.dispatchEvent(new CustomEvent(name, …))` 는 이름이 문자열이 아니라 변수라, 분석기가
 *     변수 이름(`name`)과 이름 없는 항목을 이벤트로 적고 모든 하위 요소가 그것을 물려받는다 → 걷어 낸다.
 *     판별은 «이름이 문자열 리터럴이 아닌 `dispatchEvent(new …)` 에서 나온, 설명 없는 항목» 이다(문서화된
 *     이벤트는 건드리지 않는다).
 *
 * 대상(클래스 · 이벤트 이름)은 소스에서 도출하고 규칙만 여기 있다.
 *
 * @returns {import('@custom-elements-manifest/analyzer').Plugin}
 */
export default function eventsPlugin() {
  /** `경로#클래스` → 이벤트 이름 → 생성자와 상세 타입 텍스트(없으면 null)
   *  @type {Map<string, Map<string, { ctor: string, detail: string | null }>>} */
  const fired = new Map();
  /** `경로#클래스` → 리터럴이 아닌 이름 식별자 텍스트
   *  @type {Map<string, Set<string>>} */
  const dynamic = new Map();

  /** 같은 이름을 여러 곳에서 내면 처음 본 쪽을 남긴다.
   *  @param {string} key @param {string} name @param {{ ctor: string, detail: string | null }} info */
  const record = (key, name, info) => {
    let events = fired.get(key);
    if (!events) fired.set(key, (events = new Map()));
    if (!events.has(name)) events.set(name, info);
  };

  /** @type {import('@custom-elements-manifest/analyzer').Plugin} */
  const plugin = {
    name: 'u-events',

    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const key = `${moduleDoc.path}#${node.name.text}`;

      // 분석기가 번들한 TypeScript 의 노드 타입 — 우리 TypeScript 와 판이 달라 `import('typescript')` 로 쓰면 어긋난다.
      /** @param {import('@custom-elements-manifest/analyzer').AnalyzePhaseParams['node']} n */
      const visit = (n) => {
        if (ts.isCallExpression(n) && ts.isPropertyAccessExpression(n.expression)
          && n.expression.expression.kind === ts.SyntaxKind.ThisKeyword) {
          const method = n.expression.name.text;
          const first = n.arguments[0];
          // `fire` 는 components 의 기반 클래스, `emit` 은 같은 일을 하는 도우미(dimension-timeline) — 이름 하나가 이벤트 이름인 호출이다.
          if ((method === 'fire' || method === 'emit') && first && ts.isStringLiteralLike(first)) {
            record(key, first.text, { ctor: 'CustomEvent', detail: n.typeArguments?.[0]?.getText() ?? null });
          } else if (method === 'dispatchEvent' && first && ts.isNewExpression(first)) {
            const nameArg = first.arguments?.[0];
            if (nameArg && ts.isStringLiteralLike(nameArg)) {
              // 분석기는 메서드만 훑는다 — 화살표 함수 필드(`private onClick = () => { … }`) 안의 발화는 놓친다. 같은 규칙으로 더한다.
              record(key, nameArg.text, { ctor: first.expression.getText(), detail: first.typeArguments?.[0]?.getText() ?? null });
            } else if (nameArg) {
              let names = dynamic.get(key);
              if (!names) dynamic.set(key, (names = new Set()));
              names.add(nameArg.getText());
            }
          }
        }
        ts.forEachChild(n, visit);
      };
      visit(node);
    },

    moduleLinkPhase({ moduleDoc }) {
      for (const declaration of moduleDoc.declarations ?? []) {
        if (declaration.kind !== 'class') continue;
        // 매니페스트 스키마의 클래스 선언(`events` 를 가진다) — 분석기 타입은 선언 종류의 합집합이라 좁힌다.
        const decl = /** @type {{ name: string, events?: { name?: string, description?: string, type?: { text: string } }[] }} */ (declaration);
        const key = `${moduleDoc.path}#${decl.name}`;
        const names = dynamic.get(key);

        const events = (decl.events ?? []).filter((e) => e.name && !(names?.has(e.name) && !e.description));

        for (const [name, { ctor, detail }] of fired.get(key) ?? []) {
          const type = { text: detail ? `${ctor}<${detail}>` : ctor };
          const existing = events.find((e) => e.name === name);
          if (!existing) events.push({ name, type });
          else if (!existing.type) existing.type = type;
        }

        if (events.length) decl.events = events;
        else delete decl.events;
      }
    },
  };
  return plugin;
}
