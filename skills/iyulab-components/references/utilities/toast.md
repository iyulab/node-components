# Toast

```ts
import { Toast } from '@iyulab/components';
```

Programmatically display toast notifications. Creates `u-alert` elements dynamically and mounts them in a toast container.

## Usage

```ts
// Shorthand methods
Toast.success('File saved.');
Toast.error('Upload failed.', { duration: 5000 });
Toast.warning('Low disk space.', { closable: true });
Toast.info('Update available.');
Toast.notice('New message received.', { position: 'bottom-right' });
Toast.message('Hello!', { title: 'Greetings' });

// Full control
await Toast.show('success', 'Custom message', {
  title: 'Done',
  position: 'top-center',
  duration: 3000,
  variant: 'outlined',
  closable: true
});
```

## API

| Method | Description |
|--------|-------------|
| `Toast.message(content, options?)` | Plain message (no status icon) |
| `Toast.notice(content, options?)` | Notice toast |
| `Toast.info(content, options?)` | Info toast |
| `Toast.success(content, options?)` | Success toast |
| `Toast.warning(content, options?)` | Warning toast |
| `Toast.error(content, options?)` | Error toast |
| `Toast.show(status?, content?, options?)` | Generic toast with custom options |

## ToastOptions

```ts
interface ToastOptions {
  target?: HTMLElement;       // mount point (default: document.body)
  variant?: AlertVariant;     // 'solid' | 'filled' | 'outlined' | 'glass'
  title?: string;             // Optional title override
  position?: ToastPosition;
  duration?: number;          // Auto-dismiss ms (0 = no auto-dismiss)
  closable?: boolean;
}

type ToastPosition =
  | 'top-left'    | 'top-center'    | 'top-right'
  | 'middle-left' | 'middle-center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right';
```
