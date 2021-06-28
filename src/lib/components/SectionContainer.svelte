<script>
	// Used to wrap blocks content in commonly stlyed header(s)
	// E.g. groups of Settings content

	export let heading = 'Section Heading';
	export let subheading = '';
	export let danger = false;
	export let headingClasses = 'text-lg font-medium text-gray-900';
	danger ? (headingClasses += ' text-red-600') : (headingClasses += ' text-gray-900');
</script>

<template lang="pug">

  section.mb-8
    .pb-5.border-b.border-gray-200
      h1(class='{headingClasses}') {heading}
      +if('subheading')
        p.text-gray-500.max-w-2xl.mt-3 {subheading}
    .divide-y.divide-gray-200
      slot

</template>
