/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        bg: { DEFAULT: '#07090f', 2: '#0d1117', 3: '#13181f', 4: '#1a2030' },
        purple: { DEFAULT: '#8b5cf6', dark: '#7c3aed', light: '#a78bfa', faint: 'rgba(139,92,246,0.1)' },
        indigo: { DEFAULT: '#6366f1', light: '#818cf8' },
      },
      animation: {
        'fade-up': 'fadeUp 0.4s ease',
        'slide-in': 'slideIn 0.25s ease',
        'pulse-dot': 'pulseDot 2s infinite',
        'spin-slow': 'spin 0.7s linear infinite',
      },
      keyframes: {
        fadeUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        slideIn: { from: { opacity: 0, transform: 'translateX(-8px)' }, to: { opacity: 1, transform: 'translateX(0)' } },
        pulseDot: { '0%,100%': { opacity: 1, transform: 'scale(1)' }, '50%': { opacity: 0.4, transform: 'scale(1.3)' } },
      },
      backgroundImage: {
        'grad-purple': 'linear-gradient(135deg, #7c3aed, #6366f1)',
        'grad-green': 'linear-gradient(135deg, #059669, #0d9488)',
        'grad-hero': 'linear-gradient(135deg, #f1f5f9 30%, #c4b5fd 70%, #818cf8)',
        'grad-hero2': 'linear-gradient(135deg, #818cf8, #c084fc, #e879f9)',
        'grid-pattern': 'linear-gradient(rgba(139,92,246,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.03) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
}