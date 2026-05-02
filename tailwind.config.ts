import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#fafaf7',
        surface: '#ffffff',
        ink: '#1a1a1a',
        'ink-2': '#4a4a4a',
        'ink-3': '#888888',
        line: '#e8e6e0',
        'line-2': '#f0eee8',
        accent: '#e8b84a',
        'accent-2': '#c89529',
        'accent-soft': '#fdf6e3',
        good: '#2d5a3f',
        'good-soft': '#eef4ee',
        warn: '#b8742a',
        'warn-soft': '#faf2e6',
        bad: '#a13d2d',
        'bad-soft': '#fbeeea',
      },
      fontFamily: {
        serif: ['var(--font-instrument-serif)', '"Instrument Serif"', 'serif'],
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'sans-serif'],
      },
      maxWidth: {
        page: '920px',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp 0.5s ease both',
      },
    },
  },
  plugins: [],
};

export default config;
