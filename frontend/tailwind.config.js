/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        advent: {
          blue: '#003767',
          'blue-dark': '#003366',
          gold: '#c59b27',
          teal: '#0d9488',
          black: '#000000',
          white: '#FFFFFF',
          neutral: '#F4F4F4',
          border: '#E5E7EB',
          text: '#111827',
          muted: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        brand: ['AdventSansLogo', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        section: '20px',
      },
      maxWidth: {
        site: '1380px',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        modalSlideUp: {
          '0%': { opacity: '0', transform: 'scale(0.96) translateY(12px)' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        modalSlideUp: 'modalSlideUp 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        shimmer: 'shimmer 2s infinite linear',
      },
    },
  },
  plugins: [],
};
