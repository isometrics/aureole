/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['var(--font-inter)'],
      },
      animation: {
        'rainbow-flow': 'rainbow-flow 4s ease-in-out infinite',
        'liquid-morph': 'liquid-morph 8s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease infinite',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'rainbow-flow': {
          '0%, 100%': { 
            backgroundPosition: '0% 50%',
            filter: 'hue-rotate(0deg)',
          },
          '50%': { 
            backgroundPosition: '100% 50%',
            filter: 'hue-rotate(180deg)',
          },
        },
        'liquid-morph': {
          '0%, 100%': { 
            transform: 'scale(1) rotate(0deg)',
            borderRadius: '0.5rem',
          },
          '25%': { 
            transform: 'scale(1.02) rotate(1deg)',
            borderRadius: '0.7rem',
          },
          '50%': { 
            transform: 'scale(1) rotate(-1deg)',
            borderRadius: '0.3rem',
          },
          '75%': { 
            transform: 'scale(0.98) rotate(0.5deg)',
            borderRadius: '0.6rem',
          },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-glow': {
          '0%, 100%': { 
            opacity: '0.5',
            transform: 'scale(1)',
          },
          '50%': { 
            opacity: '0.8',
            transform: 'scale(1.05)',
          },
        },
      },
      backgroundImage: {
        'rainbow-gradient': 'linear-gradient(124deg, #ff2400, #e81d1d, #e8b71d, #e3e81d, #1de840, #1ddde8, #2b1de8, #dd00f3, #dd00f3)',
        'liquid-rainbow': 'linear-gradient(92deg, #f35626, #feab3a, #c7dc5b, #72cbb8, #4abce8, #7c6fdb, #c346c2, #f35626)',
      },
      backgroundSize: {
        'flow': '200% 200%',
      },
    },
  },
  plugins: [],
}