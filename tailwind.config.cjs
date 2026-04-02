/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: '#FF6B61',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(ellipse at center, rgba(255,107,97,0.12), transparent 40%)',
      },
    },
  },
  plugins: [],
};
