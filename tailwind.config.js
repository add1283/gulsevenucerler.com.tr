/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'lora': ['Lora', 'serif'],
        'nunito': ['Nunito', 'sans-serif'],
      },
      colors: {
        // Zen ve huzur veren soft renk paleti
        primary: {
          50: '#f6fdf9',
          100: '#e8f9f0',
          200: '#d4f2e1',
          300: '#afe7ca',
          400: '#7dd3aa',
          500: '#52c085',
          600: '#3ea76a',
          700: '#328455',
          800: '#2b6845',
          900: '#24553a',
        },
        secondary: {
          50: '#fefdf8',
          100: '#fcf8e8',
          200: '#f8efd0',
          300: '#f2e1ab',
          400: '#eacf7e',
          500: '#e2ba52',
          600: '#d4a539',
          700: '#b08a2f',
          800: '#8f6f2b',
          900: '#785c28',
        },
        accent: {
          50: '#faf8ff',
          100: '#f3efff',
          200: '#e9e2ff',
          300: '#d6c7ff',
          400: '#bca0ff',
          500: '#a076ff',
          600: '#8b4ff7',
          700: '#7a3ae3',
          800: '#6631bf',
          900: '#552b9c',
        },
        // Zen grays - daha soft ve organic
        zen: {
          50: '#fafaf9',
          100: '#f4f4f3',
          200: '#e8e8e6',
          300: '#d3d3d0',
          400: '#a8a8a3',
          500: '#8b8b85',
          600: '#73736e',
          700: '#5d5d58',
          800: '#4a4a46',
          900: '#3c3c39',
        },
        // Soft pastels for backgrounds
        sage: {
          50: '#f8faf9',
          100: '#f0f5f2',
          200: '#e1ebe4',
          300: '#c8d8cd',
          400: '#a8c2af',
          500: '#86a991',
          600: '#6b8c75',
          700: '#56735f',
          800: '#475c4e',
          900: '#3c4c42',
        }
      },
      backgroundImage: {
        'zen-gradient': 'linear-gradient(135deg, #f6fdf9 0%, #faf8ff 50%, #fefdf8 100%)',
        'healing-gradient': 'linear-gradient(135deg, #e8f9f0 0%, #f3efff 50%, #fcf8e8 100%)',
        'meditation-gradient': 'linear-gradient(135deg, #d4f2e1 0%, #e9e2ff 30%, #f8efd0 100%)',
        'aurora-gradient': 'linear-gradient(135deg, #52c085 0%, #a076ff 50%, #e2ba52 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 1.2s ease-out',
        'slide-up': 'slideUp 0.8s ease-out',
        'gentle-pulse': 'gentlePulse 4s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 3s ease-in-out infinite alternate',
        'zen-breath': 'zenBreath 8s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        gentlePulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-20px) rotate(1deg)' },
          '66%': { transform: 'translateY(-10px) rotate(-1deg)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(82, 192, 133, 0.3)' },
          '100%': { boxShadow: '0 0 40px rgba(160, 118, 255, 0.4)' },
        },
        zenBreath: {
          '0%, 100%': { transform: 'scale(1) rotate(0deg)', opacity: '0.7' },
          '25%': { transform: 'scale(1.1) rotate(1deg)', opacity: '0.9' },
          '50%': { transform: 'scale(1.2) rotate(0deg)', opacity: '1' },
          '75%': { transform: 'scale(1.1) rotate(-1deg)', opacity: '0.9' },
        }
      },
      backdropBlur: {
        'xs': '2px',
      },
      boxShadow: {
        'zen': '0 4px 20px rgba(82, 192, 133, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)',
        'healing': '0 8px 32px rgba(160, 118, 255, 0.15), 0 3px 6px rgba(0, 0, 0, 0.08)',
        'meditation': '0 12px 40px rgba(226, 186, 82, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)',
        'aurora': '0 16px 48px rgba(82, 192, 133, 0.2), 0 6px 12px rgba(160, 118, 255, 0.1)',
      }
    },
  },
  plugins: [],
}
