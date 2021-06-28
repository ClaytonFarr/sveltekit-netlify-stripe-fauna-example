<script>
	import { onMount } from 'svelte';
	import Errors from './Errors.svelte';

	// Textarea Options
	// -------------------------------------------------------------------------------------------
	let thisTextarea;
	const uid = Math.floor(Math.random() * 10000000);
	export let name = `textarea-${uid}`;
	export let id = `${name}-${uid}`;
	export let tabindex = null;
	export let placeholder = null;
	export let value = '';
	export let disabled = null;
	export let readonly = null;
	export let rows = 5;
	export let cols = 30;
	export let nonResizable = readonly || disabled ? true : false;
	export let autofocus = null; // boolean, **use thoughtfully** (https://tinyurl.com/inputautofocus)
	export let autocomplete = null; // hint for form autofill feature; not a boolean (https://tinyurl.com/inputautocomplete)
	export let inputmode = null; // hint to browsers as to the type of virtual keyboard configuration to use (https://tinyurl.com/inputmodeattr)
	export let minLength = null; // minimum number of characters of value
	export let maxLength = null; // maximum number of characters of value

	// Textarea Style Options
	// -------------------------------------------------------------------------------------------
	export let containerClasses = '';
	export let textareaClasses = '';
	export let inheritFontSize = false;
	export let leftPadding = readonly ? false : true;
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
	// blurs textarea first time and then 2) as user inputs data (after previous blur)
	export let validateOnMount = false; // if true, will validate textarea and show any errors when component is mounted
	export let validateOnInput = false; // if true, will validate textarea and show any errors when user first touches input
	export let validationObjectName = 'text'; // can be used to customize default error messages; e.g. 'credit card'
	export let required = null;

	let touched = false;
	let blurred = false;
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
	// 			pattern: 'apples',
	// 			messageIfMatch: true,
	// 			message: "Please don't mention apples. That ended poorly the first time.",
	// 		},
	// 	],
	// 	warnings: [
	// 		{
	// 			pattern: '[\\.]',
	// 			messageIfMatch: false,
	// 			message: 'Consider adding some periods. Like Hemingway.',
	// 		},
	// 	],
	// };

	// Handlers
	// -------------------------------------------------------------------------------------------
	function checkValidity() {
		// clear & re-check for current errors or warnings
		errors = [];
		warnings = [];
		thisTextarea.checkValidity(); // will fire 'invalid' event if any of standard constraints fail
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
		let autofocused = thisTextarea.className.includes('autofocused') || thisTextarea.hasAttribute('autofocus');
		if (touched) blurred = true;
		if (touched) checkValidity();
		if (!touched & required && !autofocused) checkValidity();
	}

	function invalidHandler() {
		// Standard Validation Messages
		if (thisTextarea.validity.valueMissing) errors = ['This field is required.'];
		if (thisTextarea.validity.badInput || thisTextarea.validity.typeMismatch) errors = [`Please enter valid ${validationObjectName}.`];
		if (thisTextarea.validity.tooShort)
			errors = [`${validationObjectName.charAt(0).toUpperCase() + validationObjectName.slice(1)}  must be at least ${minLength} characters.`];
		if (thisTextarea.validity.tooLong)
			errors = [`${validationObjectName.charAt(0).toUpperCase() + validationObjectName.slice(1)} must be at less than ${minLength} characters.`];
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
	<!-- svelte-ignore a11y-autofocus -->
	<textarea
		bind:this={thisTextarea}
		{name}
		{id}
		{tabindex}
		{rows}
		{cols}
		{placeholder}
		{disabled}
		{readonly}
		{autofocus}
		{autocomplete}
		{inputmode}
		{minLength}
		{maxLength}
		{required}
		class:inheritFontSize
		class:leftPadding
		class:nonResizable
		class:addRounding={rounded}
		class:addBg={bgFill}
		class:addBorder={border}
		class:addShadow={shadow}
		class:hasWarning={warnings.length !== 0}
		class:hasError={errors.length !== 0}
		class={textareaClasses}
		aria-required={required ? true : null}
		aria-disabled={disabled ? true : null}
		aria-labelledby={label ? `${id}-label` : null}
		aria-describedby={note ? `${id}-description` : null}
		aria-invalid={errors.length !== 0 ? true : null}
		on:input={inputHandler}
		on:blur={blurHandler}
		on:invalid={invalidHandler}>{value}</textarea>
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

	textarea {
		@apply block w-full py-2 px-0 appearance-none text-gray-700 border border-transparent focus_outline-none;
	}
	textarea.addRounding {
		@apply rounded-md;
	}
	textarea.addBg {
		@apply bg-gray-100 focus_bg-transparent;
	}
	textarea.leftPadding {
		@apply px-3;
	}
	textarea:not(.inheritFontSize) {
		@apply text-sm;
	}
	textarea.addBorder:not([readonly]) {
		@apply border-gray-300;
	}
	textarea.nonResizable {
		@apply resize-none;
	}
	textarea:not([readonly], [disabled]) {
		@apply placeholder-gray-400 focus_ring-action-hover focus_border-action-hover;
	}
	textarea[readonly] {
		@apply bg-transparent focus_ring-transparent focus_border-transparent cursor-default pointer-events-none;
	}
	textarea.addShadow:not([readonly], [disabled]) {
		@apply shadow-sm;
	}

	/* Can enable styles for warning state if wanted, but since these are 
	   optional UX is preferrable to reserve added visual weight for errors alone

	textarea.hasWarning:not([readonly], [disabled]) {
		@apply text-yellow-700 placeholder-yellow-400  focus_ring-yellow-500 focus_border-yellow-500;
	}
	textarea.addBorder.hasWarning:not([readonly], [disabled]) {
		@apply border-yellow-500;
	} */

	textarea.hasError:not([readonly], [disabled]) {
		@apply text-red-700 placeholder-red-400  focus_ring-red-500 focus_border-red-500;
	}
	textarea.addBorder.hasError:not([readonly], [disabled]) {
		@apply border-red-500;
	}

	/* additional helpful psuedo classes that can be styled
	https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input#ui_pseudo-classes
	textarea:placeholder-shown {}
	textarea:required {}
	textarea:optional {}
	textarea:user-invalid {}
	 */

	textarea.addBorder[disabled] {
		@apply border-opacity-40;
	}
	textarea.addShadow[disabled] {
		@apply shadow-none;
	}

	.description-block {
		@apply text-xs text-gray-500 mt-2;
	}
	.error-block {
		@apply mt-2;
	}
	.description-block + .error-block {
		@apply mt-1;
	}
</style>
