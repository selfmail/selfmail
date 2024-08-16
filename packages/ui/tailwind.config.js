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
	},
	plugins: [],
};
