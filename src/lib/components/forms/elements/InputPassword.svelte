<script>
	import Input from './Input.svelte';
	import Button from './Button.svelte';

	// Input Pass-Through Props
	// -------------------------------------------------------------------------------------------

	// input options
	const uid = Math.floor(Math.random() * 10000000);
	let type = 'password';
	export let name = `${type}-${uid}`;
	export let id = name ? `${name}-${uid}` : `${type}-${uid}`;
	export let tabindex = null;
	export let placeholder = null;
	export let value = null;
	export let disabled = null;
	export let readonly = null;
	export let autofocus = null;
	export let autocomplete = null;
	export let minLength = null;
	export let maxLength = null;
	export let size = null;

	export let containerClasses = '';
	export let inputContainerClasses = '';
	export let inputClasses = '';
	export let inheritFontSize = false;
	export let leftPadding = readonly ? false : true;
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
	export let validateOnInput = true;
	export let validationObjectName = 'password';
	export let required = null;
	export let pattern = null;
	export let patternMessage = null;

	// optional custom validation
	export let customValidation = {};

	export let newPassword = false;
	if (newPassword)
		customValidation = {
			errors: [
				{
					pattern: 'password',
					messageIfMatch: true,
					message: "Please choose a password that doesn't include the word 'password'.",
				},
			],
			warnings: [
				{
					pattern: '[\\s]',
					messageIfMatch: false,
					message: 'Consider adding spaces for a stronger password.',
				},
			],
		};

	let obscureText = true;
	$: inputType = obscureText ? 'password' : 'text';
	$: buttonLabel = obscureText ? 'Show' : 'Hide';

	const buttonClickHandler = () => (obscureText = !obscureText);
</script>

<template lang="pug">
  div(class='relative {containerClasses}')
    Input(
      type='{inputType}'
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
      '{minLength}'
      '{maxLength}'
      '{size}'
      '{inheritFontSize}'
      '{leftPadding}'
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
    +if('!disabled && !readonly')
      div(class='absolute right-0' style="{label ? 'top: 2.25rem;' : 'top: 0;'}")
        Button(
          label='{buttonLabel}'
          type='button'
          level='tertiary'
          size='inline'
          hoverable='{false}'
          on:click='{buttonClickHandler}'
          )
</template>
