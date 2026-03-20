## u-menu
- props
	- selection: 'none' | 'single' | 'multiple'
	- indicator: 'highlight' | 'check'
	- align: 'left' | 'center' | 'right'
	- loop(keyboard): boolean

## u-dropdown-menu: UFloatingElement(trigger: 'click', 'focus', dismiss: 'click', 'focus-out', 'esc')
- props
	- selection: 'none' | 'single' | 'multiple'
	- selectionAppearance: 'highlight' | 'checkmark'
	- align: 'left' | 'center' | 'right'
	- loop(keyboard): boolean

- css
    - maxheight

## u-context-menu: UFloatingElement(trigger: 'click', dismiss: 'click', esc')
- props
	- selection: 'none' | 'single' | 'multiple'
	- indicator: 'highlight' | 'check'
	- align: 'left' | 'center' | 'right'
	- loop(keyboard): boolean

- css
    - maxheight

## u-menu-item
- props
	- expanded: boolean
	- disabled: boolean
	- selected: boolean
	- indicator: 'highlight' | 'check' (state?)
	- align: 'left' | 'center' | 'right'
	- value: string

- slot: prefix, suffix, children

- 

## example
<u-menu>
	<u-menu-item>
		Menu1
		<u-menu-item></u-menu-item>
		<u-menu-item></u-menu-item>
		<u-menu-item></u-menu-item>
	</u-menu-item>
	<u-menu-item>Menu2</u-menu-item>
	<u-menu-item>Menu3</u-menu-item>
	<u-menu>
		<u-menu-item>Menu2-1</u-menu-item>
		<u-menu-item>Menu2-2</u-menu-item>
	</u-menu>
</u-menu>

<u-dropdown-menu for="u-button">
	<u-menu-item>
		Menu1
		<u-menu-item></u-menu-item>
		<u-menu-item></u-menu-item>
		<u-menu-item></u-menu-item>
	</u-menu-item>
	<u-menu-item>Menu2</u-menu-item>
	<u-menu-item>Menu3</u-menu-item>
	<u-menu>
		<u-menu-item>Menu2-1</u-menu-item>
		<u-menu-item>Menu2-2</u-menu-item>
	</u-menu>
</u-dropdown-menu>

<u-context-menu for="u-panel">
	<u-menu-item>
		Menu1
		<u-menu-item></u-menu-item>
		<u-menu-item></u-menu-item>
		<u-menu-item></u-menu-item>
	</u-menu-item>
	<u-menu-item>Menu2</u-menu-item>
	<u-menu-item>Menu3</u-menu-item>
	<u-menu>
		<u-menu-item>Menu2-1</u-menu-item>
		<u-menu-item>Menu2-2</u-menu-item>
	</u-menu>
</u-context-menu>

---