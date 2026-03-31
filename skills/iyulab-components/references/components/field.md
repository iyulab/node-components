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
