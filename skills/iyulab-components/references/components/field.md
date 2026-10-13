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
  <u-button slot="label-aside" appearance="link">Learn more</u-button>
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

**A label over several controls, or over one that names itself, names the group.** With two or more
controls slotted (a row of choice buttons), or a single button, link, checkbox, switch or radio that
has its own text, the field becomes a `group` named by the label (and described by `description`);
each control keeps its own name — "Theme" over "Light · Dark" reads as the group *Theme* with the
buttons *Light* and *Dark*, not a first button called *Theme*.

```html
<!-- label on the field -->
<u-field label="Email"><u-input type="email" name="email"></u-input></u-field>

<!-- or on the control — not both -->
<u-input label="Email" type="email" name="email"></u-input>

<!-- native elements work the same way -->
<u-field label="Notes"><textarea name="notes"></textarea></u-field>
```

A `u-field` that has a `label` but no form control in its default slot also warns: that label names
nothing. "Form control" here is a question about **structure**, not about what is on screen — a
form-associated custom element, a native form or focusable tag, `tabindex`, or `contenteditable`.
A field that is `disabled`, or rendered inside a container that is currently hidden (a closed
drawer, an inactive tab panel, a wizard step that is not current), is still correctly built and does
not warn. The control may sit inside a wrapper element; it does not have to be the slot's direct
child.

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
| `description` | `string` | — | — | Helper text — below the control, or in a tooltip beside the label (see `descriptionDisplay`) |
| `descriptionDisplay` | `'inline' \| 'hint'` | — | — | Where the description shows: `inline` (under the control) or `hint` (info icon beside the label, text on hover). Unset follows `UField.descriptionDisplay` |
| `validationMessage` | `string` | — | — | Error message shown when `invalid` |
| `required` | `boolean` | `false` | ✓ | Show the required marker and make the slotted control required (a single control — with several controls the field only shows the marker). Turning it off removes only the `required` the field set |
| `invalid` | `boolean` | `false` | ✓ | Show validation error state |
| `disabled` | `boolean` | `false` | ✓ | Disable state forwarding |

## App-wide description display

```ts
import { UField } from '@iyulab/components';

UField.descriptionDisplay = 'hint';   // once, before the first render — default 'inline'
```

Sets where every field shows its description, including the fields that `u-input`, `u-select` and the other controls
render inside their own shadow roots. A field's own `description-display` wins. In `hint` mode a validation message
still shows under the control, the control keeps the text as `aria-description`, and a field without a label shows the
description inline (there is no label to put the icon beside).

The hint opens three ways — hovering the icon, entering the field's control from the keyboard (Tab, or a programmatic
`focus()`; a click into the control does not, the mouse has hover), and tapping the icon (touch has no hover; the tap
pins it until a tap elsewhere or a second tap). Escape closes it, and so does focus leaving the field. The icon itself
is not a Tab stop — a form of dozens of fields would otherwise double its Tabs.

## CSS Parts

| Part | Description |
|------|-------------|
| `hint` | The info icon beside the label (`description-display="hint"`) |
| `hint-tooltip` | The tooltip that holds the description |

## Methods

| Method | Description |
|--------|-------------|
| `focus(options?)` | Focus the first focusable slotted child |
