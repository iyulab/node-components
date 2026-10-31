import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/button/UButton.js';
import '../../src/components/icon-button/UIconButton.js';
import '../../src/components/copy-button/UCopyButton.js';
import '../../src/components/field/UField.js';
import '../../src/components/input/UInput.js';
import '../../src/components/textarea/UTextarea.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import '../../src/components/calendar/UCalendar.js';
import '../../src/components/checkbox/UCheckbox.js';
import '../../src/components/switch/USwitch.js';
import '../../src/components/radio/URadio.js';
import '../../src/components/rating/URating.js';
import '../../src/components/slider/USlider.js';
import '../../src/components/menu/UMenu.js';
import '../../src/components/menu-item/UMenuItem.js';
import '../../src/components/tree/UTree.js';
import '../../src/components/tree-item/UTreeItem.js';
import '../../src/components/tab-nav/UTabNav.js';
import '../../src/components/tab/UTab.js';
import '../../src/components/tab-panel/UTabPanel.js';
import '../../src/components/chip/UChip.js';
import '../../src/components/tag/UTag.js';
import '../../src/components/expander/UExpander.js';
import '../../src/components/alert/UAlert.js';
import '../../src/components/breadcrumb/UBreadcrumb.js';
import '../../src/components/breadcrumb-item/UBreadcrumbItem.js';
import '../../src/components/pagination/UPagination.js';
import '../../src/components/file-input/UFileInput.js';
import '../../src/components/carousel/UCarousel.js';
import '../../src/components/steps/USteps.js';
import { clickableNoise } from './clickable.js';

/**
 * A click-type listener on an element outside a handful of roles has NVDA announce «clickable» (measured — see
 * `clickable.ts`). Our own listeners belong on the shadow root (`listenInShadow`), and wrapper hosts are
 * presentational so an author's listener on them stays quiet too.
 */
describe('click-type listeners screen readers would announce as «clickable»', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('none on the rendered components or their hosts', async () => {
    const box = document.createElement('div');
    box.innerHTML = `
      <u-button>Save</u-button>
      <u-copy-button value="x"></u-copy-button>
      <u-field label="Name"><u-input></u-input></u-field>
      <u-input label="Secret" type="password" clearable value="a"></u-input>
      <u-input label="Count" type="number"></u-input>
      <u-textarea label="Note"></u-textarea>
      <u-select label="Pick"><u-option value="a">A</u-option><u-option value="b">B</u-option></u-select>
      <u-date-picker label="Day"></u-date-picker>
      <u-date-range-picker label="Span"></u-date-range-picker>
      <u-calendar></u-calendar>
      <u-checkbox>Agree</u-checkbox>
      <u-switch>Live</u-switch>
      <u-radio label="Size"><u-option value="s">S</u-option><u-option value="m">M</u-option></u-radio>
      <u-rating label="Score"></u-rating>
      <u-slider label="Level"></u-slider>
      <u-menu><u-menu-item>One</u-menu-item><u-menu-item>Two<u-menu-item slot="submenu">Sub</u-menu-item></u-menu-item></u-menu>
      <u-tree><u-tree-item>Root<u-tree-item>Leaf</u-tree-item></u-tree-item></u-tree>
      <u-tab-panel><u-tab slot="tab" value="a">A</u-tab><u-tab slot="tab" value="b" removable>B</u-tab></u-tab-panel>
      <u-chip removable>Chip</u-chip>
      <u-tag>Tag</u-tag>
      <u-expander heading="More">Body</u-expander>
      <u-alert closable>Heads up</u-alert>
      <u-breadcrumb><u-breadcrumb-item href="#a">A</u-breadcrumb-item><u-breadcrumb-item>B</u-breadcrumb-item></u-breadcrumb>
      <u-pagination total="5"></u-pagination>
      <u-file-input label="File"></u-file-input>
      <u-carousel><div>1</div><div>2</div></u-carousel>
      <u-steps><span>one</span><span>two</span></u-steps>
    `;
    document.body.appendChild(box);
    for (const el of box.querySelectorAll('*')) await (el as { updateComplete?: Promise<unknown> }).updateComplete;
    await new Promise((r) => setTimeout(r, 100));

    const noise = await clickableNoise(box);
    expect([...new Set(noise.map((n) => `${n.element} (${n.role}) ${n.types.join('+')}`))]).toEqual([]);
  }, 60_000);
});
