# Dialog (utility)

```ts
import { Dialog } from '@iyulab/components';
```

Programmatically open alert, confirm, and prompt dialogs without manually creating `u-dialog` elements.

## Usage

```ts
// Alert — await until dismissed
await Dialog.alert('Operation completed.');

// Confirm — returns true/false
const confirmed = await Dialog.confirm('Delete this item?');
if (confirmed) deleteItem();

// Prompt — returns entered string or null if cancelled
const name = await Dialog.prompt('Enter your name:', { defaultValue: 'Alice' });

// Custom dialog with action buttons
const result = await Dialog.show({
  title: 'Choose an option',
  content: 'Which plan do you want?',
  actions: [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro', variant: 'solid' }
  ]
});
// result = 'free' | 'pro' | null (if closed without selecting)
```

## API

| Method | Returns | Description |
|--------|---------|-------------|
| `Dialog.alert(message, options?)` | `Promise<void>` | Informational alert |
| `Dialog.confirm(message, options?)` | `Promise<boolean>` | Confirm / Cancel dialog |
| `Dialog.prompt(message, options?)` | `Promise<string \| null>` | Text input dialog |
| `Dialog.show(options)` | `Promise<string \| null>` | Custom dialog; resolves with clicked action `value` |

## Types

```ts
interface DialogOptions {
  target?: HTMLElement;      // shows contained instead of as an overlay when set
  title?: string;
  placement?: DialogPlacement;
  offset?: number;           // gap from the edge, px
  modal?: boolean;           // default: true
  buttonClose?: boolean;     // show an explicit close button — default: false
  escapeClose?: boolean;     // close on Esc — default: true
  backdropClose?: boolean;   // close on backdrop click — default: true
}

interface ConfirmDialogOptions extends DialogOptions {
  confirmLabel?: string;     // default: 'Confirm'
  cancelLabel?: string;      // default: 'Cancel'
}

interface PromptDialogOptions extends ConfirmDialogOptions {
  type?: InputType;          // input field type — default: 'text'
  defaultValue?: string;
  placeholder?: string;
}

interface CustomDialogOptions extends DialogOptions {
  content: string | TemplateResult;
  actions?: DialogAction[];
}

interface DialogAction {
  label: string;
  value: string;
  variant?: ButtonVariant;
}
```
