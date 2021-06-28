<script>
	import { onMount } from 'svelte';
	import Errors from './Errors.svelte';

	// Input Options
	// -------------------------------------------------------------------------------------------
	let thisInput;
	const uid = Math.floor(Math.random() * 10000000);
	export let type = 'text'; // text, email, password, url, tel, checkbox, radio, number, range, date, month, week, time, datetime-local, search, file, image, color, hidden
	export let indexInGroup = null; // can be used to create explicit ids for inputs within radio and checkbox groups (value must be > 0)
	export let name = type === 'radio' ? 'radiogroup' : `${type}-${uid}`; // set safe default for radiogroups if no name is passed
	export let id = indexInGroup ? `${name}-${indexInGroup}` : `${type}-${uid}`;
	export let tabindex = null;
	export let placeholder = null;
	export let value = null;
	export let disabled = null;
	export let readonly = null;
	export let checked = false; // boolean, used for checkbox / radio inputs
	export let indeterminate = null; // boolean, used for checkbox inputs (https://tinyurl.com/inputindeterminate)
	export let autofocus = null; // boolean, **use thoughtfully** (https://tinyurl.com/inputautofocus)
	export let autocomplete = null; // hint for form autofill feature; not a boolean (https://tinyurl.com/inputautocomplete)
	export let inputmode = null; // hint to browsers as to the type of virtual keyboard configuration to use (https://tinyurl.com/inputmodeattr)
	export let list = null; // id for <datalist> of autocomplete options
	export let multiple = null; // boolean of whether to allow multiple values
	export let min = null; // minimum value for numeric types
	export let minLength = null; // minimum number of characters of value
	export let max = null; // maximum value for numeric types
	export let maxLength = null; // maximum number of characters of value
	export let step = null; // incremental values that are valid for numeric types
	export let size = null; // size of control for text , email, password, tel types (https://tinyurl.com/inputsize)
	export let alt = null; // alt attribute for the image type; required for accessibility
	export let src = null; // for image type; specifying the URL of the image file to display to represent the graphical submit button
	export let height = null; // for image type; same as height attribute for <img>
	export let width = null; // for image type; same as width attribute for <img>
	export let capture = null; // media capture input method in file upload controls
	export let accept = null; // hint for expected file type in file upload controls

	if (!value && type === 'color') value = '#ffffff';

	// Input Style Options
	// -------------------------------------------------------------------------------------------
	export let containerClasses = '';
	export let inputClasses = '';
	export let inheritFontSize = false;
	export let leftPadding = readonly ? false : true;
	export let rounded = true;
	export let border = true;
	export let bgFill = !border ? true : false;
	export let shadow = true; // won't be applied, irrespective of value, if border is false

	let nonStyledTypes = ['range', 'file', 'image', 'color', 'hidden']; // inputs that have a unique control that shouldn't recieve standard styling options

	// Label & Description Options
	// -------------------------------------------------------------------------------------------
	export let label = null;
	export let labelHidden = false;
	export let labelWeightNormal = false; // toggles weight from default 'medium' to 'normal'; useful for checkbox/radio groups with a heading
	export let optionLabelRight = type === 'checkbox' || type === 'radio' ? true : false; // toggles which side of checkbox/radio input is displayed on
	export let showRequiredHint = true; // toggles display of asterisk next to label for required fields
	export let note = null;

	if (!alt && label) alt = label;

	// Standard Validation Options
	// -------------------------------------------------------------------------------------------
	// By default, validation and display of error messages will occur 1) after user
	// blurs an input first time and then 2) as user inputs data (after previous blur)
	export let validateOnMount = false; // if true, will validate input and show any errors when component is mounted
	export let validateOnInput = false; // if true, will validate input and show any errors when user first touches input
	export let validationObjectName = type; // can be used to customize default error messages; e.g. 'credit card'
	export let required = null;
	export let pattern = null; // regex 'pattern' value must match to be valid; only applies to text, email, url, tel, password, search type inputs (https://tinyurl.com/inputpattern2)
	export let patternMessage = null; // can be used to pass a custom error message when pattern fails

	let touched = false;
	let blurred = false;
	let errors = [];
	let warnings = [];

	// Native validation for phone numbers seems to be unreliable across browsers
	if (type === 'tel') {
		pattern = '^[+]?[(]?[0-9]{3}[)]?[-s.]?[0-9]{3}[-s.]?[0-9]{4,6}$';
		patternMessage = 'Please enter a valid phone number.';
		validationObjectName = 'phone number';
	}

	// Optional Custom Validation
	// -------------------------------------------------------------------------------------------
	// - expects an object with 'errors' and/or 'warnings' arrays of rules (as objects)
	// - first property 'pattern' is regex to evaluate input's value against
	// - second property 'messageIfMatch' is a boolean that determines if message is displayed when pattern matches or misses
	// - third property 'message' is error message displayed when pattern & messageIfMatch align
	// - if multiple errors exists they will be displayed one at a time, in the order added to the arrays
	// - if errors and warnings are both present, errors will be shown first
	// - if a standard 'pattern' is also included (above) & if a value is present, it will be tested before customValidation rules
	export let customValidation = {};
	// example
	// customValidation = {
	// 	errors: [
	// 		{
	// 			pattern: 'password',
	// 			messageIfMatch: true,
	// 			message: "Please choose a password that doesn't include the word 'password'.",
	// 		},
	// 		{
	// 			pattern: '[*-/]',
	// 			messageIfMatch: true,
	// 			message: "You've entered a special character we're not able to use.",
	// 		},
	// 	],
	// 	warnings: [
	// 		{
	// 			pattern: '[0-9]',
	// 			messageIfMatch: false,
	// 			message: 'Consider adding numbers for a stronger password.',
	// 		},
	// 		{
	// 			pattern: '[\\s]',
	// 			messageIfMatch: false,
	// 			message: 'Consider adding spaces for a stronger password.',
	// 		},
	// 	],
	// };

	// Handlers
	// -------------------------------------------------------------------------------------------
	function checkValidity() {
		if (type !== 'hidden') {
			// clear & re-check for current errors or warnings
			errors = [];
			warnings = [];
			thisInput.checkValidity(); // will fire 'invalid' event if any of standard constraints fail
			if (customValidation?.errors?.length || customValidation?.warnings?.length) {
				checkCustomValidation(); // will test custom rules and populate any related errors/warnings
			}
		}
	}

	function checkCustomValidation() {
		customValidation?.errors?.forEach((rule) => {
			const { pattern, messageIfMatch, message } = rule;
			const regex = new RegExp(pattern, 'g');
			const validity = regex.test(value); // 'value' is Svelte variable for current value
			if ((validity && messageIfMatch) || (!validity && !messageIfMatch)) errors.push(message);
		});
		customValidation?.warnings?.forEach((rule) => {
			const { pattern, messageIfMatch, message } = rule;
			const regex = new RegExp(pattern, 'g');
			const validity = regex.test(value);
			if ((validity && messageIfMatch) || (!validity && !messageIfMatch)) warnings.push(message);
		});
	}

	onMount(() => {
		if (validateOnMount) checkValidity();
	});

	function inputHandler(e) {
		touched = true;
		if (type.match(/^(number|range)$/)) value = +e.target.value;
		else if (type.match(/^(checkbox|radio)$/)) checked = e.target.checked;
		else value = e.target.value;
		if (validateOnInput || blurred) checkValidity();
		if (!validateOnInput && blurred) checkValidity();
	}

	function blurHandler() {
		let autofocused = thisInput.className.includes('autofocused') || thisInput.hasAttribute('autofocus');
		if (touched) blurred = true;
		if (touched) checkValidity();
		if (!touched & required && !autofocused) checkValidity();
	}

	function invalidHandler() {
		// Standard Validation Messages
		if (thisInput.validity.valueMissing) errors = ['This field is required.'];
		if (thisInput.validity.badInput || thisInput.validity.typeMismatch) errors = [`Please enter valid ${validationObjectName}.`];
		if (thisInput.validity.rangeUnderflow) errors = [`Please enter a value larger than ${min}.`];
		if (thisInput.validity.rangeOverflow) errors = [`Please enter a value smaller than ${max}.`];
		if (thisInput.validity.stepMismatch) errors = [`Please enter a value in steps of '${step}'.`];
		if (thisInput.validity.tooShort)
			errors = [`${validationObjectName.charAt(0).toUpperCase() + validationObjectName.slice(1)}  must be at least ${minLength} characters.`];
		if (thisInput.validity.tooLong)
			errors = [`${validationObjectName.charAt(0).toUpperCase() + validationObjectName.slice(1)} must be at less than ${minLength} characters.`];
		if (thisInput.validity.patternMismatch && patternMessage) errors = [patternMessage];
		if (thisInput.validity.patternMismatch && !patternMessage) errors = [`Please enter valid ${validationObjectName}.`];
	}
</script>

<div class="{type === 'checkbox' || type === 'radio' ? 'optionInputBlock' : 'flex flex-col'} {containerClasses}" class:optionLabelRight {...$$restProps}>
	{#if label}
		<label
			for={id}
			id="{id}-label"
			class:hide={labelHidden}
			class="block text-gray-700 {type === 'checkbox' || type === 'radio' ? null : 'mb-3'} {labelWeightNormal ? 'font-normal' : 'font-medium'}"
		>
			{label}
			{#if required && showRequiredHint}
				<abbr title="Required" class="font-normal text-gray-500">*</abbr>
			{/if}
		</label>
	{/if}
	<!-- svelte-ignore a11y-autofocus -->
	<input
		bind:this={thisInput}
		{name}
		{id}
		{type}
		{tabindex}
		{placeholder}
		{value}
		{checked}
		{indeterminate}
		{disabled}
		{readonly}
		{autofocus}
		{autocomplete}
		{inputmode}
		{list}
		{multiple}
		{min}
		{minLength}
		{max}
		{maxLength}
		{step}
		{size}
		{alt}
		{src}
		{height}
		{width}
		{capture}
		{accept}
		{required}
		{pattern}
		class:inheritFontSize={inheritFontSize && !nonStyledTypes.includes(type)}
		class:leftPadding={leftPadding && !nonStyledTypes.includes(type) && type !== 'checkbox' && type !== 'radio'}
		class:optionInput={type === 'checkbox' || type === 'radio'}
		class:addRounding={rounded && !nonStyledTypes.includes(type) && type !== 'radio'}
		class:addBg={bgFill && !nonStyledTypes.includes(type)}
		class:addBorder={border && !nonStyledTypes.includes(type)}
		class:addShadow={shadow && border && !nonStyledTypes.includes(type)}
		class:hasWarning={warnings.length !== 0}
		class:hasError={errors.length !== 0}
		class={inputClasses}
		aria-required={required ? true : null}
		aria-disabled={disabled ? true : null}
		aria-labelledby={label ? `${id}-label` : null}
		aria-describedby={note ? `${id}-description` : null}
		aria-invalid={errors.length !== 0 ? true : null}
		on:input={inputHandler}
		on:blur={blurHandler}
		on:invalid={invalidHandler}
	/>
	<!-- using 'add' class names (e.g. 'addShadow') to avoid collisions with Tailwind class names -->
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

	input:not(.optionInput, [type='range'], [type='file'], [type='image'], [type='color']) {
		@apply block w-full py-2 px-0 appearance-none text-gray-700 border border-transparent focus_outline-none;
	}
	input[type='range'] {
		@apply border-transparent focus_outline-none;
	}
	input.addRounding:not(.optionInput) {
		@apply rounded-md;
	}
	input.optionInput {
		@apply w-4 h-4 border border-transparent text-action focus_ring-action-hover;
	}
	input.addRounding.optionInput {
		@apply rounded;
	}
	input.addBg:not(.optionInput) {
		@apply bg-gray-100 focus_bg-transparent;
	}
	input.addBg.optionInput:not(.addBorder):not(:checked) {
		@apply bg-gray-200;
	}
	input.addBg.optionInput.addBorder:not(:checked) {
		@apply bg-gray-100;
	}
	input.leftPadding {
		@apply px-3;
	}
	input:not(.inheritFontSize) {
		@apply text-sm;
	}
	input.addBorder:not([readonly]) {
		@apply border-gray-300;
	}
	input:not([readonly], [disabled], [type='range']) {
		@apply placeholder-gray-400 focus_ring-action-hover focus_border-action-hover;
	}
	input[readonly] {
		@apply bg-transparent focus_ring-transparent focus_border-transparent cursor-default pointer-events-none;
	}
	input.addShadow:not([readonly], [disabled]) {
		@apply shadow-sm;
	}

	/* Can enable input styles for warning state if wanted, but since these are 
	   optional UX is preferrable to reserve added visual weight for errors alone

	input.hasWarning:not([readonly], [disabled]) {
		@apply text-yellow-700 placeholder-yellow-400  focus_ring-yellow-500 focus_border-yellow-500;
	}
	input.addBorder.hasWarning:not([readonly], [disabled]) {
		@apply border-yellow-500;
	} */

	input.hasError:not([readonly], [disabled]) {
		@apply text-red-700 placeholder-red-400  focus_ring-red-500 focus_border-red-500;
	}
	input.addBorder.hasError:not([readonly], [disabled]) {
		@apply border-red-500;
	}

	/* additional helpful psuedo classes that can be styled
	https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#ui_pseudo-classes
	input:placeholder-shown {}
	input:required {}
	input:optional {}
	input:user-invalid {}
	 */

	input.addBorder[disabled] {
		@apply border-opacity-40;
	}
	input.addShadow[disabled] {
		@apply shadow-none;
	}
	input.optionInput[disabled] {
		@apply opacity-40;
	}

	.optionInputBlock {
		@apply inline-grid gap-x-3 gap-y-1;
		grid-template-columns: auto auto;
		align-content: baseline;
	}
	.optionInputBlock input {
		align-self: center;
	}
	.optionInputBlock .error-block {
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
	:not(.optionInputBlock) .description-block {
		@apply mt-2;
	}
	:not(.optionInputBlock) .error-block {
		@apply mt-2;
	}
	:not(.optionInputBlock) .description-block + .error-block {
		@apply mt-1;
	}
</style>
