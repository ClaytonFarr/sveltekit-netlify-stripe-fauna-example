<script>
	import { Form, Input, InputPassword, PrefixedInput, InputUrl, CheckboxGroup, RadioGroup, Textarea, Select, Button } from '$lib/components/forms';
	import { wait } from '$lib/utils/helpers';

	const showDevOutput = false;

	let values = {
		text_disabled: 'Disabled value.',
		text_readonly: 'Read-only value.',
		checkbox: false,
		// checkboxgroup: ['Three'],
		radio: false,
		// radiogroup: 'two',
		select_preselected: 'Three',
		textarea_disabled:
			'Disabled value. Donec ullamcorper nulla non metus auctor fringilla. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Sed posuere consectetur est at lobortis. Maecenas faucibus mollis interdum.',
		textarea_readonly:
			'Read-only value. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nulla vitae elit libero, a pharetra augue. Nulla vitae elit libero, a pharetra augue. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Nullam id dolor id nibh ultricies vehicula ut id elit.',
	};

	const passwordValidation = {
		errors: [
			{
				pattern: 'password',
				messageIfMatch: true,
				message: "Please choose a password that doesn't include the word 'password'.",
			},
			{
				pattern: '[*-/]',
				messageIfMatch: true,
				message: "You've entered a special character we're not able to use.",
			},
		],
		warnings: [
			{
				pattern: '[0-9]',
				messageIfMatch: false,
				message: 'Consider adding numbers for a stronger password.',
			},
			{
				pattern: '[\\s]',
				messageIfMatch: false,
				message: 'Consider adding spaces for a stronger password.',
			},
		],
	};

	const checkboxOptions = [
		{
			label: 'One',
			checked: false,
			indeterminate: null,
			readonly: null,
			disabled: null,
			required: true,
			value: 'one',
			note: "I'm number one.",
		},
		{ label: 'Two', value: 'two', note: 'I love number two.' },
		{ label: 'Three' },
	];

	const radioOptions = [
		{ label: 'Radio One', note: 'Hi.' },
		{ label: 'Radio Two', note: 'I like you.' },
		{ label: 'Radio Three', note: 'I like you better.' },
	];

	let formLevelError = [];

	async function submitHandler() {
		await wait(1000);
		console.log('Submitted :', values);
	}
	function dismissHandler() {
		console.log('Dismissed');
	}
</script>

<template lang="pug">

  div(class="{showDevOutput ? 'pb-48' : ''}")

    .prose.mb-10
      h1(class='!mb-2 !text-3xl') Svelte form components with customizable browser-based validation.  
      p.text-sm.text-gray-500.leading-6 By default, any validation constraints are evaluated 1) after a user completes their initial entry and then 2) interactively as values are edited in a previously touched field. This behavior can be updated to validate a field on first input and/or on page load.

      ul.text-sm.pb-2
        li: a(href='#text') Text Inputs
        li: a(href='#related') Related Inputs
        li: a(href='#special-string') Special String Inputs
        li: a(href='#numeric') Numeric Inputs
        li: a(href='#option') Option Inputs
        li: a(href='#special-functionality') Special Functionality Inputs
        li: a(href='#bespoke') Bespoke Layout Inputs
        li: a(href='#textarea') Textareas
        li: a(href='#selects') Selects
        li: a(href='#buttons') Buttons

      p.text-sm.text-gray-500.leading-6.pb-8.border-b.mb-6 See #[a(href="https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example/tree/master/src/lib/components/forms/elements") components' code] for configuration options.

    Form(
      submitLabel='Send'
      processingLabel='Processing...'
      resettable='{true}'
      resetLabel='Refresh'
      dismissible='{true}'
      dismissLabel='Nevermind'
      '{dismissHandler}'
      '{submitHandler}'
      '{formLevelError}'
      formClasses='max-w-prose'
      )

      div
        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#text.text-lg.font-semibold Text Inputs

          Input(
            placeholder='Placeholder text...'
            bind:value='{values.text}'
            )
          Input(
            label='Text (Disabled)'
            bind:value='{values.text_disabled}'
            disabled='{true}'
            )
          Input(
            label='Text (Read Only)'
            bind:value='{values.text_readonly}'
            readonly='{true}'
            )
          Input(
            label='Text (Required)'
            bind:value='{values.text_required}'
            required='{true}'
            )
          Input(
            label='Text (Standard Pattern Validation)'
            bind:value='{values.text_pattern}'
            pattern='[O|o]range'
            patternMessage="Are you certain you don't like OJ?"
            validateOnInput='{true}'
            )
          Input(
            label='Text (No Border)'
            bind:value='{values.text_no_border}'
            border='{false}'
            )
          Input(
            label='Text (No Shadow)'
            bind:value='{values.text_no_shadow}'
            shadow='{false}'
            )
          Input(
            label='Text (Non Rounded)'
            bind:value='{values.text_no_round}'
            rounded='{false}'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#related.text-lg.font-semibold Related Inputs

          h2.font-semibold.pt-2 Paired Value
          Input(
            label='Source Value (e.g. Password)'
            bind:value='{values.paired_source}'
            )
          Input(
            label='Value that must match (e.g. Password Confirm)'
            bind:value='{values.paired_match}'
            pattern='{values.paired_source}'
            patternMessage="Values don't match."
            validateOnInput='{true}'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#special-string.text-lg.font-semibold Special String Inputs

          Input(
            label='Email (Required w/o Marking)'
            type='email'
            bind:value='{values.email}'
            note="This will be your username"
            required='{true}'
            showRequiredHint='{false}'
            )
          Input(
            label='Password (Required + Custom Validation)'
            type='password'
            bind:value='{values.password}'
            required='{true}'
            customValidation='{passwordValidation}'
            )
          Input(
            label='URL'
            type='url'
            bind:value='{values.url}'
            )
          Input(
            label='Tel'
            type='tel'
            bind:value='{values.tel}'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#numeric.text-lg.font-semibold Numeric Inputs

          Input(
            label='Number (w/ Immediate Validation)'
            type='number'
            bind:value='{values.number}'
            validateOnInput='{true}'
            )
          // TODO: normalize default & focus styling to other inputs & across browsers
          Input(
            label='Range'
            type='range'
            bind:value='{values.range}'
            )
          Input(
            label='Date'
            type='date'
            bind:value='{values.date}'
            )
          Input(
            label='Month'
            type='month'
            bind:value='{values.month}'
            )
          Input(
            label='Week'
            type='week'
            bind:value='{values.week}'
            )
          Input(
            label='Time'
            type='time'
            bind:value='{values.time}'
            )
          Input(
            label='Date Time Local'
            type='datetime-local'
            bind:value='{values.datetime_local}'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#option.text-lg.font-semibold Option Inputs

          .flex.space-x-6
            Input(
              label='Checkbox'
              type='checkbox'
              note="I'm the best checkbox there is."
              bind:checked='{values.checkbox}'
              )
            Input(
              label='Radio'
              type='radio'
              bind:checked='{values.radio}'
              note="Why is there only one of me?"
              )

          CheckboxGroup(
            options='{checkboxOptions}'
            bind:group='{values.checkboxgroup}'
            groupLabel='Checkbox Group'
            )

          RadioGroup(
            options='{radioOptions}'
            bind:group='{values.radiogroup}'
            groupLabel='Radio Group'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#special-functionality.text-lg.font-semibold Special Functionality Inputs

          Input(
            label='Search'
            type='search'
            bind:value='{values.search}'
            )
          Input(
            label='File'
            type='file'
            bind:value='{values.file}'
            )
          Input(
            label='Image'
            type='image'
            bind:value='{values.image}'
            )
          Input(
            label='Color'
            type='color'
            bind:value='{values.color}'
            )
          Input(
            type='hidden'
            bind:value='{values.hidden}'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#bespoke.text-lg.font-semibold Bespoke Layout Inputs

          InputPassword(
            label='Password with Show/Hide'
            bind:value='{values.password_special}'
            )
          PrefixedInput(
            label='Prefixed Input'
            bind:value='{values.prefixed}'
            )
          InputUrl(
            label='Url'
            bind:value='{values.url}'
            )
          InputUrl(
            label='Url (Required)'
            bind:value='{values.url_required}'
            required='{true}'
            )
          InputUrl(
            label='Url (Disabled)'
            bind:value='{values.url_disabled}'
            disabled='{true}'
            )
          InputUrl(
            label='Url (No Shadow)'
            bind:value='{values.url_no_shadow}'
            shadow='{false}'
            )
          InputUrl(
            label='Url (No Border)'
            bind:value='{values.url_no_border}'
            border='{false}'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#textarea.text-lg.font-semibold Textareas

          Textarea(
            placeholder='Placeholder text...'
            bind:value='{values.textarea}'
            )
          Textarea(
            label='Textarea (Required)'
            bind:value='{values.textarea_required}'
            required='{true}'
            )
          Textarea(
            label='Textarea (No Border)'
            border='{false}'
            bind:value='{values.textarea_no_border}'
            )
          Textarea(
            label='Textarea (No Shadow)'
            shadow='{false}'
            bind:value='{values.textarea_no_shadow}'
            )
          Textarea(
            label='Textarea (Non Rounded)'
            rounded='{false}'
            bind:value='{values.textarea_no_round}'
            )
          Textarea(
            label='Textarea (Disabled)'
            disabled='{true}'
            note='I love words.'
            bind:value='{values.textarea_disabled}'
            )
          Textarea(
            label='Textarea (Read-Only)'
            readonly='{true}'
            bind:value='{values.textarea_readonly}'
            )

        fieldset.space-y-4.pb-8.border-b.mb-6
          legend#selects.text-lg.font-semibold Selects

          Select(
            bind:selected='{values.select}'
          )
          Select(
            label='Select'
            bind:selected='{values.select_labeled}'
            note="I'm full of choices."
          )
          Select(
            label='Select (Preselected Option)'
            bind:selected='{values.select_preselected}'
          )
          Select(
            label='Select (No Placholder Text)'
            bind:selected='{values.select_no_placeholder}'
            nullValueText='{null}'
          )
          Select(
            label='Select (No Null Value Default)'
            bind:selected='{values.select_no_null_default}'
            defaultToNullValue='{false}'
          )
          Select(
            label='Select (Required)'
            bind:selected='{values.select_required}'
            required='{true}'
          )
          Select(
            label='Select (No Border)'
            bind:selected='{values.select_no_border}'
            border='{false}'
          )
          Select(
            label='Select (No Shadow)'
            bind:selected='{values.select_no_shadow}'
            shadow='{true}'
          )
          Select(
            label='Select (Non Rounded)'
            bind:selected='{values.select_no_round}'
            rounded='{false}'
          )
          Select(
            label='Select (Disabled)'
            bind:selected='{values.select_disabled}'
            disabled='{true}'
          )
          Select(
            label='Select (Multiple)'
            bind:selected='{values.select_multiple}'
            multiple='{true}'
          )
          Select(
            label='Select (Multiple with Size)'
            bind:selected='{values.select_multiple_sized}'
            multiple='{true}'
            size='{2}'
          )

        fieldset.space-y-4
          legend#buttons.text-lg.font-semibold Buttons

          h2.font-semibold.pt-2 Featured Size
          .flex.space-x-6
            Button(
              label='Primary'
              size='featured'
            )
            Button(
              label='Secondary'
              size='featured'
              level='secondary'
            )
            Button(
              label='Tertiary'
              size='featured'
              level='tertiary'
            )
          
          h2.font-semibold.pt-2 Standard Size
          .flex.space-x-6
            Button(
              label='Primary'
            )
            Button(
              label='Secondary'
              level='secondary'
            )
            Button(
              label='Tertiary'
              level='tertiary'
            )
          
          h2.font-semibold.pt-2 Inline Size
          .flex.space-x-4
            Button(
              label='Primary'
              size='inline'
            )
            Button(
              label='Secondary'
              size='inline'
              level='secondary'
            )
            Button(
              label='Tertiary'
              size='inline'
              level='tertiary'
            )

      svelte:fragment(slot="actions")
        | &nbsp;

  +if('showDevOutput')
    div.fixed.left-0.right-0.bottom-0.h-48.overflow-y-auto.bg-white.p-4.border-t-2.border-black.mt-8
      pre.mb-3.text-xs
        p.mb-2: b Values
        p {JSON.stringify(values, null, 2)}
      pre.mb-3.text-xs
        p.mb-2: b Form Level Error
        p {JSON.stringify(formLevelError, null, 2)}

</template>
