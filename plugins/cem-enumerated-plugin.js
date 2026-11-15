// @ts-check
/**
 * Custom Elements Manifest 분석기 플러그인 — 열거형 속성의 **허용 값**을 매니페스트에 싣는다.
 *
 * 분석기는 속성의 타입을 쓰인 그대로(`ButtonAppearance`)만 적는다 — 별칭을 풀 타입 체커가 없다. 그래서 «소스를 읽지 않고도 속성을
 * 안다» 는 매니페스트의 목적에서 가장 쓸모 있는 정보(어떤 값이 유효한가)가 빠져 있었다. 편집기의 값 완성과 에이전트가 그것을 못 쓰고,
 * 목록 밖의 값(`appearance="filled"`)이 에러 없이 기본 모양이 되는 실수를 도구 쪽에서 못 막았다.
 *
 * 요소는 이미 그 목록을 한 번 적는다 — `static enumerated`(속성 → `enumeratedValues<유니온>()([...])`, 런타임 개발 모드 경고와 컴파일러의
 * 유니온 일치 검사가 읽는다). 이 플러그인은 **같은 목록**으로 매니페스트의 필드 · 속성 `type.text` 를 `"a" | "b"` 로 펼치고(원래 타입 텍스트에
 * `undefined` 가 있으면 유지), 구현 세부인 `enumerated` 정적 멤버는 매니페스트에서 뺀다 — 런타임 경고 · 컴파일 강제 · 매니페스트가 한 출처를
 * 공유하므로 서로 어긋날 수 없다.
 *
 * 상속: 목록은 그 속성을 **선언한 클래스**의 것이다(하위 클래스는 `...super.enumerated` 로 펼칠 뿐 키를 다시 적지 않는다). 매니페스트의 필드는
 * 선언한 클래스에 있고 하위 요소는 `inheritedFrom` 으로 따라가므로 같은 규칙으로 닫힌다.
 *
 * 대상(클래스 · 키 · 값)은 소스에서 도출하고 규칙만 여기 있다.
 *
 * @returns {import('@custom-elements-manifest/analyzer').Plugin}
 */
export default function enumeratedPlugin() {
  /** `경로#클래스` → 속성 이름 → 허용 값(소스 순서)
   *  @type {Map<string, Map<string, string[]>>} */
  const lists = new Map();

  /** @type {import('@custom-elements-manifest/analyzer').Plugin} */
  const plugin = {
    name: 'u-enumerated',

    analyzePhase({ ts, node, moduleDoc }) {
      if (!ts.isClassDeclaration(node) || !node.name) return;
      const key = `${moduleDoc.path}#${node.name.text}`;

      for (const member of node.members) {
        if (!ts.isPropertyDeclaration(member) || !member.initializer) continue;
        const isStatic = member.modifiers?.some((m) => m.kind === ts.SyntaxKind.StaticKeyword);
        if (!isStatic || !ts.isIdentifier(member.name) || member.name.text !== 'enumerated') continue;
        if (!ts.isObjectLiteralExpression(member.initializer)) continue;

        for (const prop of member.initializer.properties) {
          // `...super.enumerated` 같은 펼침은 건너뛴다 — 부모의 키는 부모 클래스의 몫이다.
          if (!ts.isPropertyAssignment(prop)) continue;
          const name = ts.isIdentifier(prop.name) || ts.isStringLiteralLike(prop.name) ? prop.name.text : null;
          if (!name) continue;
          // `enumeratedValues<유니온>()([...])` — 바깥 호출의 첫 인자가 문자열 리터럴 배열이다.
          const call = prop.initializer;
          if (!ts.isCallExpression(call) || !ts.isCallExpression(call.expression)) continue;
          const arr = call.arguments[0];
          if (!arr || !ts.isArrayLiteralExpression(arr)) continue;
          const values = [];
          for (const el of arr.elements) {
            if (!ts.isStringLiteralLike(el)) { values.length = 0; break; } // 리터럴이 아니면 판정하지 않는다
            values.push(el.text);
          }
          if (!values.length) continue;
          let byName = lists.get(key);
          if (!byName) lists.set(key, (byName = new Map()));
          byName.set(name, values);
        }
      }
    },

    moduleLinkPhase({ moduleDoc }) {
      for (const declaration of moduleDoc.declarations ?? []) {
        if (declaration.kind !== 'class') continue;
        // 매니페스트 스키마의 클래스 선언(`members` · `attributes` 를 가진다) — 분석기 타입은 선언 종류의 합집합이라 좁힌다.
        const decl = /** @type {{ name: string, members?: { kind?: string, name?: string, static?: boolean, type?: { text: string } }[], attributes?: { name?: string, fieldName?: string, type?: { text: string } }[] }} */ (declaration);
        const byName = lists.get(`${moduleDoc.path}#${decl.name}`);

        /** 원래 타입 텍스트의 `undefined`(선택 속성)를 유지하며 값 목록 유니온으로 바꾼다.
         *  @param {{ type?: { text: string } }} target @param {string[]} values */
        const expand = (target, values) => {
          const optional = /\bundefined\b/.test(target.type?.text ?? '');
          const text = values.map((v) => JSON.stringify(v)).join(' | ');
          target.type = { text: optional ? `${text} | undefined` : text };
        };

        if (byName) {
          for (const [prop, values] of byName) {
            for (const m of decl.members ?? []) if (m.kind === 'field' && !m.static && m.name === prop) expand(m, values);
            for (const a of decl.attributes ?? []) if (a.fieldName === prop) expand(a, values);
          }
        }

        // 구현 세부 — 값 목록은 위 유니온에 이미 있고, 이 멤버의 `default` 는 소스 텍스트일 뿐이다.
        if (decl.members) {
          const kept = decl.members.filter((m) => !(m.kind === 'field' && m.static && m.name === 'enumerated'));
          if (kept.length !== decl.members.length) decl.members = kept;
        }
      }
    },
  };
  return plugin;
}
