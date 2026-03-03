/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ms-blue': '#0f6cbd',
        'ms-green': '#107c10',
        'ms-orange': '#d83b01',
        'ms-yellow': '#ffaa44',
        'ms-slate': '#f3f2f1',
        'ms-dark-blue': '#001a40',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
        'slideUp': 'slideUp 0.3s cubic-bezier(0.1, 0.9, 0.2, 1)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      boxShadow: {
        'elevation-2': '0 1px 2px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)',
        'elevation-4': '0 2px 4px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)',
        'elevation-8': '0 4px 8px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)',
        'elevation-16': '0 8px 16px rgba(0,0,0,0.04), 0 0 2px rgba(0,0,0,0.06)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
