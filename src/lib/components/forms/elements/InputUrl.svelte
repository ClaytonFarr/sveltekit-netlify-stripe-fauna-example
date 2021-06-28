<script>
	import PrefixedInput from './PrefixedInput.svelte';

	// Input Pass-Through Props
	// -------------------------------------------------------------------------------------------

	// input options
	const uid = Math.floor(Math.random() * 10000000);
	let type = 'text'; // using text type to allow custom validation rules that don't require leading 'http://'
	export let prefix = 'http://';
	export let name = `${type}-${uid}`;
	export let id = name ? `${name}-${uid}` : `${type}-${uid}`;
	export let tabindex = null;
	export let placeholder = null;
	export let value = null;
	export let disabled = null;
	export let readonly = null;
	export let autofocus = null;
	export let autocomplete = null;
	export let inputmode = null;
	export let list = null;
	export let multiple = null;
	export let min = null;
	export let minLength = null;
	export let max = null;
	export let maxLength = null;
	export let step = null;
	export let size = null;

	export let containerClasses = '';
	export let inputContainerClasses = '';
	export let inputClasses = '';
	export let inheritFontSize = false;
	export let rounded = true;
	export let border = true;
	export let bgFill = !border ? true : false;
	export let shadow = true; // won't be applied, irrespective of value, if border is false

	// label & description options
	export let label = null;
	export let labelHidden = false;
	export let showRequiredHint = true;
	export let note = null;

	// standard validation options
	export let validateOnMount = false;
	export let validateOnInput = false;
	export let validationObjectName = 'URL';
	export let required = null;
	export let pattern = '^(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()!@:%_\\+.~#?&\\/\\/=]*)';
	export let patternMessage = 'Please enter a valid web address.';

	// optional custom validation
	export let customValidation = {};
</script>

<template lang="pug">
  div(class='relative {containerClasses}')
    PrefixedInput(
			'{prefix}'
      '{type}'
      bind:value='{value}'
      '{name}'
      '{id}'
      '{label}'
      '{labelHidden}'
      '{note}'
      '{tabindex}'
      '{placeholder}'
      '{disabled}'
      '{readonly}'
      '{autofocus}'
      '{autocomplete}'
      '{inputmode}'
      '{list}'
      '{multiple}'
      '{min}'
      '{minLength}'
      '{max}'
      '{maxLength}'
      '{step}'
      '{size}'
      '{inheritFontSize}'
      '{rounded}'
      '{border}'
      '{bgFill}'
      '{shadow}'
      '{required}'
      '{showRequiredHint}'
      '{validateOnMount}'
      '{validateOnInput}'
      '{validationObjectName}'
      '{pattern}'
      '{patternMessage}'
      '{customValidation}'
      containerClasses='{inputContainerClasses}'
      '{inputClasses}'
			on:input
			on:blur
      )
</template>
