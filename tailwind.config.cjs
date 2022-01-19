const defaultTheme = require('tailwindcss/defaultTheme')

// Connect extended colors in manner that still allows them to
// utilize Tailwind's opacity utilities (text-opacity, etc.)
// https://github.com/adamwathan/tailwind-css-variable-text-opacity-demo
function cssVarHslHelper(cssVariable) {
  return ({ opacityVariable, opacityValue }) => {
    if (opacityValue !== undefined) {
      return `hsla(var(--${cssVariable}), ${opacityValue})`;
    }
    if (opacityVariable !== undefined) {
      return `hsla(var(--${cssVariable}), var(${opacityVariable}, 1))`;
    }
    return `hsl(var(--${cssVariable}))`;
  };
}

module.exports = {
	mode: "jit",
	separator: '_',
	purge: {
		content: ["./src/**/*.{html,js,svelte,ts}"],
		options: {
      keyframes: true,
    },
	},
	theme: {
		extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
			colors: {
				brand: {
					lightest: cssVarHslHelper('color-brand-lightest'),
					light: cssVarHslHelper('color-brand-light'),
					DEFAULT: cssVarHslHelper('color-brand-default'),
					dark: cssVarHslHelper('color-brand-dark'),
				},
				action: {
					highlight: cssVarHslHelper('color-action-highlight'),
					hover: cssVarHslHelper('color-action-hover'),
					DEFAULT: cssVarHslHelper('color-action-default'),
					focus: cssVarHslHelper('color-action-focus'),
				},
			}
    },
	},
	plugins: [
		require('@tailwindcss/typography'),
    require('@tailwindcss/forms'),
  ],
};

// discussion about TW supporting dynamically Svelte generated class names
// https://github.com/tailwindlabs/tailwindcss/discussions/1731