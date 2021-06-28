import sveltePreprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-netlify';

/** @type {import('@sveltejs/kit').Config} */

const config = {
	preprocess: [
		sveltePreprocess({
			postcss: true
		}),
	],
	kit: {
		target: '#svelte',
		adapter: adapter(),
		files: {
      assets: "static",
    }
	},
};

export default config;
