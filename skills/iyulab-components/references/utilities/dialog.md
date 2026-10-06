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

// Confirming something that cannot be undone — the confirm button is drawn in `danger`
const ok = await Dialog.confirm('Cancel order G-2026-0512? This cannot be undone.', {
  confirmLabel: 'Cancel order', cancelLabel: 'Keep order', confirmColor: 'danger',
});

// Prompt — returns entered string or null if cancelled
const name = await Dialog.prompt('Enter your name:', { defaultValue: 'Alice' });

// Custom dialog with action buttons
const result = await Dialog.show({
  title: 'Choose an option',
  content: 'Which plan do you want?',
  actions: [
    { label: 'Free', value: 'free' },
    { label: 'Pro', value: 'pro', appearance: 'solid' }
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

`message` is **text**: a string is rendered as text in `alert`, `confirm` and `prompt`, so a user-supplied name in a
confirmation cannot inject markup. For formatting pass a Lit `TemplateResult`
(`Dialog.confirm(html\`Delete <strong>${name}</strong>?\`)` — interpolated values stay text). Only
`Dialog.show({ content })` takes an HTML string, and says so.

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
  confirmLabel?: string;     // default: the active locale's `confirm` (en: 'Confirm')
  cancelLabel?: string;      // default: the active locale's `cancel` (en: 'Cancel')
  confirmColor?: ButtonColor; // e.g. 'danger' for an irreversible action — default: the button's default
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
  appearance?: ButtonAppearance; // default: 'solid'
  color?: ButtonColor;
}
```
