/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        sidebar: '#1A1F2E',
        canvas: '#F0F2F7',
        brand: {
          50: '#EEF1F8',
          100: '#D9E0F0',
          500: '#3B4F7A',
          600: '#2E3F63',
          700: '#243050',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        headline: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        code: ['"JetBrains Mono"', 'monospace'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        'card': '0 1px 3px 0 rgba(26, 31, 46, 0.06), 0 1px 2px -1px rgba(26, 31, 46, 0.04)',
        'elevated': '0 10px 15px -3px rgba(26, 31, 46, 0.08), 0 4px 6px -4px rgba(26, 31, 46, 0.04)',
      },
    },
  },
  plugins: [],
}
