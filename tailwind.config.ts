import type { Config } from 'tailwindcss';

const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
      },
      screens: {
        '2xl': '1280px',
      },
    },
    extend: {
      colors: {
        canvas: withOpacity('--color-canvas'),
        surface: withOpacity('--color-surface'),
        elevated: withOpacity('--color-elevated'),
        line: withOpacity('--color-line'),
        fg: withOpacity('--color-fg'),
        muted: withOpacity('--color-muted'),
        primary: {
          DEFAULT: withOpacity('--color-primary'),
          hover: withOpacity('--color-primary-hover'),
          fg: withOpacity('--color-primary-fg'),
        },
        link: withOpacity('--color-link'),
        accent: withOpacity('--color-accent'),
        'accent-fg': withOpacity('--color-accent-fg'),
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        danger: withOpacity('--color-danger'),
        ring: withOpacity('--color-ring'),
        navy: {
          950: '#050914',
          900: '#070B1A',
          850: '#0A1226',
          800: '#0D152B',
          700: '#131F3D',
        },
        electric: {
          400: '#8B6DFF',
          500: '#6A46F5',
          600: '#5B3BD6',
        },
      },
      fontFamily: {
        sans: ['var(--font-ui)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        arabic: ['"Noto Sans Arabic Variable"', '"Plus Jakarta Sans Variable"', 'sans-serif'],
      },
      fontSize: {
        'display-sm': [
          'clamp(2.125rem, 5vw, 2.75rem)',
          { lineHeight: '1.1', letterSpacing: '-0.03em' },
        ],
        'display-md': [
          'clamp(2.5rem, 6vw, 3.5rem)',
          { lineHeight: '1.06', letterSpacing: '-0.035em' },
        ],
        'display-lg': [
          'clamp(2.75rem, 8vw, 4.5rem)',
          { lineHeight: '1.02', letterSpacing: '-0.04em' },
        ],
      },
      borderRadius: {
        card: '1.25rem',
        panel: '1.75rem',
        pill: '9999px',
      },
      boxShadow: {
        card: '0 20px 50px -30px rgb(2 6 23 / 0.75)',
        glow: '0 0 45px -12px rgb(124 92 255 / 0.55)',
        'glow-cyan': '0 0 35px -12px rgb(34 211 238 / 0.45)',
        focus: '0 0 0 3px rgb(var(--color-ring) / 0.45)',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, rgb(124 92 255) 0%, rgb(34 211 238) 100%)',
        'hero-radial':
          'radial-gradient(ellipse 65% 55% at 50% -10%, rgb(124 92 255 / 0.22), transparent 70%)',
        'grid-faint':
          'linear-gradient(to right, rgb(var(--color-line) / 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgb(var(--color-line) / 0.35) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid-faint': '48px 48px',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'soft-pulse': {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '0.85', transform: 'scale(1.06)' },
        },
        spin: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
        float: 'float 7s ease-in-out infinite',
        shimmer: 'shimmer 1.8s infinite',
        'soft-pulse': 'soft-pulse 9s ease-in-out infinite',
        'spin-slow': 'spin 28s linear infinite',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
} satisfies Config;
