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
hold = warning tint, upcoming = empty ring. Assistive tech hears the current step through
`aria-current="step"` and complete/hold through a hidden status word (`stepComplete`,
`stepOnHold` locale keys).

---

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `items` | `StepItem[]` | `[]` | — | `{ label, description?, status? }` (property only) |
| `current` | `number` | — | — | Index of the current step; steps without `status` before it are `complete`, after it `upcoming` |
| `label` | `string` | — | — | Track name shown at the start; also the list's accessible name |

`StepStatus` = `'complete' | 'current' | 'hold' | 'upcoming'`. An item's own `status` wins over
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
