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
    prefix: "",
    theme: {
        extend: {
            colors: {
                background: {
                    DEFAULT: "var(--background)",
                    secondary: "var(--background-secondary)",
                    primary: "var(--background-primary)"
                },
                foreground: {
                    DEFAULT: "var(--foreground)",
                    secondary: "var(--foreground-secondary)"
                },
                border: {
                    DEFAULT: "var(--border)",
                    secondary: "var(--border-secondary)"
                },
                highlight: {
                    DEFAULT: "var(--highlight)"
                }
            }
        },
    },
} satisfies Config