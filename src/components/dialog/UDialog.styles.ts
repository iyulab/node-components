import { css } from 'lit';

export const styles = css`
  :host {
    --container-offset: 0px;
  }

  /* placement별 정렬 */
  :host([placement="center"])       .container { align-items: center;     justify-content: center;     }
  :host([placement="top"])          .container { align-items: flex-start;  justify-content: center;    }
  :host([placement="bottom"])       .container { align-items: flex-end;    justify-content: center;    }
  :host([placement="start"])        .container { align-items: center;      justify-content: flex-start; }
  :host([placement="end"])          .container { align-items: center;      justify-content: flex-end;   }
  :host([placement="top-start"])    .container { align-items: flex-start;  justify-content: flex-start; }
  :host([placement="top-end"])      .container { align-items: flex-start;  justify-content: flex-end;   }
  :host([placement="bottom-start"]) .container { align-items: flex-end;    justify-content: flex-start; }
  :host([placement="bottom-end"])   .container { align-items: flex-end;    justify-content: flex-end;   }

  /* placement별 초기 transform */
  :host([placement="top"]) .panel,
  :host([placement="top-start"]) .panel,
  :host([placement="top-end"]) .panel       { 
    transform: scale(0.92) translateY(-12px); 
  }

  :host([placement="bottom"]) .panel,
  :host([placement="bottom-start"]) .panel,
  :host([placement="bottom-end"]) .panel    { 
    transform: scale(0.92) translateY(12px); 
  }

  :host([placement="start"]) .panel         { 
    transform: scale(0.92) translateX(-12px); 
  }
  :host([placement="end"]) .panel           { 
    transform: scale(0.92) translateX(12px); 
  }

  :host([open][placement="top"]) .panel,
  :host([open][placement="top-start"]) .panel,
  :host([open][placement="top-end"]) .panel,
  :host([open][placement="bottom"]) .panel,
  :host([open][placement="bottom-start"]) .panel,
  :host([open][placement="bottom-end"]) .panel,
  :host([open][placement="start"]) .panel,
  :host([open][placement="end"]) .panel {
    opacity: 1;
    transform: scale(1) translate(0);
  }

  .container {
    display: flex;
    width: 100%;
    height: 100%;
    padding: var(--container-offset);
    pointer-events: none;
  }
  
  .panel {
    display: flex;
    flex-direction: column;
    max-width: 90%;
    max-height: 90%;
    /*
     * 토큰 폴백은 backdrop(--u-overlay-bg-color)과 동일 정책 — 테마 토큰 미정의
     * 소비자도 패널이 보이도록 CSS 시스템 컬러로 폴백. Canvas/CanvasText는 OS/UA
     * color-scheme 기준 라이트·다크 자동 적응(라이브러리 주입 테마와 별개).
     * 테두리는 CanvasText 원색이 과해 옅게 혼합.
     */
    border: 1px solid var(--u-border-color, color-mix(in srgb, CanvasText 20%, Canvas));
    border-radius: 6px;
    background: var(--u-panel-bg-color, Canvas);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    pointer-events: auto;
    opacity: 0;
    transform: scale(0.92);
    transition: opacity 0.3s ease, transform 0.3s ease;
  }
  :host([open]) .panel {
    opacity: 1;
    transform: scale(1);
  }

  .header {
    flex-shrink: 0;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 12px 16px;
    font-size: 18px;
    font-weight: 600;
    line-height: 1.3;
    border-bottom: 1px solid var(--u-border-color);
  }
  .header .close-btn {
    flex-shrink: 0;
    padding: 4px;
    font-size: inherit;
    border-radius: 4px;
  }

  .body {
    flex: 1 1 auto;
    min-height: 0;
    display: block;
    padding: 16px;
    overflow: auto;
  }

  ::slotted([slot="footer"]) {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding: 12px 16px;
    border-top: 1px solid var(--u-border-color);
  }
`;
