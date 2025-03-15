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
        'fade-up': 'fade-up .3s ease-in-out',
        'fade-down': 'fade-down .3s ease-in-out forwards',
        'fade-in': 'fade-in .3s ease-in-out',
        'fade-out': 'fade-out .3s ease-in-out forwards',
      },
      keyframes: {
        'slide-in-left': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20)', opacity: "0", scale: "0.9" },
          '100%': { transform: 'translateY(0)', opacity: "1", scale: "1" },
        },
        'fade-up': {
          '0%': { opacity: "0", transform: 'translateY(20)', scale: "0.9" },
          '100%': { opacity: "1", transform: 'translateY(0)', scale: "1" },
        },
        'fade-down': {
          '0%': { opacity: "1", transform: 'translateY(0)', scale: "1" },
          '100%': { opacity: "0", transform: 'translateY(20)', scale: "0.9" },
        },
        'fade-in': {
          '0%': { opacity: "0" },
          '100%': { opacity: "1" },
        },
        'fade-out': {
          '0%': { opacity: "1" },
          '100%': { opacity: "0" },
        },
      }
    },
  },
  plugins: [],
} satisfies Config;
