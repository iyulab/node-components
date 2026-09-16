# u-field

```ts
import '@iyulab/components/dist/components/field/UField.js';
```

**Tag:** `u-field`

Layout wrapper for form controls. Renders label, required marker, description text, and validation message around any control.

```html
<u-field label="Email" required description="We'll never share your email.">
  <u-input type="email" name="email"></u-input>
</u-field>

<u-field label="Role" invalid validation-message="Please select a role.">
  <u-select name="role">
    <u-option value="admin">Admin</u-option>
  </u-select>
  <u-button slot="label-aside" variant="link">Learn more</u-button>
</u-field>
```

---

## Accessible name

`u-field` does more than draw the label — it **names the control you slot into it**. The label text
is copied onto the slotted element as `aria-label` (and `description` as `aria-description`), and
`u-*` form controls pass that through to the native control inside their shadow root.
`aria-labelledby` is not used: it does not cross shadow boundaries.

**Set the label in one place only.** If the slotted control already carries its own `label`,
`aria-label`, or `aria-labelledby`, the field leaves it alone — overriding it would make the visible
label and the accessible name disagree (WCAG SC 2.5.3 Label in Name). Setting `label` on *both*
renders the label twice; a development-mode console warning points at that spot.

```html
<!-- label on the field -->
<u-field label="Email"><u-input type="email" name="email"></u-input></u-field>

<!-- or on the control — not both -->
<u-input label="Email" type="email" name="email"></u-input>

<!-- native elements work the same way -->
<u-field label="Notes"><textarea name="notes"></textarea></u-field>
```

A `u-field` that has a `label` but nothing focusable in its default slot also warns: that label
names nothing.

All ten form controls take the field's label this way. Three of them get it slightly differently,
because their name normally comes from their own content:

| Control | How the field label reaches it |
|---------|-------------------------------|
| `u-checkbox`, `u-switch` | Only when they have no label text of their own (own `label`, or content in the default slot). Their own text always wins. |
| `u-file-input` | Composed into the trigger button's name as `"<button text>, <field label>"`, so the visible text stays part of the accessible name. |
| everything else | Directly, on the native control inside the shadow root. |

---

## Slots

| Name | Description |
|------|-------------|
| *(default)* | The form control to wrap |
| `label-aside` | Content placed to the right of the label |

## Properties

| Property | Type | Default | Reflect | Description |
|----------|------|---------|---------|-------------|
| `label` | `string` | — | — | Label text |
| `description` | `string` | — | — | Helper text shown below the control |
| `validationMessage` | `string` | — | — | Error message shown when `invalid` |
| `required` | `boolean` | `false` | ✓ | Show required marker |
| `invalid` | `boolean` | `false` | ✓ | Show validation error state |
| `disabled` | `boolean` | `false` | ✓ | Disable state forwarding |

## Methods

| Method | Description |
|--------|-------------|
| `focus(options?)` | Focus the first focusable slotted child |
