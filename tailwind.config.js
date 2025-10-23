/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#faf8f6',
          100: '#f5f0ec',
          200: '#eaddd6',
          300: '#dcc5b8',
          400: '#caa691',
          500: '#b58a6f',
          600: '#a47760',
          700: '#8a6450',
          800: '#734c2d', // Primary color from design tokens
          900: '#5d3d24',
        },
        accent: {
          50: '#f4f9f5',
          100: '#e6f3e8',
          200: '#cee6d2',
          300: '#a7d1b0',
          400: '#8fbc94', // Accent color from design tokens
          500: '#6ba071',
          600: '#4f7d54',
          700: '#3f6443',
          800: '#345037',
          900: '#2c422f',
        },
        earth: {
          50: '#faf9f7',
          100: '#f4f1ed',
          200: '#e8e0d8',
          300: '#d8cbbf',
          400: '#c5b2a1',
          500: '#b39786',
          600: '#9e7f6b',
          700: '#856858',
          800: '#6e564a',
          900: '#5b473f',
        },
        // NostrTheme purple colors
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#8B5CF6', // NostrTheme primary
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
        },
        // NostrTheme orange colors
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // NostrTheme accent
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        gray: {
          50: '#f9fafb',  // NostrTheme background
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
      },
      fontFamily: {
        serif: ['var(--font-jakarta)', 'ui-serif', 'serif'],
        sans: ['var(--font-noto)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: '16px', // Base font size from design tokens
      },
      spacing: {
        base: '16px', // Medium spacing from design tokens
      },
      borderRadius: {
        default: '12px', // Default border radius from design tokens
        '2xl': '1rem',   // NostrTheme
        '3xl': '1.5rem', // NostrTheme
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.6s ease-out',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
