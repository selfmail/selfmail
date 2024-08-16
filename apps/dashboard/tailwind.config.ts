import { getIconCollections, iconsPlugin } from "@egoist/tailwindcss-icons";
import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import { fontFamily } from "tailwindcss/defaultTheme";
export default {
	content: ["./src/**/*.tsx"],
	theme: {
		extend: {
			fontFamily: {
				sans: ["var(--font-geist-sans)", ...fontFamily.sans],
			},
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
	plugins: [
		iconsPlugin({ collections: getIconCollections(["lucide"]) }),
		animate,
	],
} satisfies Config;
