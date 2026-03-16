/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-primary': '#22c55e',
        'brand-primary-soft': '#16a34a',
        'brand-surface': 'rgba(15,23,42,0.7)',
        'brand-border': 'rgba(51,65,85,0.7)',
        'brand-text': '#f9fafb',
        'brand-text-muted': '#9ca3af',
        'brand-accent': '#4ade80',
      },
      backgroundImage: {
        'app-gradient':
          'linear-gradient(to bottom right, #020617, #020617, #020617)',
      },
    },
  },
  plugins: [],
}
