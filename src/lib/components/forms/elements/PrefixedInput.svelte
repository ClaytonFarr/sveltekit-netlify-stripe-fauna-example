<script>
	import { onMount } from 'svelte';
	import Errors from './Errors.svelte';

	// Input Options
	// -------------------------------------------------------------------------------------------
	let thisInput;
	const uid = Math.floor(Math.random() * 10000000);
	export let type = 'text'; // text, email, password, url, tel, date, month, week, time, datetime-local, search
	export let prefix = 'Prefix';
	export let name = `${type}-${uid}`;
	export let id = `${type}-${uid}`;
	export let tabindex = null;
	export let placeholder = null;
	export let value = null;
	export let disabled = null;
	export let readonly = null;
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

	// Input Style Options
	// -------------------------------------------------------------------------------------------
	export let containerClasses = '';
	export let inputClasses = '';
	export let inheritFontSize = false;
	export let rounded = true;
	export let border = true;
	export let bgFill = !border ? true : false;
	export let shadow = true; // won't be applied, irrespective of value, if border is false

	// Label & Description Options
	// -------------------------------------------------------------------------------------------
	export let label = null;
	export let labelHidden = false;
	export let showRequiredHint = true; // toggles display of asterisk next to label for required fields
	export let note = null;

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
		// clear & re-check for current errors or warnings
		errors = [];
		warnings = [];
		thisInput.checkValidity(); // will fire 'invalid' event if any of standard constraints fail
		if (customValidation?.errors?.length || customValidation?.warnings?.length) {
			checkCustomValidation(); // will test custom rules and populate any related errors/warnings
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
		value = e.target.value;
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

<div class="flex flex-col {containerClasses}" {...$$restProps}>
	{#if label}
		<label for={id} id="{id}-label" class:hide={labelHidden} class="block font-medium text-gray-700 mb-3">
			{label}
			{#if required && showRequiredHint}
				<abbr title="Required" class="font-normal text-gray-500">*</abbr>
			{/if}
		</label>
	{/if}
	<div
		class="inputGroup"
		class:inheritFontSize
		class:addRounding={rounded}
		class:addBg={bgFill}
		class:addBorder={border}
		class:addShadow={shadow && border}
		class:hasWarning={warnings.length !== 0}
		class:hasError={errors.length !== 0}
		class:disabled
	>
		<span class="prefix">{prefix}</span>
		<!-- svelte-ignore a11y-autofocus -->
		<input
			bind:this={thisInput}
			{name}
			{id}
			{type}
			{tabindex}
			{placeholder}
			{value}
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
			{required}
			{pattern}
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
	</div>
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

	.inputGroup {
		@apply flex;
	}

	.prefix {
		@apply inline-flex items-center px-3 bg-gray-50 text-gray-500;
	}
	.inputGroup:not(.inheritFontSize) .prefix {
		@apply text-sm;
	}
	.inputGroup.addRounding .prefix {
		@apply rounded-l-md;
	}
	.inputGroup.addBg .prefix {
		@apply bg-gray-200;
	}
	.inputGroup.addBorder .prefix {
		@apply border border-r-0 border-gray-300;
	}
	.inputGroup.prefix {
		@apply shadow-sm;
	}

	input {
		@apply flex-1 min-w-0 block w-full py-2 px-3 appearance-none text-gray-700 border border-transparent focus_outline-none;
	}
	.inputGroup:not(.inheritFontSize) input {
		@apply text-sm;
	}
	.inputGroup.addRounding input {
		@apply rounded-none rounded-r-md;
	}
	.inputGroup.addBg input {
		@apply bg-gray-100 focus_bg-transparent;
	}
	.inputGroup.addBorder input:not([readonly]) {
		@apply border-gray-300;
	}
	input:not([readonly], [disabled]) {
		@apply placeholder-gray-400 focus_ring-action-hover focus_border-action-hover;
	}
	input[readonly] {
		@apply bg-transparent focus_ring-transparent focus_border-transparent cursor-default pointer-events-none;
	}
	.inputGroup.addShadow input:not([readonly], [disabled]) {
		@apply shadow-sm;
	}

	/* Can enable input styles for warning state if wanted, but since these are 
	   optional UX is preferrable to reserve added visual weight for errors alone

	.inputGroup.hasWarning input:not([readonly], [disabled]) {
		@apply text-yellow-700 placeholder-yellow-400  focus_ring-yellow-500 focus_border-yellow-500;
	}
	.inputGroup.addBorder.hasWarning input:not([readonly], [disabled]),
	.inputGroup.addBorder.hasWarning .prefix {
		@apply border-yellow-500;
	} */

	.inputGroup.hasError input:not([readonly], [disabled]) {
		@apply text-red-700 placeholder-red-400  focus_ring-red-500 focus_border-red-500;
	}
	.inputGroup.addBorder.hasError input:not([readonly], [disabled]),
	.inputGroup.addBorder.hasError .prefix {
		@apply border-red-500;
	}

	/* additional helpful psuedo classes that can be styled
	https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#ui_pseudo-classes
	input:placeholder-shown {}
	input:required {}
	input:optional {}
	input:user-invalid {}
	 */

	.inputGroup.disabled input,
	.inputGroup.disabled .prefix {
		@apply !border-opacity-40 !shadow-none;
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
