<script>
	import { onMount } from 'svelte';
	import Errors from './Errors.svelte';

	// Select Options
	// -------------------------------------------------------------------------------------------
	let thisSelect;
	const uid = Math.floor(Math.random() * 10000000);
	export let name = `select-${uid}`;
	export let id = `${name}-${uid}`;
	export let tabindex = null;
	export let options = ['One', 'Two', 'Three'];
	export let selected = null;
	export let multiple = false;
	export let size = 0;
	export let defaultToNullValue = !selected && !multiple ? true : false;
	export let nullValueText = 'Select';
	export let disabled = null;
	export let autofocus = null; // boolean, **use thoughtfully** (https://tinyurl.com/inputautofocus)
	export let autocomplete = null;

	// Select Style Options
	// -------------------------------------------------------------------------------------------
	export let containerClasses = '';
	export let selectClasses = '';
	export let inheritFontSize = false;
	export let width = 'full'; // resets to auto if use any keyword other than 'full'
	export let leftPadding = true;
	export let rounded = true;
	export let border = true;
	export let bgFill = !border ? true : false;
	export let shadow = true; // won't be applied, irrespective of value, if border is false

	if (width === 'full') containerClasses += ` flex flex-col`;
	if (width === 'full') selectClasses += ` block w-full`;

	// Label & Description Options
	// -------------------------------------------------------------------------------------------
	export let label = null;
	export let labelHidden = false;
	export let showRequiredHint = true; // toggles display of asterisk next to label for required fields
	export let note = null;

	// Standard Validation Options
	// -------------------------------------------------------------------------------------------
	// By default, validation and display of error messages will occur after user interacts
	// with select first time; can optionally be set to validate on page load
	export let validateOnMount = false; // if true, will validate select and show any errors when component is mounted
	export let required = false;

	let errors = [];
	let warnings = [];

	// Optional Custom Validation Options
	// -------------------------------------------------------------------------------------------
	// - expects an object with 'errors' and/or 'warnings' arrays of rules (as objects)
	// - first property 'pattern' is regex to evaluate textarea's value against
	// - second property 'messageIfMatch' is a boolean that determines if message is displayed when pattern matches or misses
	// - third property 'message' is error message displayed when pattern & messageIfMatch align
	// - if multiple errors exists they will be displayed one at a time, in the order added to the arrays
	// - if errors and warnings are both present, errors will be shown first
	export let customValidation = {};
	// example
	// customValidation = {
	// 	errors: [
	// 		{
	// 			pattern: 'One',
	// 			messageIfMatch: true,
	// 			message: "Believe us - it's lonely at the top.",
	// 		},
	// 	],
	// 	warnings: [
	// 		{
	// 			pattern: 'Two',
	// 			messageIfMatch: true,
	// 			message: 'Number two? Bold choice.',
	// 		},
	// 	],
	// };

	// Handlers
	// -------------------------------------------------------------------------------------------
	function checkValidity() {
		// clear & re-check for current errors or warnings
		errors = [];
		warnings = [];
		thisSelect.checkValidity(); // will fire 'invalid' event if any of standard constraints fail
		if (customValidation?.errors?.length || customValidation?.warnings?.length) {
			checkCustomValidation(); // will test custom rules and populate any related errors/warnings
		}
	}

	function checkCustomValidation() {
		customValidation?.errors?.forEach((rule) => {
			const { pattern, messageIfMatch, message } = rule;
			const regex = new RegExp(pattern, 'g');
			const validity = regex.test(selected); // 'selected' is Svelte variable for current value
			if ((validity && messageIfMatch) || (!validity && !messageIfMatch)) errors.push(message);
		});
		customValidation?.warnings?.forEach((rule) => {
			const { pattern, messageIfMatch, message } = rule;
			const regex = new RegExp(pattern, 'g');
			const validity = regex.test(selected);
			if ((validity && messageIfMatch) || (!validity && !messageIfMatch)) warnings.push(message);
		});
	}

	onMount(() => {
		if (validateOnMount) checkValidity();
	});

	function inputHandler(e) {
		const currentlySelected = e.target.selectedOptions;
		selected = [...currentlySelected].map(option => option.value);
		checkValidity();
	}

	function invalidHandler() {
		// Standard Validation Messages
		if (thisSelect.validity.valueMissing) errors = ['This field is required.'];
	}
</script>

<div class={containerClasses}>
	{#if label}
		<label
			for={id}
			id="{id}-label"
			class:required
			class:hide={labelHidden}
			class="block font-medium text-gray-700 mb-3"
		>
			{label}
			{#if required && showRequiredHint}
				<abbr title="Required" class="font-normal text-gray-500">*</abbr>
			{/if}
		</label>
	{/if}
	<!-- svelte-ignore a11y-autofocus -->
	<select
		bind:this='{thisSelect}'
		{name}
		{id}
		{tabindex}
		{disabled}
		{autofocus}
		{autocomplete}
		{multiple}
		{size}
		{required}
		value={selected}
		class:inheritFontSize
		class:leftPadding
		class:addRounding={rounded}
		class:addBorder={border}
		class:addBg={bgFill}
		class:addShadow={shadow}
		class:hasWarning={warnings.length !== 0}
		class:hasError={errors.length !== 0}
		class={selectClasses}
		aria-required={required ? true : null}
		aria-disabled={disabled ? true : null}
		aria-labelledby={label ? `${id}-label` : null}
		aria-describedby={note ? `${id}-description` : null}
		aria-invalid={errors.length !== 0 ? true : null}
		on:input={inputHandler}
		on:blur={inputHandler}
		on:invalid={invalidHandler}
	>
		<!-- using 'add' class names (e.g. 'addShadow') to avoid collisions with Tailwind class names -->
		{#if defaultToNullValue && !multiple}
			{#if nullValueText}
				<option value disabled selected>{nullValueText}</option>
				{:else}
				<option value disabled selected></option>
			{/if}
		{/if}
		{#each options as option}
			<option value={option}>{option}</option>
		{/each}
	</select>
	{#if note}
		<p id="{id}-description" class="description-block">{note}</p>
	{/if}
	{#if errors?.length || warnings?.length}
		<div class="error-block">
			<Errors {errors} {warnings} />
		</div>
	{/if}
</div>

<style>
	.hide {
		@apply sr-only;
	}

	select {
		@apply pr-10 py-2 text-gray-700 border border-transparent focus_outline-none focus_ring-action-hover focus_border-action-hover;
	}
	select:not(.inheritFontSize) {
		@apply text-sm;
	}
	select.addRounding {
		@apply rounded-md;
	}
	select.leftPadding {
		@apply pl-3;
	}
	select.addBg {
		@apply bg-gray-100 focus_bg-transparent;
	}
	select.addBorder {
		@apply border-gray-300 focus_border-action-hover;
	}
	select.addShadow:not([disabled]) {
		@apply shadow-sm;
	}
	select[multiple] {
		@apply px-2;
	}

	/* TODO: sort out how to apply custom styles to selected option background color
	select[multiple] option:checked {
		@apply bg-action-hover;
	} */

	/* Can enable select styles for warning state if wanted, but since these are 
	   optional UX is preferrable to reserve added visual weight for errors alone

	select.hasWarning:not([disabled]) {
		@apply text-yellow-700 placeholder-yellow-400  focus_ring-yellow-500 focus_border-yellow-500;
	}
	select.addBorder.hasWarning:not([disabled]) {
		@apply border-yellow-500;
	} */

	select.hasError:not([disabled]) {
		@apply text-red-700 placeholder-red-400 focus_ring-red-500 focus_border-red-500;
	}
	select.addBorder.hasError:not([disabled]) {
		@apply border-red-500;
	}

	/* additional helpful psuedo classes that can be styled
	https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#ui_pseudo-classes
	select:required {}
	select:optional {}
	select:user-invalid {}
	 */

	select.addBorder[disabled] {
		@apply border-opacity-40;
	}
	select.addShadow[disabled] {
		@apply shadow-none;
	}

	.description-block {
		@apply text-xs text-gray-500;
	}
	:not(.optionInputGroup) .description-block {
		@apply mt-2;
	}
	:not(.optionInputGroup) .error-block {
		@apply mt-2;
	}
	:not(.optionInputGroup) .description-block + .error-block {
		@apply mt-1;
	}
</style>
