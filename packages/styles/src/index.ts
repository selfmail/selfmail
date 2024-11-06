// tailwind config for the other projects
import type { Config } from "tailwindcss";

export default {
    darkMode: "class",
    content: [
        "./pages/**/*.{ts,tsx}",
        "./components/**/*.{ts,tsx}",
        "./app/**/*.{ts,tsx}",
        "./src/**/*.{ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: "var(--bg-main)",
                    secondary: "var(--bg-secondary)",
                    tertiary: "var(--bg-tertiary)"
                },
                text: {
                    DEFAULT: "var(--text-primary)",
                    secondary: "var(--text-secondary)",
                    tertiary: "var(--text-tertiary)"
                },
                border: {
                    DEFAULT: "var(--border)",
                    secondary: "var(--border-secondary)"
                },
                hover: {
                    bg: "var(--hover-bg)",
                    text: "var(--hover-text)"
                },
                highlight: {
                    DEFAULT: "var(--highlight)"
                }
            }
        },
    },
} satisfies Config