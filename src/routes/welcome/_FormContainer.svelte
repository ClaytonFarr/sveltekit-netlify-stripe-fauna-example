<script>
	export let heading = 'Heading';
	const businessName = import.meta.env.VITE_BUSINESS_NAME;
</script>

<template lang="pug">

  // Header
  img.w-auto.h-12(src='/app-logo-mark.svg' alt='{businessName}' height='48')
  h2.mt-6.text-3xl.font-extrabold.text-gray-900 {heading}
  +if('$$slots.subheading')
    p.mt-3.text-gray-600.max-w
      slot(name='subheading')

  // Content
  slot(name='content')

</template>
