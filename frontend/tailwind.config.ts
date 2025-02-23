import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'slide-in-left': 'slide-in-left .3s ease-in-out',
        'slide-up': 'slide-up .3s ease-in-out',
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20)', opacity: "0", scale: "0.9" },
          '100%': { transform: 'translateY(0)', opacity: "1", scale: "1" },
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
