import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

export default {
    content: ["./src/**/*.tsx", "./apps/**/*.tsx", "./components/**/*.tsx"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-geist-sans)", ...fontFamily.sans],
            },
            colors: {
                background: {
                    DEFAULT: "var(--background)",
                    secondary: "var(--background-secondary)",
                    contrast: "var(--background-contrast)",
                },
                foreground: {
                    DEFAULT: "var(--foreground)",
                },
                border: {
                    DEFAULT: "var(--border)",
                },
                input: {
                    DEFAULT: "var(--input)",
                },
                primary: {
                    DEFAULT: "var(--primary)",
                    foreground: "var(--primary-foreground)",
                },
                secondary: {
                    DEFAULT: "var(--secondary)",
                    foreground: "var(--secondary-foreground)",
                },
                accent: {
                    DEFAULT: "var(--accent)",
                    foreground: "var(--accent-foreground)",
                },
                destructive: {
                    DEFAULT: "var(--destructive)",
                    foreground: "var(--destructive-foreground)",
                },
                ring: {
                    DEFAULT: "var(--ring)",
                },
                radius: {
                    DEFAULT: "var(--radius)",
                },
            },
        },
    },
    plugins: [],
} satisfies Config;