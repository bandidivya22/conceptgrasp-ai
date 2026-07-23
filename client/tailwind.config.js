/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        accent: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
        },
        navy: {
          950: '#020710',
          900: '#050B18',
          850: '#070e1e',
          800: '#080f20',
          750: '#0a1428',
          700: '#0d1b33',
          600: '#0f2040',
          500: '#132847',
          400: '#1a3560',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'neon':       '0 0 24px rgba(59,130,246,0.4), 0 0 48px rgba(59,130,246,0.15)',
        'neon-sm':    '0 0 12px rgba(59,130,246,0.25)',
        'neon-xs':    '0 0 6px rgba(59,130,246,0.2)',
        'neon-cyan':  '0 0 20px rgba(6,182,212,0.35)',
        'glass':      '0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        'glass-sm':   '0 4px 16px rgba(0,0,0,0.4)',
        'card-glow':  '0 0 0 1px rgba(59,130,246,0.12), 0 8px 32px rgba(0,0,0,0.5)',
        'card-hover': '0 0 0 1px rgba(59,130,246,0.3), 0 8px 40px rgba(59,130,246,0.12), 0 16px 48px rgba(0,0,0,0.5)',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-in-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'wave':       'wave-drift 10s ease-in-out infinite alternate',
        'float':      'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'wave-drift': {
          '0%':   { transform: 'translateX(0) scaleY(1)' },
          '100%': { transform: 'translateX(-4%) scaleY(1.06)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px rgba(59,130,246,0.2)' },
          '50%':      { boxShadow: '0 0 24px rgba(59,130,246,0.5)' },
        },
      },
    },
  },
  plugins: [],
};
