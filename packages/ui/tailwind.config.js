/** @type {import('tailwindcss').Config} */
export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	theme: {
		extend: {
			colors: {
				background: {
					primary: "var(--bg-primary)",
					secondary: "var(--bg-secondary)",
					accent: "var(--bg-accent)",
				},
				text: {
					primary: "var(--text-primary)",
					secondary: "var(--text-secondary)",
					accent: "var(--text-accent)",
					info: "var(--text-info)",
				},
				primary: "var(--primary)",
				secondary: "var(--secondary)",
				accent: "var(--accent)",
				info: "var(--info)",
				danger: "var(--danger)",
			},
		},
		keyframes: {
			"in-top": {
				"0%, 100%": { transform: "translateY(-5%)", opacity: "0.5" },
				"100%": { opacity: "1", transform: "translateY(-0%)" },
			},
			"in-opacity": {
				"0%": { opacity: "0" },
				"100%": { opacity: "1" },
			},
			"in-top-dialog": {
				from: { opacity: "0", transform: "translate(-50%, -48%) scale(0.96)" },
				to: { opacity: "1", transform: "translate(-50%, -50%) scale(1)" },
			},
		},
		animation: {
			"in-top": "in-top 0.1s cubic-bezier(0.16, 1, 0.3, 1)",
			"in-opacity": "in-opacity 0.1s ease-in-out",
			"in-top-dialog": "in-top-dialog 150ms cubic-bezier(0.16, 1, 0.3, 1)",
		},
	},
	plugins: [],
};
