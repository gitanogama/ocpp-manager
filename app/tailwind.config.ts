import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
	content: [
		'./src/**/*.{html,js,svelte,ts}',
		'./node_modules/svelte-daisy-toast/dist/**/*.{js,svelte}'
	],

	theme: {
		extend: {}
	},

	plugins: [typography, require('daisyui')],
	daisyui: {
		themes: 'light',
		darkTheme: false,
		base: true,
		styled: true,
		utils: true,
		logs: false
	}
} satisfies Config;
