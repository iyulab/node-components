import type { AlertVariant, AlertStatus } from "../components/alert/UAlert.js";
import { UAlert } from "../components/alert/UAlert.js";
import { OverlayManager } from "./OverlayManager.js";

/** 토스트 알림의 화면 위치 타입 */
export type ToastPosition =
  | "top-left" | "top-center" | "top-right"
  | "middle-left" | "middle-center" | "middle-right"
  | "bottom-left" | "bottom-center" | "bottom-right";

/** 토스트 알림 옵션 */
export interface ToastOptions {
  /** 토스트를 표시할 대상 엘리먼트 (기본: document.body) */
  target?: HTMLElement;
  /** 형태 스타일 */
  variant?: AlertVariant;
  /** 알림 제목 */
  title?: string;
  /** 표시 화면 위치 */
  position?: ToastPosition;
  /** 알림 표시 시간 (밀리초 단위) */
  duration?: number;
  /** 닫기 버튼 표시 여부 */
  closable?: boolean;
}

/**
 * 토스트 알림 유틸리티 클래스입니다.
 */
export class Toast {
  /**
   * 위치별 컨테이너를 **타깃 엘리먼트 자신에 키잉**한다.
   *
   * 종전에는 `"<position>@<id>"` 문자열이 키였고, 그 파생이 세 가지를 동시에 깨뜨렸다:
   * ⑴같은 `id`를 가진 «다른» 엘리먼트가 같은 키로 충돌한다(SPA 라우트 교체가 화면
   * 엘리먼트를 같은 `id`로 다시 만드는 것은 평범한 패턴이다) ⑵`id`가 없으면 폴백이
   * `el-${Date.now()}` 라 호출마다 키가 달라져 캐시가 성립하지 않고 컨테이너가 쌓인다
   * ⑶그 불안정한 키를 `hide` 정리 경로가 **다시 계산**하므로 `containers.delete()` 가
   * 빗나가 항목이 영구히 남는다.
   *
   * `WeakMap` 은 셋을 전부 구조적으로 없앤다 — 엘리먼트 동일성이 곧 키라 충돌이 불가능하고,
   * `id` 유무에 의존하지 않으며, 타깃이 버려지면 그 항목도 함께 수거된다.
   */
  private static containers = new WeakMap<HTMLElement, Map<ToastPosition, HTMLDivElement>>();

  /**
   * 모든 Toast 호출에 적용될 전역 기본 옵션입니다. 개별 호출의 `options`가 우선합니다.
   *
   * @example
   * ```ts
   * Toast.DefaultOptions = { position: 'bottom-center', duration: 3000 };
   * ```
   */
  public static DefaultOptions: Partial<ToastOptions> = {};

  /** 개별 인스턴스 생성을 방지합니다. */
  private constructor() {}

  /** 기본 메시지 알림 */
  public static async message(content: string, options?: ToastOptions) {
    return this.show(undefined, content, options);
  }

  /** 일반 알림 */
  public static async notice(content: string, options?: ToastOptions) {
    return this.show('notice', content, options);
  }

  /** 정보 알림 */
  public static async info(content: string, options?: ToastOptions) {
    return this.show('info', content, options);
  }

  /** 성공 알림 */
  public static async success(content: string, options?: ToastOptions) {
    return this.show('success', content, options);
  }

  /** 경고 알림 */
  public static async warning(content: string, options?: ToastOptions) {
    return this.show('warning', content, options);
  }

  /** 에러 알림 */
  public static async error(content: string, options?: ToastOptions) {
    return this.show('error', content, options);
  }

  /** 토스트 알림을 생성합니다. */
  public static async show(status?: AlertStatus, content?: string, options?: ToastOptions) {
    // 매 호출 시점의 DefaultOptions를 반영해야 하므로(런타임에 재설정 가능) 여기서 병합한다.
    const merged: ToastOptions = { ...this.DefaultOptions, ...options };

    const el = new UAlert();
    el.status = status;
    el.innerHTML = content || '';
    el.variant = merged.variant || 'solid';
    el.title = merged.title || '';
    el.closable = merged.closable ?? true;
    // duration 0 이하는 "자동으로 안 닫힘"을 의미(UAlert 자체 계약) — 필터링하지 않고 그대로 전달.
    el.duration = merged.duration ?? 4000;

    // 토스트 알림을 컨테이너에 추가합니다.
    const position = merged.position || "top-right";
    const target = merged.target || document.body;
    const container = this.getOrCreateContainer(position, target);
    container.appendChild(el);

    // 🔴 연결되지 않은 엘리먼트의 `updateComplete` 는 **영원히 해소되지 않는다** — Lit 은 첫
    // 업데이트를 `connectedCallback` 에서 돌리기 때문이다. 그대로 await 하면 이 Promise 를
    // 기다린 소비앱 코드가 예외도 로그도 없이 «멈춘다». 위 컨테이너 캐시 수정이 그 경로
    // 대부분을 없앴지만, 호출자가 **분리된 `target`** 을 직접 넘기는 경우는 남는다 ⇒ 조용한
    // 무한 대기 대신 소리 나는 no-op 으로 바꾼다.
    if (!el.isConnected) {
      container.removeChild(el);
      console.warn(
        '[@iyulab/components] Toast was not shown: the target element is not in the document.\n' +
        '  A toast can only render inside a connected element — pass a target that is attached,\n' +
        '  or omit `target` to use document.body.'
      );
      return;
    }

    await el.updateComplete;
    el.show();

    // UAlert 내장 duration으로 자동 hide 후, DOM에서 제거합니다.
    // content가 임의의 HTML이라 내부에 자체 hide를 쏘는 엘리먼트가 섞여있을 수 있어 target을 확인한다.
    el.addEventListener('hide', async (e) => {
      if (e.target !== el) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
      el.remove();

      // 엘리먼트가 없는 컨테이너는 제거합니다.
      // 키가 «엘리먼트 자신»이라 정리 경로가 키를 다시 계산하지 않는다 — 종전 문자열 키는
      // 여기서 재계산되며 빗나갈 수 있었다(위 `containers` 주석 ⑶).
      if (!container.hasChildNodes()) {
        container.remove();
        this.containers.get(target)?.delete(position);
      }
    });
  }

  /**
   * 위치에 맞는 컨테이너 엘리먼트를 가져오거나, 생성합니다.
   *
   * ⚠**캐시 적중은 그 컨테이너가 «여전히 쓸 수 있는가»를 확인한 뒤에만 유효하다.** 호스트가
   * 갈아끼워지면(`body.innerHTML = ''`, 셸 재구축) 캐시된 컨테이너는 문서에서 떨어진 채
   * 남는데, 거기에 append 된 엘리먼트는 **연결되지 않아 `updateComplete` 가 영원히 해소되지
   * 않는다**. 낡은 항목은 버리고 새로 만든다.
   */
  private static getOrCreateContainer(position: ToastPosition, target: HTMLElement) {
    let byPosition = this.containers.get(target);
    if (!byPosition) {
      byPosition = new Map<ToastPosition, HTMLDivElement>();
      this.containers.set(target, byPosition);
    }

    const cached = byPosition.get(position);
    if (cached && cached.isConnected && cached.parentNode === target) return cached;
    if (cached) byPosition.delete(position);

    const container = document.createElement("div");
    // 🔴 상수를 박지 않는다 — 겹침의 소유자는 `OverlayManager` 다. 종전에는 여기가 `9999` 로
    // 박혀 있었고 그 매니저가 오버레이에 9999 «초과» 를 주고 있어, ***모달 안에서 띄운 오류
    // 토스트가 구조적으로 항상 가려졌다.*** 알림은 오버레이의 형제가 아니라 그 위 채널이다.
    container.style.zIndex = String(OverlayManager.notificationZIndex);
    container.style.display = "flex";
    container.style.gap = "10px";

    const isTargeted = target !== document.body;

    // ⚠**배치보다 «먼저»** 해야 한다 — UA 의 `[popover]` 기본값을 걷는 데 `inset: auto` 가
    // 들어가는데, 아래 배치가 설정하는 `top`/`right`/… 를 나중에 쓰면 지워 버린다.
    const popoverReady = isTargeted ? false : this.preparePopover(container);

    if (isTargeted) {
      // 아래 `preparePopover` 참조 — 타깃 기준 컨테이너는 top layer 로 올리지 않는다.
      // target 기준 포지셔닝
      container.style.position = "absolute";

      // target에 position이 static이면 relative로 변경
      const targetPosition = getComputedStyle(target).position;
      if (targetPosition === 'static') {
        target.style.position = 'relative';
      }
    } else {
      // document.body 기준 고정 포지셔닝
      container.style.position = "fixed";
    }

    // 기본값 초기화
    const transformParts: string[] = [];

    // 세로 축: top / middle / bottom
    if (position.startsWith("top")) {
      container.style.top = isTargeted ? "8px" : "20px";
      container.style.flexDirection = "column";
    } else if (position.startsWith("bottom")) {
      container.style.bottom = isTargeted ? "8px" : "20px";
      container.style.flexDirection = "column-reverse";
    } else {
      // middle
      container.style.top = "50%";
      container.style.flexDirection = "column";
      transformParts.push("translateY(-50%)");
    }

    // 가로 축: left / center / right
    if (position.endsWith("left")) {
      container.style.left = isTargeted ? "8px" : "20px";
      container.style.alignItems = "flex-start";
    } else if (position.endsWith("right")) {
      container.style.right = isTargeted ? "8px" : "20px";
      container.style.alignItems = "flex-end";
    } else {
      // *-center
      container.style.left = "50%";
      container.style.alignItems = "center";
      transformParts.unshift("translateX(-50%)");
    }

    // transform이 필요한 경우 설정
    container.style.transform = transformParts.length ? transformParts.join(" ") : "";

    target.appendChild(container);
    if (popoverReady) this.showTopLayer(container);
    byPosition.set(position, container);
    return container;
  }

  /**
   * 알림 컨테이너를 **네이티브 top layer** 로 올린다(`popover="manual"`).
   *
   * ## 왜 — z-index 로는 원리적으로 닿지 않는 자리가 있다
   *
   * `OverlayManager` 의 «이름 있는 띠» 계약은 **우리 오버레이보다 위**를 보장한다(실측:
   * 컨테이너 `z-index: 11000`). 그러나 ***top layer 는 z-index 축 밖에 있다*** — 소비앱이
   * 네이티브 `<dialog>.showModal()` 을 열면 그 다이얼로그는 **어떤 z-index 보다도 위**에
   * 서고, 우리 토스트는 가려진다. 실측(cycle-477, 크로미움 `elementFromPoint`):
   *
   * ```
   * containerZIndex 11000 · notificationZIndex 11000 · hitTag "DIALOG" · toastReachable false
   * ```
   *
   * 알림 채널의 제1원칙이 ***«지각되지 않는 경보는 경보가 아니다»*** 이므로, 그 채널은 겹침을
   * **다투지 않고** 전용 층을 가져야 한다. `popover="manual"` 은 dismiss 계약도 포커스 트랩도
   * 걸지 않고 **top layer 승격만** 하므로 이 표면에 정확히 맞는다.
   *
   * ## ⚠ 범위 — `document.body` 컨테이너만이다
   *
   * `target` 이 주어진 컨테이너는 `position: absolute` 로 **그 엘리먼트 기준**으로 놓인다.
   * top layer 원소는 조상의 배치 문맥에서 떨어져 나오므로 그 좌표계가 통째로 깨진다 ⇒
   * 타깃 기준 컨테이너는 **종전 z-index 경로를 그대로 쓴다.** 이것이 시범 범위이고,
   * 오버레이 전면 전환(`u-dialog`·`u-drawer` 등)은 별개 결정이다(`ROADMAP.md` §C-B).
   *
   * ## ⚠ z-index 를 지우지 않는다
   *
   * `showPopover` 가 없는 브라우저(또는 호출이 거부되는 상태)에서는 **아무 일도 일어나지
   * 않고 종전 동작이 그대로 남아야** 한다 — 그래서 승격은 순수 «추가»이고, 실패는 조용히
   * 삼킨다(알림을 띄우려다 예외를 던지는 것은 이 표면에서 최악의 실패다).
   */
  private static preparePopover(container: HTMLDivElement): boolean {
    if (typeof container.showPopover !== 'function') return false;
    container.setAttribute('popover', 'manual');
    // UA 의 `[popover]` 기본 스타일을 걷어낸다 — 그대로 두면 `inset: 0` 이 컨테이너를 화면
    // 전체로 늘리고 테두리·패딩·불투명 배경이 붙는다. ⚠**호출자가 배치보다 먼저 부른다**
    // (`inset: auto` 가 뒤에 오면 `top`/`right` 를 지운다).
    container.style.inset = 'auto';
    container.style.margin = '0';
    container.style.border = 'none';
    container.style.padding = '0';
    container.style.background = 'transparent';
    container.style.color = 'inherit';
    container.style.overflow = 'visible';
    container.style.width = 'auto';
    container.style.height = 'auto';
    container.style.maxWidth = 'none';
    container.style.maxHeight = 'none';
    return true;
  }

  /** 연결된 뒤에만 부를 수 있다 — 실패하면 종전 동작(z-index 띠)으로 조용히 돌아간다. */
  private static showTopLayer(container: HTMLDivElement) {
    try {
      container.showPopover();
    } catch {
      // 알림을 띄우려다 예외를 던지는 것은 이 표면에서 최악의 실패다. 속성을 걷고 넘어간다
      // — 인라인 스타일 리셋은 남지만 전부 «기본값으로 되돌리는» 값이라 무해하다.
      container.removeAttribute('popover');
    }
  }
}
