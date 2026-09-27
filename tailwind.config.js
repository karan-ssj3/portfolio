/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        lumen: {
          DEFAULT: '#FFFFEB',
          dark: '#E4E4D0'
        },
        vast: '#1A1A1A',
        fathom: '#034F46',
        dawn: '#F0D7FF',
        signal: '#FFBCF2',
        glow: '#FFA946',
        flare: '#FF6C4C',
        pulse: '#7F1C34',
        // Legacy aliases (recoloured) so existing class names keep compiling
        background: '#FFFFEB',
        foreground: '#1A1A1A',
        accent: {
          DEFAULT: '#034F46',
          hover: '#1A1A1A'
        },
        border: {
          DEFAULT: 'rgba(26, 26, 26, 0.12)',
          strong: 'rgba(26, 26, 26, 0.15)',
          subtle: 'rgba(26, 26, 26, 0.10)'
        }
      },
      fontFamily: {
        serif: ['EB Garamond', 'Georgia', 'serif'],
        sans: ['Figtree', 'system-ui', 'sans-serif'],
        // Legacy aliases
        display: ['EB Garamond', 'Georgia', 'serif'],
        body: ['Figtree', 'system-ui', 'sans-serif']
      },
      borderRadius: {
        slab: '48px',
        card: '24px'
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.16,1,0.3,1)',
        inout: 'cubic-bezier(0.65,0,0.35,1)'
      }
    }
  },
  plugins: []
}
