import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  content: [
    './components/**/*.{vue,js,ts}',
    './pages/**/*.vue',
    './app.vue',
    './layouts/**/*.vue'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: '#f4f6f9',
          100: '#e5eaf1',
          200: '#c9d4e2',
          300: '#a1b3ca',
          400: '#728cab',
          500: '#4f6a8c',
          600: '#3b5170',
          700: '#2d3f58',
          800: '#1e2c40',
          900: '#122540',
          950: '#0b1826'
        },
        amber: {
          50: '#fff8ec',
          400: '#f5a623',
          500: '#e0900f',
          600: '#c17a0a'
        },
        moss: {
          50: '#effbf3',
          400: '#3fae64',
          500: '#249450',
          600: '#1c7a41'
        },
        clay: {
          50: '#fdf0ef',
          100: '#fbdedb',
          400: '#e5674f',
          500: '#d14a34',
          600: '#b23a27'
        }
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        card: '0 1px 2px rgba(18, 37, 64, 0.06), 0 4px 16px -4px rgba(18, 37, 64, 0.08)',
        popover: '0 12px 32px -8px rgba(11, 24, 38, 0.28)'
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' }
        }
      },
      animation: {
        'fade-in': 'fade-in 0.18s ease-out',
        'scale-in': 'scale-in 0.15s ease-out'
      }
    }
  },
  plugins: []
}
