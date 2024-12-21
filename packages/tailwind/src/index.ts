import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.tsx", "./apps/**/*.tsx", "./components/**/*.tsx"],
    theme: {
        extend: {},
    },
    plugins: [],
} satisfies Config;