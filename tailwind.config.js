/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pastel: {
          pink:   '#FFB3C6',
          purple: '#C8A8E9',
          mint:   '#A8E6CF',
          yellow: '#FFE4A0',
          blue:   '#A8D8EA',
          peach:  '#FFCBA4',
        },
        town: {
          sky:    '#E8F4FD',
          ground: '#C8E6C9',
          path:   '#F5DEB3',
        },
      },
      fontFamily: {
        cute: ['"M PLUS Rounded 1c"', 'sans-serif'],
      },
      animation: {
        float:  'float 3s ease-in-out infinite',
        shake:  'shake 0.4s ease-in-out',
        popIn:  'popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        damage: 'damage 0.8s ease-out forwards',
        pulse2: 'pulse2 2s ease-in-out infinite',
      },
      keyframes: {
        float:  { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        shake:  { '0%,100%': { transform: 'translateX(0)' }, '20%': { transform: 'translateX(-6px)' }, '40%': { transform: 'translateX(6px)' }, '60%': { transform: 'translateX(-4px)' }, '80%': { transform: 'translateX(4px)' } },
        popIn:  { '0%': { transform: 'scale(0)', opacity: '0' }, '100%': { transform: 'scale(1)', opacity: '1' } },
        damage: { '0%': { transform: 'translateY(0)', opacity: '1' }, '100%': { transform: 'translateY(-60px)', opacity: '0' } },
        pulse2: { '0%,100%': { transform: 'scale(1)' }, '50%': { transform: 'scale(1.05)' } },
      },
    },
  },
  plugins: [],
}
