/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        canvas:     '#0D0D12',
        surface:    '#13131A',
        surface2:   '#1A1A26',
        border:     '#2A2A3E',
        gold:       '#C9A84C',
        'gold-dim': '#8A6F2E',
        indigo:     '#6366F1',
        muted:      '#6B7280',
        body:       '#9CA3AF',
      },
      fontFamily: {
        sans: ['Space Grotesk', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease both',
      },
    },
  },
  plugins: [],
}