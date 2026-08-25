/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        advent: {
          blue: '#003767',
          'blue-dark': '#003366',
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
        brand: ['AdventSansLogo', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        section: '20px',
      },
      maxWidth: {
        site: '1380px',
      },
    },
  },
  plugins: [],
};
