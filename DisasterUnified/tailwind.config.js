/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'inter': ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        'jakarta': ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      colors: {
        'teal': {
          300: '#5eead4',
          400: '#2dd4bf',
          500: '#14b8a6',
        },
        'cyan': {
          400: '#22d3ee',
        },
        'emerald': {
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
        },
        'amber': {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
        },
        'indigo': {
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-down': 'slideDown 0.4s ease-out',
        'message-appear': 'messageAppear 0.5s ease-out',
        'badge-bounce': 'badgeBounce 0.6s ease-in-out',
        'typing-indicator': 'typingIndicator 0.3s ease-out',
        'waveform': 'waveform 1s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(-10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          'from': { opacity: '0', transform: 'translateY(-20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        messageAppear: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to': { opacity: '1', transform: 'translateX(0)' },
        },
        badgeBounce: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        typingIndicator: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        waveform: {
          '0%, 100%': { height: '20px' },
          '50%': { height: '40px' },
        },
      },
    },
  },
  plugins: [],
}
