/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { 50:'#eef1fb',100:'#d9e0f5',200:'#b3c0eb',300:'#8497d6',400:'#566bb5',500:'#37498f',600:'#263574',700:'#1a2556',800:'#111a42',900:'#0b1230',950:'#070b21' },
        violet: { 50:'#f5f3ff',100:'#ede9fe',200:'#ddd6fe',300:'#c4b5fd',400:'#a78bfa',500:'#8b5cf6',600:'#7c3aed',700:'#6d28d9',800:'#5b21b6',900:'#4c1d95' }
      },
      fontFamily: { sans: ['Inter','Plus Jakarta Sans','ui-sans-serif','system-ui','Segoe UI','Roboto','sans-serif'] },
      boxShadow: { soft: '0 10px 30px -12px rgba(17,26,66,.25)', glow: '0 12px 40px -8px rgba(124,58,237,.45)' },
      keyframes: {
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(14px)' }, '100%': { opacity: 1, transform: 'none' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } }
      },
      animation: { fadeUp: 'fadeUp .5s ease both', float: 'float 6s ease-in-out infinite' }
    }
  },
  plugins: []
};
