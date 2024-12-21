import type { Config } from "tailwindcss";
import tailwind from "ui/tailwind.config.ts";

export default {
    content: [
        "./src/**/*.{ts,tsx}",
        "../../packages/ui/src/**/*.{ts,tsx}",
        "../../packages/invoice/src/**/*.{ts,tsx}",
    ],
    presets: [tailwind],
} satisfies Config
