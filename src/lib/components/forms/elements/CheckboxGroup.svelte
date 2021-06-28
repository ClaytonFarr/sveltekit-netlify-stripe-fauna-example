<script>
	import { onMount } from 'svelte';
	import Errors from './Errors.svelte';

	const uid = Math.floor(Math.random() * 10000000);

	// Group Options
	// -------------------------------------------------------------------------------------------
	let thisGroup;
	export let groupLabel = null; // optional label header for input group
	export let options = [];
	// example content
	// options = [
	// 	{
	// 		label: 'Checkbox One',
	// 		checked: false,
	// 		indeterminate: null, // (https://tinyurl.com/inputindeterminate)
	// 		readonly: null,
	// 		disabled: false,
	// 		required: true,
	// 		value: 'one',
	// 		note: "I'm number one.",
	// 	},
	// 	{ label: 'Checkbox Two', value: 'two', note: 'I love number two.' },
	// 	// option must include label OR value
	// 	{ label: 'Checkbox Three' },
	// 	{ value: 'four' },
	// ];
	export let group = []; // selected items
	export let name = `checkboxgroup-${uid}`;
	export let tabindex = null;
	export let autofocus = null; // boolean, **use thoughtfully** (https://tinyurl.com/inputautofocus)

	// Input Options
	// -------------------------------------------------------------------------------------------
	let thisInput = [];

	// Input Style Options – applies to all inputs in group
	// -------------------------------------------------------------------------------------------
	export let containerClasses = '';
	export let inputClasses = '';
	export let inheritFontSize = false;
	export let displayAsRow = true; // toggles horizontal or vertical display of options
	export let rounded = true;
	export let border = true;
	export let bgFill = !border ? true : false;
	export let shadow = true; // won't be applied, irrespective of value, if border is false

	// Label & Description Options – applies to all inputs in group
	// -------------------------------------------------------------------------------------------
	// optional label and note for each input are passed in through 'options' array
	export let labelHidden = false;
	export let labelWeightNormal = true; // toggles weight from default 'medium' to 'normal'
	export let optionLabelRight = true; // toggles which side of checkbox input is displayed on
	export let showRequiredHint = true; // toggles display of asterisk next to label for required fields

	// Standard Validation Options – applies to all inputs in group
	// -------------------------------------------------------------------------------------------
	// optional 'required' validation passed in through 'options' array
	export let validateOnMount = false; // if true, will validate input and show any errors when component is mounted

	let errors = [];
	let warnings = [];

	// Handlers
	// -------------------------------------------------------------------------------------------
	function autoFocusFirstChildInput(node) {
		const input = node.querySelector('input');
		input.focus();
	}

	function checkValidity(input, i) {
		// clear & re-check for current errors or warnings
		errors[i] = [];
		warnings[i] = [];
		input.checkValidity(); // will fire 'invalid' event if any of standard constraints fail
	}

	onMount(() => {
		if (autofocus) autoFocusFirstChildInput(thisGroup);
		if (validateOnMount) {
			const inputs = Array.from(thisGroup.querySelectorAll('input'));
			inputs.forEach(input => input.checkValidity());
		}
	});

	function invalidHandler(input, i) {
		// Standard Validation Messages
		if (input.validity.valueMissing) errors[i] = ['This is required.'];
	}
</script>

<div class={groupLabel ? 'space-y-4' : null} bind:this={thisGroup} {...$$restProps}>
	{#if groupLabel}
		<p class="font-medium">{groupLabel}</p>
	{/if}
	<div class="flex {displayAsRow ? 'space-x-6' : 'flex-col space-y-4 items-start'}">
		{#each options as checkbox, i}
			<div class="optionInputBlock {containerClasses}" class:optionLabelRight>
				{#if checkbox.label}
					<label
						for="{name}-{i + 1}"
						id="{name}-{i + 1}-label"
						class:hide={labelHidden}
						class="block text-gray-700 {labelWeightNormal ? 'font-normal' : 'font-medium'}"
					>
						{checkbox.label}
						{#if checkbox.required && showRequiredHint}
							<abbr title="Required" class="font-normal text-gray-500">*</abbr>
						{/if}
					</label>
				{/if}
				<input
					bind:this={thisInput[i]}
					type="checkbox"
					{name}
					id="{name}-{i + 1}"
					{tabindex}
					value={checkbox.value ? checkbox.value : checkbox.label ? checkbox.label : null}
					bind:group
					checked={checkbox.checked ? checkbox.checked : null}
					indeterminate={checkbox.indeterminate ? checkbox.indeterminate : null}
					disabled={checkbox.disabled ? checkbox.disabled : null}
					readonly={checkbox.readonly ? checkbox.readonly : null}
					required={checkbox.required ? checkbox.required : null}
					class:inheritFontSize
					class:addRounding={rounded}
					class:addBg={bgFill}
					class:addBorder={border}
					class:addShadow={shadow && border}
					class:hasWarning={warnings[i] && warnings[i].length !== 0}
					class:hasError={errors[i] && errors[i].length !== 0}
					class="{inputClasses} {!checkbox.label ? 'mt-1' : null}"
					aria-required={checkbox.required ? checkbox.required : null}
					aria-disabled={checkbox.disabled ? checkbox.disabled : null}
					aria-labelledby={checkbox.label ? `${name}-${i + 1}-label` : null}
					aria-describedby={checkbox.note ? `${name}-${i + 1}-description` : null}
					aria-invalid={errors.length !== 0 ? true : null}
					on:input={checkValidity(thisInput[i], i)}
					on:blur={checkValidity(thisInput[i], i)}
					on:invalid={invalidHandler(thisInput[i], i)}
				/>
				<!-- using 'add' class names (e.g. 'addShadow') to avoid collisions with Tailwind class names -->
				{#if checkbox.note}
					<p id="{name}-{i + 1}-description" class="description-block">{checkbox.note}</p>
				{/if}
				{#if errors[i]?.length || warnings[i]?.length}
					<div class="error-block">
						<Errors {errors} {warnings} />
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.hide {
		@apply sr-only;
	}

	input {
		@apply w-4 h-4 border border-transparent text-action focus_ring-action-hover;
	}
	input.addRounding {
		@apply rounded;
	}
	input.addBg:not(.addBorder):not(:checked) {
		@apply bg-gray-200;
	}
	input.addBg.addBorder:not(:checked) {
		@apply bg-gray-100;
	}
	input.leftPadding {
		@apply px-3;
	}
	input:not(.inheritFontSize) {
		@apply text-sm;
	}
	input.addBorder {
		@apply border-gray-300;
	}
	input:not([readonly], [disabled]) {
		@apply focus_ring-action-hover focus_border-action-hover;
	}
	input[readonly] {
		@apply bg-transparent focus_ring-transparent focus_border-transparent cursor-default pointer-events-none;
	}
	input.addShadow:not([readonly], [disabled]) {
		@apply shadow-sm;
	}

	/* Can enable input styles for warning state if wanted, but since these are 
	   optional UX is preferrable to reserve added visual weight for errors alone

	input.hasWarning:not([disabled]) {
		@apply focus_ring-yellow-500 focus_border-yellow-500;
	}
	input.addBorder.hasWarning:not([disabled]) {
		@apply border-yellow-500;
	} */

	input.hasError:not([disabled]) {
		@apply focus_ring-red-500 focus_border-red-500;
	}
	input.addBorder.hasError:not([disabled]) {
		@apply border-red-500;
	}

	/* additional helpful psuedo classes that can be styled
	https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#ui_pseudo-classes
	input:required {}
	input:optional {}
	input:user-invalid {}
	 */

	input[disabled],
	input[readonly] {
		@apply opacity-60;
	}
	input.addBorder[disabled] {
		@apply border-opacity-40;
	}
	input.addShadow[disabled] {
		@apply shadow-none;
	}

	.optionInputBlock {
		@apply inline-grid gap-x-3 gap-y-1;
		grid-template-columns: auto auto;
		align-content: baseline;
	}
	input {
		align-self: center;
	}
	.error-block {
		grid-column-start: 1;
	}
	.optionLabelRight label {
		grid-column-start: 2;
	}
	.optionLabelRight input {
		grid-column-start: 1;
		grid-row-start: 1;
	}
	.optionLabelRight .description-block {
		grid-column-start: 2;
	}
	.optionLabelRight .error-block {
		grid-column-start: 2;
	}

	.description-block {
		@apply text-xs text-gray-500;
	}
</style>
