import { type Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";
import {iconsPlugin, getIconCollections} from "@egoist/tailwindcss-icons"
import animate from "tailwindcss-animate"
export default {
  content: ["./src/**/*.tsx"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", ...fontFamily.sans],
      },
    },
  },
  plugins: [
    iconsPlugin({ collections: getIconCollections(['lucide']) }), 
    animate, 
  ],
} satisfies Config;
