# u-steps

```ts
import '@iyulab/components/dist/components/steps/USteps.js';
```

**Tag:** `u-steps`

A display-only progress line — where a record stands in a fixed sequence of steps. Not a wizard:
moving to the next step is the consumer's own action, placed beside it. For several tracks
(fulfilment and billing, say), stack one `u-steps` per track and give each a `label`.

```html
<u-steps id="fulfilment" label="Fulfilment" current="1"></u-steps>
<script type="module">
  document.getElementById('fulfilment').items = [
    { label: 'Received', description: '10.02' },
    { label: 'Proof' },
    { label: 'Print' },
    { label: 'Ship' },
  ];
</script>

<!-- a blocked step -->
<u-steps label="Billing" .items=${[{ label: 'Invoice' }, { label: 'Paid', status: 'hold' }, { label: 'Closed' }]}></u-steps>
```

Status is told by marker shape as well as colour — complete = check, current = heavy ring,
hold = warning tint, upcoming = empty ring, skipped = dashed ring. Assistive tech hears the current step through
`aria-current="step"` and complete/hold/skipped through a hidden status word (`stepComplete`,
`stepOnHold`, `stepSkipped` locale keys). `skipped` is a step this record's route does not have — an order with no
proof still shows «Proof», passed over.

### Bars — `appearance="bars"`

Each step takes an equal column: a bar on top, the step's name and its description (a date) under it. The travelled
and current bars are filled, upcoming and skipped ones empty, a held step's bar is the warning colour; the current
step's name is bold. For a detail page's header, where seven steps each carry a date.

```html
<u-steps appearance="bars" current="3" .items=${[
  { label: 'Intake', description: '10/21' },
  { label: 'Proof', description: 'none', status: 'skipped' },
  { label: 'Check', description: '10/21' },
  { label: 'Plate', description: '10/21 · batch 50' },
  { label: 'Print' }, { label: 'Foil · pack' }, { label: 'Ship' },
]}></u-steps>
```

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `items` | `StepItem[]` | `[]` | — | `{ label, description?, status? }` (property only) |
| `current` | `number` | — | — | Index of the current step; steps without `status` before it are `complete`, after it `upcoming` |
| `label` | `string` | — | — | Track name shown at the start; also the list's accessible name |
| `appearance` | `'line'\|'bars'` | `'line'` | ✓ | `line` markers and connectors · `bars` a bar per step with the text under it |

`StepStatus` = `'complete' | 'current' | 'hold' | 'upcoming' | 'skipped'`. An item's own `status` wins over
the inference from `current`.

## CSS Parts

| Part | Description |
|------|-------------|
| `base` | Outer box |
| `label` | Track name |
| `list` | The `ol` |
| `step` | One step — also `step-complete`, `step-current`, `step-hold`, `step-upcoming` |
| `marker` | Ring / check |
| `title` | Step name |
| `description` | Step's secondary text |
| `connector` | Line between steps |

## CSS Custom Properties

| Property | Description |
|----------|-------------|
| `--steps-marker-size` | Marker diameter (default 18px) |
| `--steps-connector-color` | Connector not yet travelled |
| `--steps-connector-done-color` | Travelled connector and complete marker |
| `--steps-label-width` | Width of the track name (default 56px) |
| `--steps-bar-height` | Bar thickness with `bars` (default 6px) |
| `--steps-bar-color` | Filled bar colour with `bars` (default the primary colour) |
