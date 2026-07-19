/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        background: 'var(--color-background)',
        textMain: 'var(--color-text-main)',
      },
      fontFamily: {
        headline: ['"Playfair Display"', '"Amiri"', 'Georgia', 'serif'],
        body:     ['"Noto Serif"', '"Noto Serif Arabic"', 'serif'],
        label:    ['"Plus Jakarta Sans"', '"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
