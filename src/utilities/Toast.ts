import type { AlertVariant, AlertStatus } from "../components/alert/UAlert.js";
import { UAlert } from "../components/alert/UAlert.js";

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
  private static containers = new Map<string, HTMLDivElement>();
  private static elements = new Set<UAlert>();

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
    const el = new UAlert();
    el.status = status;
    el.innerHTML = content || '';
    el.variant = options?.variant || 'solid';
    el.title = options?.title || '';
    el.closable = options?.closable ?? true;
    el.duration = options?.duration && options.duration > 0 ? options.duration : 3000;
    this.elements.add(el);

    // 토스트 알림을 컨테이너에 추가합니다.
    const position = options?.position || "top-right";
    const target = options?.target || document.body;
    const container = this.getOrCreateContainer(position, target);
    container.appendChild(el);
    await el.updateComplete;
    el.show();

    // UAlert 내장 duration으로 자동 hide 후, DOM에서 제거합니다.
    el.addEventListener('hide', async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      el.remove();
      this.elements.delete(el);

      // 엘리먼트가 없는 컨테이너는 제거합니다.
      if (!container.hasChildNodes()) {
        const containerKey = this.getContainerKey(position, target);
        container.remove();
        this.containers.delete(containerKey);
      }
    });
  }

  /** 컨테이너 키를 생성합니다. */
  private static getContainerKey(position: ToastPosition, target: HTMLElement): string {
    const targetId = target === document.body ? 'body' : (target.id || `el-${Date.now()}`);
    return `${position}@${targetId}`;
  }

  /** 위치에 맞는 컨테이너 엘리먼트를 가져오거나, 생성합니다. */
  private static getOrCreateContainer(position: ToastPosition, target: HTMLElement) {
    const key = this.getContainerKey(position, target);
    let container = this.containers.get(key);
    if (container) return container;

    container = document.createElement("div");
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.gap = "10px";

    const isTargeted = target !== document.body;

    if (isTargeted) {
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
    this.containers.set(key, container);
    return container;
  }
}
