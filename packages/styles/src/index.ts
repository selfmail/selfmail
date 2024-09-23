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
        container: {
        },
        extend: {
        },
    },
    plugins: [
        await import("tailwindcss-animate")
    ],
} satisfies Config