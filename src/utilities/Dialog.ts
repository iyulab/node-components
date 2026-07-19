import { html, nothing, render, type TemplateResult } from 'lit';
import '../components/button/UButton.js';
import '../components/input/UInput.js';

import { UDialog } from '../components/dialog/UDialog.js';
import type { DialogPlacement } from '../components/dialog/UDialog.js';
import type { ButtonVariant } from '../components/button/UButton.js';
import type { CloseOnPolicy } from '../components/UOverlayElement.js';
import type { UInput, InputType } from '../components/input/UInput.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';

/** 공통 Dialog 옵션 */
export interface DialogOptions {
  /** 다이얼로그를 표시할 대상 엘리먼트, 지정 시 contained 모드로 동작 */
  target?: HTMLElement;
  /** 헤더 제목 */
  title?: string;
  /** 배치 위치 */
  placement?: DialogPlacement;
  /** 가장자리로부터의 간격 (px) */
  offset?: number;
  /** 모달 모드 여부 (기본: true) */
  modal?: boolean;
  /** 닫기 버튼 표시 여부 (기본: false) */
  buttonClose?: boolean;
  /** ESC 키로 닫기 허용 (기본: true) */
  escapeClose?: boolean;
  /** 백드롭 클릭으로 닫기 허용 (기본: true) */
  backdropClose?: boolean;
}

/** Confirm Dialog 옵션 */
export interface ConfirmDialogOptions extends DialogOptions {
  /** 확인 버튼 텍스트 (기본: 'Confirm') */
  confirmLabel?: string;
  /** 취소 버튼 텍스트 (기본: 'Cancel') */
  cancelLabel?: string;
}

/** Prompt Dialog 옵션 */
export interface PromptDialogOptions extends ConfirmDialogOptions {
  /** 입력 필드 type */
  type?: string;
  /** 입력 필드 기본값 */
  defaultValue?: string;
  /** 입력 필드 placeholder */
  placeholder?: string;
}

/** Custom Dialog 옵션 */
export interface CustomDialogOptions extends DialogOptions {
  /** 본문 콘텐츠 (HTML 문자열 또는 TemplateResult) */
  content: string | TemplateResult;
  /** 액션 버튼 목록 */
  actions?: DialogAction[];
}

/** Custom Dialog 버튼 정의 */
export interface DialogAction {
  /** 버튼 텍스트 */
  label: string;
  /** 반환될 값 */
  value: string;
  /** 버튼 스타일 */
  variant?: ButtonVariant;
}

/**
 * Dialog 유틸리티 클래스입니다.
 * 프로그래밍 방식으로 alert, confirm, prompt 다이얼로그를 표시합니다.
 */
export class Dialog {
  /** 개별 인스턴스 생성을 방지합니다. */
  private constructor() {}

  /**
   * 알림 다이얼로그를 표시합니다.
   */
  public static async alert(message: string, options?: DialogOptions): Promise<void> {
    await this.show({
      ...options,
      content: message
    });
  }

  /**
   * 확인 다이얼로그를 표시합니다. (확인/취소 버튼)
   * @returns 확인이면 true, 취소이면 false
   */
  public static async confirm(message: string, options?: ConfirmDialogOptions): Promise<boolean> {
    const result = await this.show({
      ...options,
      content: message,
      actions: [
        { label: options?.cancelLabel || 'Cancel', value: 'cancel', variant: 'outlined' },
        { label: options?.confirmLabel || 'Confirm', value: 'confirm' },
      ],
    });
    return result === 'confirm';
  }

  /**
   * 입력 다이얼로그를 표시합니다. (텍스트 입력 + 확인/취소)
   * @returns 입력값 또는 취소 시 null
   */
  public static async prompt(message: string, options?: PromptDialogOptions): Promise<string | null> {
    let inputValue = options?.defaultValue || '';

    const result = await this.show({
      ...options,
      content: html`
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div>${message}</div>
          <u-input
            type=${(options?.type || 'text') as InputType}
            placeholder=${options?.placeholder || ''}
            .value=${inputValue}
            @input=${(e: InputEvent) => { 
              const input = e.target as UInput;
              inputValue = input.value || '';
            }}
            @keydown=${(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                const input = e.target as UInput;
                inputValue = input.value || '';
                const dialog = input.closest('u-dialog') as UDialog;
                const buttons = dialog.querySelectorAll('u-button');
                (buttons[buttons.length - 1] as HTMLElement).click();
              }
            }}
          ></u-input>
        </div>
      `,
      actions: [
        { label: options?.cancelLabel || 'Cancel', value: 'cancel', variant: 'outlined' },
        { label: options?.confirmLabel || 'Confirm', value: 'confirm' },
      ],
    });
    return result === 'confirm' ? inputValue : null;
  }

  /**
   * 커스텀 다이얼로그를 표시합니다.
   * @returns 클릭된 액션의 value 또는 닫힌 경우 null
   */
  public static async show(options: CustomDialogOptions): Promise<string | null> {
    let closeValue: string | null = null;

    const dialog = this.createDialog(options);
    const content = typeof options.content === 'string' ? unsafeHTML(options.content) : options.content;
    const actions = options.actions && options.actions.length > 0 ? options.actions : null;

    render(html`
      <div style="min-width: 320px; font-size: 14px; line-height: 1.6;">
        ${content}
        ${actions ? html`
          <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;">
            ${actions.map(action => html`
              <u-button
                variant=${action.variant || 'solid'}
                @click=${() => { closeValue = action.value; dialog.hide(); }}
              >${action.label}</u-button>
            `)}
          </div>
        ` : nothing}
      </div>
    `, dialog);

    const target = options.target || document.body;
    target.appendChild(dialog);

    // hide 리스너는 show() 이전에 등록한다. updateComplete 대기 중에 발생한
    // hide(예: closeOn 정책이 즉시 닫는 경우)를 놓치지 않기 위함이다.
    const closed = new Promise<string | null>((resolve) => {
      // 자식 컴포넌트가 올린 hide 는 무시한다.
      dialog.addEventListener('hide', (e: Event) => {
        if (e.target !== dialog) return;
        setTimeout(() => dialog.remove(), 300);
        resolve(closeValue);
      });
    });

    try {
      await dialog.updateComplete;
    } catch (error) {
      // 업데이트가 실패하면 다이얼로그를 띄울 수 없다. 여기서 매달리지 않고
      // "닫힘 = null" 규약대로 종료한다(과거에는 async executor 가 예외를
      // 삼켜 호출자가 영원히 대기했다).
      console.error('[Dialog] 다이얼로그를 표시하지 못했습니다.', error);
      dialog.remove();
      return null;
    }

    dialog.show();
    return closed;
  }

  /** 다이얼로그 엘리먼트를 생성하고 옵션을 적용합니다. */
  private static createDialog(options?: DialogOptions): UDialog {
    const dialog = new UDialog();
    dialog.placement = options?.placement || 'center';
    dialog.closable = options?.buttonClose === true;
    dialog.mode = options?.modal !== false ? 'modal' : 'non-modal';

    // target 지정 시 contained 모드
    if (options?.target) {
      dialog.contained = true;
    }

    // offset 설정
    if (options?.offset != null) {
      dialog.offset = options.offset;
    }

    // closeOn 정책 설정
    const closeOn: CloseOnPolicy[] = [];
    if (dialog.closable) closeOn.push('button');
    if (options?.escapeClose !== false) closeOn.push('escape');
    if (options?.backdropClose !== false) closeOn.push('backdrop');
    dialog.closeOn = closeOn;

    // 헤더 타이틀 설정
    if (options?.title) {
      const header = document.createElement('span');
      header.slot = 'header';
      header.textContent = options.title;
      dialog.prepend(header);
    }

    return dialog;
  }
}
