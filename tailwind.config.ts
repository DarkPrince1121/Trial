import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Design system colors
        background: '#0B0F1A',
        surface: '#111827',
        'surface-variant': '#0F172A',
        'surface-elevated': '#1a2235',
        accent: '#C9A84C',
        'accent-light': '#E8C97A',
        'accent-muted': '#8a6d2e',
        border: '#1E2D45',
        'border-subtle': '#162032',
        // Text
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
        'text-muted': '#475569',
        // Semantic
        success: '#22C55E',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-ibm-plex-mono)', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderColor: {
        DEFAULT: '#1E2D45',
      },
      animation: {
        'cursor-blink': 'cursor-blink 1s step-end infinite',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-up': 'slide-up 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'cursor-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-surface':
          'linear-gradient(135deg, #111827 0%, #0B0F1A 100%)',
        'accent-gradient':
          'linear-gradient(135deg, #C9A84C 0%, #E8C97A 100%)',
      },
      boxShadow: {
        'surface': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
        'surface-lg': '0 4px 16px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)',
        'accent': '0 0 20px rgba(201,168,76,0.15)',
        'glow': '0 0 30px rgba(201,168,76,0.1)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
    },
  },
  plugins: [],
}

export default config
