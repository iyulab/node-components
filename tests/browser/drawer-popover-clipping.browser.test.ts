import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/drawer/UDrawer.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/menu/UMenu.js';
import '../../src/components/menu-item/UMenuItem.js';

/**
 * A dropdown inside an overflow ancestor (a drawer body) must not clip at the ancestor's edge.
 *
 * A drawer's main use is holding a form, and forms contain selects — the **most common
 * combination** — and it's two components within the same library interacting, so it isn't
 * something a consumer should have to solve.
 *
 * The escape mechanism is `strategy="fixed"` (`UFloatingElement`). Even while `UDrawer`'s
 * panel is open it keeps `transform: translateY(0)` (an identity matrix as a computed
 * value), which could make it a containing block — but measurement shows clipping doesn't
 * actually happen, and that fact is pinned here.
 */
describe('popover clipping inside an overflow ancestor', () => {
  beforeEach(async () => {
    document.body.innerHTML = '';
    window.scrollTo(0, 0);
    // scroll events arrive asynchronously, late — wait for it to drain so scroll from a
    // prior test doesn't close the next test's popover.
    await new Promise(r => setTimeout(r, 120));
  });

  /** A low bottom drawer + a long option list → a layout where the dropdown has no choice but to spill outside the drawer */
  async function openSelectInDrawer(strategy?: string) {
    const drawer = document.createElement('u-drawer') as HTMLElement & {
      open: boolean; updateComplete: Promise<unknown>;
    };
    drawer.setAttribute('placement', 'bottom');
    drawer.style.setProperty('--drawer-size', '180px');

    const select = document.createElement('u-select') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    for (let i = 0; i < 14; i++) {
      const opt = document.createElement('u-option');
      opt.setAttribute('value', String(i));
      opt.textContent = `Option ${i}`;
      select.appendChild(opt);
    }
    drawer.appendChild(select);
    document.body.appendChild(drawer);

    drawer.open = true;
    await drawer.updateComplete;
    await new Promise(r => setTimeout(r, 450));   // wait for the slide transition to finish

    const popover = select.shadowRoot!.querySelector('u-popover') as HTMLElement;
    if (strategy) popover.setAttribute('strategy', strategy);

    select.shadowRoot!.querySelector<HTMLElement>('[part="container"]')?.click();
    await select.updateComplete;
    await new Promise(r => setTimeout(r, 250));

    const drawerBody = drawer.shadowRoot!.querySelector('.body') as HTMLElement;
    return { popover, drawerBody };
  }

  it('the dropdown renders even outside the drawer body\'s boundary', async () => {
    const { popover, drawerBody } = await openSelectInDrawer();

    const pop = popover.getBoundingClientRect();
    const body = drawerBody.getBoundingClientRect();
    expect(pop.height, 'the dropdown must have rendered').toBeGreaterThan(0);
    expect(pop.top, 'in this layout the dropdown must overflow above the drawer for the check to mean anything')
      .toBeLessThan(body.top - 50);

    // hit-test a point **outside** (above) the drawer body.
    // if the ancestor clips, nothing is painted there and a different element gets hit.
    const x = pop.left + pop.width / 2;
    const y = pop.top + 20;
    const hit = document.elementFromPoint(x, y);

    expect(y, 'the probe point must be outside the drawer body').toBeLessThan(body.top);
    expect(
      hit?.closest('u-option, u-popover') != null,
      `the dropdown wasn't hit at the point outside the drawer (${Math.round(x)},${Math.round(y)}) ` +
      `— elementFromPoint=${hit?.tagName}`,
    ).toBe(true);
  });

  // negative control: confirms the check above actually catches clipping.
  // reverting to strategy="absolute" traps the popover inside the overflow ancestor, invisible outside it.
  it('reverting to strategy="absolute" clips the same point (validates the check)', async () => {
    const { popover, drawerBody } = await openSelectInDrawer('absolute');

    const pop = popover.getBoundingClientRect();
    const body = drawerBody.getBoundingClientRect();
    const x = pop.left + pop.width / 2;
    const y = Math.min(pop.top + 20, body.top - 20);
    const hit = document.elementFromPoint(x, y);

    expect(hit?.closest('u-option, u-popover') == null).toBe(true);
  });

  it('u-menu-item\'s submenu popover also floats with fixed', async () => {
    // confirms it uses the same escape mechanism as select/input — if the submenu alone
    // stayed absolute, the same clipping would reproduce for a nested menu inside a scroll container.
    //
    // The popover branch only renders when `inline=false` (an inline-mode submenu is just a
    // div, with no need to escape overflow). u-menu propagates inline to children, so it's nested inside one.
    const menu = document.createElement('u-menu') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    const item = document.createElement('u-menu-item') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    const child = document.createElement('u-menu-item');
    child.setAttribute('slot', 'children');
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await menu.updateComplete;
    await item.updateComplete;
    await new Promise(r => setTimeout(r, 50));   // re-render after inline propagates

    const popover = item.shadowRoot!.querySelector('u-popover');
    expect(popover, 'with inline=false, the submenu must render as a popover').toBeTruthy();
    expect(popover!.getAttribute('strategy')).toBe('fixed');
  });
});
