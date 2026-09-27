/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F5F3EE',
        foreground: '#1C1B18',
        accent: {
          DEFAULT: '#9C5636',
          hover: '#8A4B2E'
        },
        border: {
          DEFAULT: 'rgba(28, 27, 24, 0.12)',
          strong: 'rgba(28, 27, 24, 0.15)',
          subtle: 'rgba(28, 27, 24, 0.10)'
        }
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        body: ['"Inter"', 'system-ui', 'sans-serif']
      }
    }
  },
  plugins: []
}
