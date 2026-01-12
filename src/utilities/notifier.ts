import { UAlert, type AlertType } from "../components/alert/UAlert.component.js";

// Alert 커스텀 엘리먼트 정의 확인
UAlert.define("u-alert");

export type ScreenPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "middle-left"
  | "middle-center"
  | "middle-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

/** 토스트 알림 옵션 */
export interface ToastOptions {
  /** 알림 유형 */
  type: AlertType;
  /** 알림 제목 */
  heading?: string;
  /** 알림 내용 */
  content?: string;
  /** 알림 표시 시간 (밀리초 단위) */
  duration?: number;
  /** 표시 화면 위치 */
  position?: ScreenPosition;
}

/**
 * Notifier 클래스 — 싱글톤 패턴으로 사용합니다.
 */
export class Notifier {
  private static _instance: Notifier;
  
  private containers = new Map<ScreenPosition, HTMLDivElement>();
  private toasts = new Set<UAlert>();

  private constructor() {}

  public static get instance(): Notifier {
    if (!this._instance) {
      this._instance = new Notifier();
    }
    return this._instance;
  }

  /**
   * 토스트 알림을 생성합니다.
   */
  public async toast(options: ToastOptions) {
    const el = new UAlert();
    el.type = options.type;
    el.heading = options.heading;
    el.content = options.content;
    this.toasts.add(el);

    // 토스트 알림을 컨테이너에 추가합니다.
    const position = options.position || "top-right";
    const container = this.getOrCreateContainer(position);
    container.appendChild(el);
    await el.updateComplete;
    el.show();

    // duration 시간이 지나면 알림을 닫고 제거합니다.
    const duration = options.duration && options.duration > 0 ? options.duration : 3000;
    setTimeout(async () => {
      // 300ms 애니메이션 후에 제거
      await el.hide();
      await new Promise((resolve) => setTimeout(resolve, 300));
      el.remove();
      this.toasts.delete(el);

      // 엘리먼트가 없는 컨테이너는 제거합니다.
      if (!container.hasChildNodes()) {
        container.remove();
        this.containers.delete(position);
      }
    }, duration);
  }

  /** 위치에 맞는 컨테이너 엘리먼트를 가져오거나, 생성합니다. */
  private getOrCreateContainer(position: ScreenPosition) {
    let container = this.containers.get(position);
    if (container) return container;

    container = document.createElement("div");
    container.style.position = "fixed";
    container.style.zIndex = "9999";
    container.style.display = "flex";
    container.style.gap = "10px";

    // 기본값 초기화
    const transformParts: string[] = [];

    // 세로 축: top / middle / bottom
    if (position.startsWith("top")) {
      container.style.top = "20px";
      container.style.flexDirection = "column"; // 위 쪽은 자연스러운 세로 정렬
    } else if (position.startsWith("bottom")) {
      container.style.bottom = "20px";
      container.style.flexDirection = "column-reverse"; // 아래쪽은 역순
    } else {
      // middle
      container.style.top = "50%";
      container.style.flexDirection = "column"; // 가운데는 일반 세로 정렬
      transformParts.push("translateY(-50%)");
    }

    // 가로 축: left / center / right
    if (position.endsWith("left")) {
      container.style.left = "20px";
      container.style.alignItems = "flex-start"; // 왼쪽 정렬
    } else if (position.endsWith("right")) {
      container.style.right = "20px";
      container.style.alignItems = "flex-end"; // 오른쪽 정렬
    } else {
      // *-center
      container.style.left = "50%";
      container.style.alignItems = "center";
      transformParts.unshift("translateX(-50%)"); // X 변환은 앞쪽에 두어 읽기 편하게
    }

    // transform이 필요한 경우 설정 (없으면 빈 문자열)
    container.style.transform = transformParts.length ? transformParts.join(" ") : "";

    document.body.appendChild(container);
    this.containers.set(position, container);
    return container;
  }
}

/**
 * 알림 유틸리티 싱글톤 인스턴스입니다.
 */
export const notifier = Notifier.instance;