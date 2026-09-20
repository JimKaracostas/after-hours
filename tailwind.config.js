/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        canvas: '#141615',
        panel: '#1D201E',
        raised: '#252925',
        cream: '#F3F0E7',
        ink: '#25251F',
        muted: '#A8AFA3',
        amber: '#E5B979',
        sage: '#B4C8A0',
        line: '#343A33',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        medium: ['Inter', 'sans-serif'],
        semibold: ['Inter', 'sans-serif'],
        bold: ['Inter', 'sans-serif'],
        serif: ['Lora', 'serif'],
        'serif-medium': ['Lora', 'serif'],
        'serif-italic': ['Lora', 'serif'],
      },
    },
  },
  plugins: [],
};
