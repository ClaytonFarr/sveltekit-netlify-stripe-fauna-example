<script>
	import Modal from '$lib/components/Modal.svelte';

  // form demo values
	import { Input, InputPassword } from '$lib/components/forms';
  let email, emailConfirmation, password;
</script>

<template lang="pug">

  .prose.mb-10
    h1(class='!mb-2 !text-3xl') Svelte modal component
    p.text-sm.text-gray-500.leading-6 By default component displays an inline affordance, as button or link. Can be configured to optionally display multiple or 0 actions, text and/or form content, and custom headings and icons. Modal will close via click on background or 'escape' key.
    p.text-sm.text-gray-500.leading-6 See #[a(href="https://github.com/ClaytonFarr/sveltekit-netlify-stripe-fauna-example/blob/master/src/lib/components/Modal.svelte") component code] for all configuration options.

  .space-y-8

    .text-sm
      p.mb-3: em Defaults to button with 'Open' label
      Modal(
        modalHeading="I'm a Modal"
        )
        p(slot="content") ‘Are their heads off?’ shouted the Queen.

    .text-sm
      p.mb-3: em Can quickly set styles for destructive actions
      Modal(
        modalHeading="I'm a Dangerous Modal"
        affordanceButtonLabel="Careful"
        danger='{true}'
      )
        p(slot="content") ‘Are their heads off?’ shouted the Queen.


    .text-sm
      p.mb-3: em Can change to inline text instead
      .flex.space-x-1
        p I'm text that has a
        Modal(
          affordanceIsButton='{false}'
          affordanceText='modal link'
          )
          p(slot="content") ‘Are their heads off?’ shouted the Queen.
        p inline.


    .text-sm
      p.mb-3: em Can use fragments to load structured content
      Modal(
        affordanceButtonLabel='Multiple paragraphs'
        )
        svelte:fragment(slot="content")
          .space-y-3
            p ‘Are their heads off?’ shouted the Queen.
            p ‘I suppose so,’ said Alice.
            p At this moment the door of the house opened, and a large plate came skimming out, straight at the Footman’s head: it just grazed his nose, and broke to pieces against one of the trees behind him.

    .text-sm
      p.mb-3: em Can contain text and/or form inputs
      Modal(
        affordanceButtonLabel='With Inputs'
        modalHasInput='{true}'
        )
        svelte:fragment(slot="inputs")
          Input(
              label='New Email Address' 
              type='email'
              required='{true}'
              showRequiredHint='{false}'
              bind:value='{email}'
              )
          Input(
            label='Confirm Email Address' 
            note='Important - Please take a moment to double check your new address.'
            type='email'
            required='{true}'
            showRequiredHint='{false}'
            bind:value='{emailConfirmation}'
            pattern='{email}'
            patternMessage='Email addresses do not match.'
            )
          InputPassword(
            label='Current Password' 
            bind:value='{password}'
            required='{true}'
            showRequiredHint='{false}'
            )

</template>
