<script>
	import Modal from '$lib/components/Modal.svelte';

  // form demo values
	import { Input, InputPassword } from '$lib/components/forms';
  let email, emailConfirmation, password;
</script>

<template lang="pug">

  // Modal has a built-in display for an inline affordance

  .flex.flex-col.space-y-6

    // Defaults to button with 'Open' label
    Modal(
      modalHeading="I'm a Modal"
      )
      p(slot="content") ‘Are their heads off?’ shouted the Queen.


    Modal(
      modalHeading="I'm a Dangerous Modal"
      affordanceButtonLabel="Careful"
      danger='{true}'
    )
      p(slot="content") ‘Are their heads off?’ shouted the Queen.


    // Can change to inline text instead
    .flex.space-x-1
      p I'm text that has a
      Modal(
        affordanceIsButton='{false}'
        affordanceText='modal link'
        )
        p(slot="content") ‘Are their heads off?’ shouted the Queen.
      p inline.


    // Can use fragments to load structured content
    Modal(
      affordanceButtonLabel='Multiple paragraphs'
      )
      svelte:fragment(slot="content")
        .space-y-3
          p ‘Are their heads off?’ shouted the Queen.
          p ‘I suppose so,’ said Alice.
          p At this moment the door of the house opened, and a large plate came skimming out, straight at the Footman’s head: it just grazed his nose, and broke to pieces against one of the trees behind him.


    // Can use fragments to load structured content
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
