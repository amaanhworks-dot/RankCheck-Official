/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0a0a0f',
        surface: '#131318',
        border: '#27272e',
        primary: '#a855f7',
        'primary-glow': '#c084fc',
        'text-secondary': '#9ca3af',
      },
      fontFamily: {
        heading: ['Orbitron', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'primary-glow': '0 0 20px rgba(168, 85, 247, 0.5)',
        'primary-glow-lg': '0 0 40px rgba(168, 85, 247, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
